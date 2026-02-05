"""Voice DNA analysis service."""

import json
import re
from uuid import uuid4

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from voice_clone.ai import get_ai_provider, GenerationOptions
from voice_clone.ai.prompts import build_analysis_prompt
from voice_clone.exceptions import NotFoundError, BadRequestError
from voice_clone.models import VoiceClone, VoiceDnaVersion, WritingSample, ApiUsageLog
from voice_clone.services.settings import SettingsService


class AnalysisService:
    """Service for Voice DNA analysis."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def analyze_voice_dna(
        self,
        clone_id: str,
        user_id: str,
        provider: str | None = None,
        api_key: str | None = None,
    ) -> VoiceDnaVersion:
        """Analyze writing samples to generate Voice DNA.

        Args:
            clone_id: The voice clone ID.
            user_id: The user ID.
            provider: Optional AI provider override.
            api_key: Optional API key override.

        Returns:
            New VoiceDnaVersion with the analysis results.
        """
        # Get voice clone with samples
        query = (
            select(VoiceClone)
            .where(VoiceClone.id == clone_id, VoiceClone.user_id == user_id)
            .options(selectinload(VoiceClone.samples))
        )
        result = await self.db.execute(query)
        clone = result.scalar_one_or_none()

        if not clone:
            raise NotFoundError("VoiceClone", clone_id)

        if not clone.samples:
            raise BadRequestError("Voice clone has no writing samples to analyze")

        # Get user's voice cloning instructions
        settings_service = SettingsService(self.db)
        settings = await settings_service.get_settings(user_id)

        # Build the analysis prompt
        sample_texts = [s.content for s in clone.samples]
        prompt = build_analysis_prompt(sample_texts, settings.voice_cloning_instructions)

        # Get AI provider and generate analysis
        ai_provider = get_ai_provider(provider, api_key)

        options = GenerationOptions(
            max_tokens=4096,
            temperature=0.3,  # Lower temperature for more consistent analysis
            system_prompt="You are an expert linguistic analyst. Always return valid JSON.",
        )

        result = await ai_provider.generate_text(prompt, options)

        # Parse the response
        dna_data = self._parse_dna_response(result.text)

        # Get next version number
        version_result = await self.db.execute(
            select(func.max(VoiceDnaVersion.version)).where(
                VoiceDnaVersion.voice_clone_id == clone_id
            )
        )
        max_version = version_result.scalar() or 0

        # Create new DNA version
        dna_version = VoiceDnaVersion(
            id=str(uuid4()),
            voice_clone_id=clone_id,
            version=max_version + 1,
            dna_data=dna_data,
            analysis_metadata={
                "provider": ai_provider.name,
                "model": result.model,
                "sample_count": len(clone.samples),
                "total_words": sum(s.word_count for s in clone.samples),
            },
        )
        self.db.add(dna_version)

        # Update clone's current DNA
        clone.current_dna_id = dna_version.id

        # Log API usage
        usage_log = ApiUsageLog(
            id=str(uuid4()),
            user_id=user_id,
            provider=ai_provider.name,
            operation="analyze",
            model=result.model,
            input_tokens=result.input_tokens,
            output_tokens=result.output_tokens,
            voice_clone_id=clone_id,
        )
        self.db.add(usage_log)

        await self.db.flush()
        return dna_version

    def _parse_dna_response(self, response: str) -> dict:
        """Parse the Voice DNA JSON from the AI response."""
        # Try to extract JSON from the response
        json_match = re.search(r"```json\s*(.*?)\s*```", response, re.DOTALL)
        if json_match:
            json_str = json_match.group(1)
        else:
            # Try to find raw JSON
            json_match = re.search(r"\{.*\}", response, re.DOTALL)
            if json_match:
                json_str = json_match.group(0)
            else:
                raise BadRequestError("Could not parse Voice DNA from AI response")

        try:
            return json.loads(json_str)
        except json.JSONDecodeError as e:
            raise BadRequestError(f"Invalid JSON in Voice DNA response: {e}")

    async def get_current_dna(self, clone_id: str) -> VoiceDnaVersion | None:
        """Get the current Voice DNA version for a clone."""
        result = await self.db.execute(
            select(VoiceClone).where(VoiceClone.id == clone_id)
        )
        clone = result.scalar_one_or_none()

        if not clone or not clone.current_dna_id:
            return None

        dna_result = await self.db.execute(
            select(VoiceDnaVersion).where(VoiceDnaVersion.id == clone.current_dna_id)
        )
        return dna_result.scalar_one_or_none()

    async def get_dna_versions(self, clone_id: str) -> list[VoiceDnaVersion]:
        """Get all Voice DNA versions for a clone."""
        result = await self.db.execute(
            select(VoiceDnaVersion)
            .where(VoiceDnaVersion.voice_clone_id == clone_id)
            .order_by(VoiceDnaVersion.version.desc())
        )
        return list(result.scalars().all())
