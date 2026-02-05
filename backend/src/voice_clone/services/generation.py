"""Content generation service."""

from uuid import uuid4

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from voice_clone.ai import get_ai_provider, GenerationOptions
from voice_clone.ai.prompts import build_generation_prompt
from voice_clone.exceptions import NotFoundError, BadRequestError
from voice_clone.models import VoiceClone, VoiceDnaVersion, Content, ContentStatus, ApiUsageLog
from voice_clone.schemas.content import GenerationRequest, GenerationResponse
from voice_clone.services.detection import calculate_detection_score
from voice_clone.services.settings import SettingsService, PlatformSettingsService


class GenerationService:
    """Service for content generation."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def generate_content(
        self,
        request: GenerationRequest,
        user_id: str,
        provider: str | None = None,
        api_key: str | None = None,
    ) -> GenerationResponse:
        """Generate content using a voice clone.

        Args:
            request: Generation request with parameters.
            user_id: The user ID.
            provider: Optional AI provider override.
            api_key: Optional API key override.

        Returns:
            GenerationResponse with the generated content.
        """
        # Get voice clone and validate ownership
        result = await self.db.execute(
            select(VoiceClone).where(
                VoiceClone.id == request.voice_clone_id,
                VoiceClone.user_id == user_id,
            )
        )
        clone = result.scalar_one_or_none()

        if not clone:
            raise NotFoundError("VoiceClone", request.voice_clone_id)

        # Get current DNA
        if not clone.current_dna_id:
            raise BadRequestError(
                "Voice clone has not been analyzed yet. Run analysis first."
            )

        dna_result = await self.db.execute(
            select(VoiceDnaVersion).where(VoiceDnaVersion.id == clone.current_dna_id)
        )
        dna = dna_result.scalar_one_or_none()

        if not dna:
            raise BadRequestError("Voice DNA not found")

        # Get user settings
        settings_service = SettingsService(self.db)
        settings = await settings_service.get_settings(user_id)

        # Get platform settings
        platform_service = PlatformSettingsService(self.db)
        platform_settings = await platform_service.get_by_platform(user_id, request.platform)
        platform_practices = platform_settings.best_practices if platform_settings else ""

        # Build generation prompt
        prompt = build_generation_prompt(
            voice_dna=dna.dna_data,
            anti_ai_guidelines=settings.anti_ai_guidelines,
            platform=request.platform,
            platform_practices=platform_practices,
            input_text=request.input_text,
            length=request.length or "medium",
            tone_override=request.tone_override,
            audience=request.target_audience,
            cta_style=request.cta_style,
        )

        # Generate content
        ai_provider = get_ai_provider(provider, api_key)

        options = GenerationOptions(
            max_tokens=2048,
            temperature=0.7,
        )

        result = await ai_provider.generate_text(prompt, options)
        generated_text = result.text.strip()

        # Calculate detection score
        detection_result = calculate_detection_score(generated_text, dna.dna_data)

        # Save content to database
        content = Content(
            id=str(uuid4()),
            user_id=user_id,
            voice_clone_id=clone.id,
            platform=request.platform,
            content_text=generated_text,
            input_text=request.input_text,
            properties_used={
                "length": request.length,
                "tone_override": request.tone_override,
                "target_audience": request.target_audience,
                "cta_style": request.cta_style,
                "dna_version": dna.version,
            },
            detection_score=detection_result["score"],
            detection_breakdown=detection_result["breakdown"],
            status=ContentStatus.DRAFT,
        )
        self.db.add(content)

        # Log API usage
        usage_log = ApiUsageLog(
            id=str(uuid4()),
            user_id=user_id,
            provider=ai_provider.name,
            operation="generate",
            model=result.model,
            input_tokens=result.input_tokens,
            output_tokens=result.output_tokens,
            voice_clone_id=clone.id,
        )
        self.db.add(usage_log)

        await self.db.flush()

        return GenerationResponse(
            id=content.id,
            content_text=generated_text,
            platform=request.platform,
            detection_score=detection_result["score"],
            detection_breakdown=detection_result["breakdown"],
            properties_used=content.properties_used,
        )

    async def regenerate_content(
        self,
        content_id: str,
        user_id: str,
        feedback: str | None = None,
        provider: str | None = None,
        api_key: str | None = None,
    ) -> GenerationResponse:
        """Regenerate content with optional feedback.

        Args:
            content_id: The content ID to regenerate.
            user_id: The user ID.
            feedback: Optional feedback to incorporate.
            provider: Optional AI provider override.
            api_key: Optional API key override.

        Returns:
            GenerationResponse with the regenerated content.
        """
        # Get existing content
        result = await self.db.execute(
            select(Content).where(
                Content.id == content_id,
                Content.user_id == user_id,
            )
        )
        content = result.scalar_one_or_none()

        if not content:
            raise NotFoundError("Content", content_id)

        # Create regeneration request
        request = GenerationRequest(
            voice_clone_id=content.voice_clone_id,
            platform=content.platform,
            input_text=content.input_text,
            length=content.properties_used.get("length"),
            tone_override=content.properties_used.get("tone_override"),
            target_audience=content.properties_used.get("target_audience"),
            cta_style=content.properties_used.get("cta_style"),
        )

        # If feedback provided, append to input
        if feedback:
            request.input_text = f"{content.input_text}\n\n[Feedback: {feedback}]"

        return await self.generate_content(request, user_id, provider, api_key)

    async def get_content(self, content_id: str, user_id: str) -> Content | None:
        """Get content by ID."""
        result = await self.db.execute(
            select(Content).where(
                Content.id == content_id,
                Content.user_id == user_id,
            )
        )
        return result.scalar_one_or_none()

    async def update_content(
        self,
        content_id: str,
        user_id: str,
        content_text: str | None = None,
        status: ContentStatus | None = None,
        tags: list[str] | None = None,
    ) -> Content:
        """Update content."""
        result = await self.db.execute(
            select(Content).where(
                Content.id == content_id,
                Content.user_id == user_id,
            )
        )
        content = result.scalar_one_or_none()

        if not content:
            raise NotFoundError("Content", content_id)

        if content_text is not None:
            content.content_text = content_text
            # Recalculate detection score
            detection_result = calculate_detection_score(content_text)
            content.detection_score = detection_result["score"]
            content.detection_breakdown = detection_result["breakdown"]

        if status is not None:
            content.status = status

        if tags is not None:
            content.tags = tags

        await self.db.flush()
        return content

    async def delete_content(self, content_id: str, user_id: str) -> bool:
        """Delete content."""
        result = await self.db.execute(
            select(Content).where(
                Content.id == content_id,
                Content.user_id == user_id,
            )
        )
        content = result.scalar_one_or_none()

        if not content:
            return False

        await self.db.delete(content)
        await self.db.flush()
        return True
