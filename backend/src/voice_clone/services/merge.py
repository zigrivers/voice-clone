"""Voice clone merging service."""

from uuid import uuid4

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from voice_clone.ai import get_ai_provider, GenerationOptions
from voice_clone.ai.prompts import build_merge_prompt
from voice_clone.exceptions import NotFoundError, BadRequestError
from voice_clone.models import VoiceClone, VoiceDnaVersion, VoiceCloneMergeSource
from voice_clone.schemas.voice_clone import MergeCloneRequest, MergeSourceConfig


class MergeService:
    """Service for merging voice clones."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_merged_clone(
        self,
        user_id: str,
        request: MergeCloneRequest,
        provider: str | None = None,
        api_key: str | None = None,
    ) -> VoiceClone:
        """Create a merged voice clone from multiple sources.

        Args:
            user_id: The user ID.
            request: Merge request with source configs.
            provider: Optional AI provider override.
            api_key: Optional API key override.

        Returns:
            The created merged VoiceClone.
        """
        # Validate source count (2-5)
        if len(request.sources) < 2:
            raise BadRequestError("At least 2 source voice clones are required for merging")
        if len(request.sources) > 5:
            raise BadRequestError("Maximum 5 source voice clones can be merged")

        # Validate total weight per element sums to 100
        self._validate_weights(request.sources)

        # Get source voice clones and their DNAs
        source_clones = []
        source_dnas = []

        for source in request.sources:
            result = await self.db.execute(
                select(VoiceClone).where(
                    VoiceClone.id == source.voice_clone_id,
                    VoiceClone.user_id == user_id,
                )
            )
            clone = result.scalar_one_or_none()

            if not clone:
                raise NotFoundError("VoiceClone", source.voice_clone_id)

            if not clone.current_dna_id:
                raise BadRequestError(
                    f"Voice clone '{clone.name}' has not been analyzed. "
                    "Run analysis before merging."
                )

            # Get DNA
            dna_result = await self.db.execute(
                select(VoiceDnaVersion).where(VoiceDnaVersion.id == clone.current_dna_id)
            )
            dna = dna_result.scalar_one_or_none()

            if not dna:
                raise BadRequestError(f"Voice DNA not found for clone '{clone.name}'")

            source_clones.append(clone)
            source_dnas.append(dna)

        # Build merge prompt
        prompt = build_merge_prompt(
            source_dnas=[d.dna_data for d in source_dnas],
            source_names=[c.name for c in source_clones],
            weights=[s.element_weights for s in request.sources],
        )

        # Generate merged DNA using AI
        ai_provider = get_ai_provider(provider, api_key)
        options = GenerationOptions(
            max_tokens=4096,
            temperature=0.3,  # Lower temperature for more consistent merging
        )

        result = await ai_provider.generate_text(prompt, options)
        merged_dna = self._parse_merged_dna(result.text)

        # Create the merged voice clone
        merged_clone = VoiceClone(
            id=str(uuid4()),
            user_id=user_id,
            name=request.name,
            description=request.description or f"Merged from: {', '.join(c.name for c in source_clones)}",
            tags=request.tags or [],
            is_merged=True,
            confidence_score=self._calculate_merged_confidence(source_clones),
        )
        self.db.add(merged_clone)

        # Create merged DNA version
        dna_version = VoiceDnaVersion(
            id=str(uuid4()),
            voice_clone_id=merged_clone.id,
            version=1,
            dna_data=merged_dna,
            analysis_metadata={
                "merge_sources": [c.id for c in source_clones],
                "merge_weights": [s.element_weights for s in request.sources],
                "provider": ai_provider.name,
            },
        )
        self.db.add(dna_version)

        # Update clone with DNA reference
        merged_clone.current_dna_id = dna_version.id

        # Create merge source records
        for source_config, clone in zip(request.sources, source_clones):
            merge_source = VoiceCloneMergeSource(
                id=str(uuid4()),
                merged_clone_id=merged_clone.id,
                source_clone_id=clone.id,
                element_weights=source_config.element_weights,
            )
            self.db.add(merge_source)

        await self.db.flush()
        return merged_clone

    def _validate_weights(self, sources: list[MergeSourceConfig]) -> None:
        """Validate that weights for each DNA element sum to 100."""
        dna_elements = [
            "vocabulary_patterns",
            "sentence_structure",
            "paragraph_structure",
            "tone_markers",
            "rhetorical_devices",
            "punctuation_habits",
            "opening_patterns",
            "closing_patterns",
            "humor_and_personality",
            "distinctive_signatures",
        ]

        for element in dna_elements:
            total_weight = sum(
                source.element_weights.get(element, 0)
                for source in sources
            )

            # Allow for some floating point tolerance
            if not (99 <= total_weight <= 101):
                raise BadRequestError(
                    f"Weights for '{element}' must sum to 100 (got {total_weight})"
                )

    def _parse_merged_dna(self, response: str) -> dict:
        """Parse AI response into merged DNA structure."""
        import json
        import re

        # Try to extract JSON from response
        json_match = re.search(r'\{[\s\S]*\}', response)
        if json_match:
            try:
                return json.loads(json_match.group())
            except json.JSONDecodeError:
                pass

        # Fallback: return empty DNA structure
        return {
            "vocabulary_patterns": {},
            "sentence_structure": {},
            "paragraph_structure": {},
            "tone_markers": {},
            "rhetorical_devices": {},
            "punctuation_habits": {},
            "opening_patterns": {},
            "closing_patterns": {},
            "humor_and_personality": {},
            "distinctive_signatures": {},
        }

    def _calculate_merged_confidence(self, source_clones: list[VoiceClone]) -> int:
        """Calculate confidence score for merged clone.

        Takes weighted average of source confidence scores.
        """
        if not source_clones:
            return 0

        total_score = sum(c.confidence_score or 0 for c in source_clones)
        return total_score // len(source_clones)

    async def get_merge_sources(self, clone_id: str) -> list[VoiceCloneMergeSource]:
        """Get merge sources for a merged clone."""
        result = await self.db.execute(
            select(VoiceCloneMergeSource).where(
                VoiceCloneMergeSource.merged_clone_id == clone_id
            )
        )
        return list(result.scalars().all())
