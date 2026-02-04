"""Voice clone service with CRUD operations and confidence scoring."""

from uuid import uuid4

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from voice_clone.exceptions import NotFoundError
from voice_clone.models import VoiceClone, WritingSample, VoiceDnaVersion
from voice_clone.schemas.voice_clone import (
    VoiceCloneCreate,
    VoiceCloneUpdate,
    VoiceCloneResponse,
    ConfidenceScoreResponse,
)


class VoiceCloneService:
    """Service for voice clone management."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_all(
        self,
        user_id: str,
        tags: list[str] | None = None,
        search: str | None = None,
        page: int = 1,
        per_page: int = 20,
    ) -> tuple[list[VoiceClone], int]:
        """Get all voice clones for a user with optional filters.

        Returns:
            Tuple of (voice_clones, total_count)
        """
        query = select(VoiceClone).where(VoiceClone.user_id == user_id)

        # Apply filters
        if tags:
            # Filter by any matching tag
            query = query.where(VoiceClone.tags.overlap(tags))

        if search:
            search_pattern = f"%{search}%"
            query = query.where(
                VoiceClone.name.ilike(search_pattern)
                | VoiceClone.description.ilike(search_pattern)
            )

        # Get total count
        count_query = select(func.count()).select_from(query.subquery())
        total = await self.db.scalar(count_query) or 0

        # Apply pagination and ordering
        query = query.order_by(VoiceClone.created_at.desc())
        query = query.offset((page - 1) * per_page).limit(per_page)

        # Load samples for count
        query = query.options(selectinload(VoiceClone.samples))

        result = await self.db.execute(query)
        clones = list(result.scalars().all())

        return clones, total

    async def get_by_id(self, clone_id: str, user_id: str | None = None) -> VoiceClone | None:
        """Get voice clone by ID, optionally filtered by user."""
        query = select(VoiceClone).where(VoiceClone.id == clone_id)
        if user_id:
            query = query.where(VoiceClone.user_id == user_id)

        query = query.options(
            selectinload(VoiceClone.samples),
            selectinload(VoiceClone.dna_versions),
        )

        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def create(self, user_id: str, data: VoiceCloneCreate) -> VoiceClone:
        """Create a new voice clone."""
        clone = VoiceClone(
            id=str(uuid4()),
            user_id=user_id,
            name=data.name,
            description=data.description,
            tags=data.tags or [],
            is_merged=False,
            confidence_score=0,
        )
        self.db.add(clone)
        await self.db.flush()
        return clone

    async def update(self, clone_id: str, user_id: str, data: VoiceCloneUpdate) -> VoiceClone:
        """Update a voice clone."""
        clone = await self.get_by_id(clone_id, user_id)
        if not clone:
            raise NotFoundError("VoiceClone", clone_id)

        if data.name is not None:
            clone.name = data.name
        if data.description is not None:
            clone.description = data.description
        if data.tags is not None:
            clone.tags = data.tags

        await self.db.flush()
        return clone

    async def delete(self, clone_id: str, user_id: str) -> bool:
        """Delete a voice clone."""
        clone = await self.get_by_id(clone_id, user_id)
        if not clone:
            return False

        await self.db.delete(clone)
        await self.db.flush()
        return True

    async def calculate_confidence_score(self, clone_id: str) -> ConfidenceScoreResponse:
        """Calculate and update confidence score for a voice clone.

        Scoring algorithm (max 100 points):
        - Word count: max 30 pts
        - Sample count: max 20 pts
        - Content type variety: max 20 pts
        - Sample length distribution: max 15 pts
        - Consistency score: max 15 pts
        """
        # Get clone with samples
        query = select(VoiceClone).where(VoiceClone.id == clone_id).options(
            selectinload(VoiceClone.samples)
        )
        result = await self.db.execute(query)
        clone = result.scalar_one_or_none()

        if not clone:
            raise NotFoundError("VoiceClone", clone_id)

        samples = clone.samples
        breakdown = {}

        # 1. Word count score (max 30 pts)
        total_words = sum(s.word_count for s in samples)
        if total_words >= 10000:
            word_score = 30
        elif total_words >= 5000:
            word_score = 25
        elif total_words >= 2500:
            word_score = 20
        elif total_words >= 1000:
            word_score = 15
        elif total_words >= 500:
            word_score = 10
        else:
            word_score = min(int(total_words / 50), 10)
        breakdown["word_count"] = word_score

        # 2. Sample count score (max 20 pts)
        sample_count = len(samples)
        if sample_count >= 10:
            sample_score = 20
        elif sample_count >= 5:
            sample_score = 15
        elif sample_count >= 3:
            sample_score = 10
        else:
            sample_score = sample_count * 3
        breakdown["sample_count"] = sample_score

        # 3. Content type variety (max 20 pts)
        # Based on variety of source types and estimated content types
        source_types = set(s.source_type.value for s in samples)
        variety_score = len(source_types) * 5
        # Bonus for having longer and shorter samples
        if samples:
            word_counts = [s.word_count for s in samples]
            has_short = any(wc < 200 for wc in word_counts)
            has_medium = any(200 <= wc < 1000 for wc in word_counts)
            has_long = any(wc >= 1000 for wc in word_counts)
            variety_score += sum([has_short, has_medium, has_long]) * 3
        breakdown["content_variety"] = min(variety_score, 20)

        # 4. Sample length distribution (max 15 pts)
        if samples:
            word_counts = [s.word_count for s in samples]
            avg_words = sum(word_counts) / len(word_counts)
            # Reward having samples of varying lengths
            if len(word_counts) >= 3:
                variance = sum((wc - avg_words) ** 2 for wc in word_counts) / len(word_counts)
                std_dev = variance ** 0.5
                # Higher std dev = more variety
                if std_dev > 500:
                    length_score = 15
                elif std_dev > 200:
                    length_score = 12
                elif std_dev > 100:
                    length_score = 8
                else:
                    length_score = 5
            else:
                length_score = len(word_counts) * 3
        else:
            length_score = 0
        breakdown["length_distribution"] = min(length_score, 15)

        # 5. Consistency score (max 15 pts)
        # Base on having DNA analysis done
        has_dna = clone.current_dna_id is not None
        if has_dna:
            consistency_score = 15
        elif sample_count >= 3:
            consistency_score = 8
        elif sample_count >= 1:
            consistency_score = 3
        else:
            consistency_score = 0
        breakdown["consistency"] = consistency_score

        # Calculate total
        total_score = sum(breakdown.values())
        total_score = min(total_score, 100)

        # Update clone's confidence score
        clone.confidence_score = total_score
        await self.db.flush()

        return ConfidenceScoreResponse(score=total_score, breakdown=breakdown)

    async def set_current_dna(self, clone_id: str, dna_id: str) -> None:
        """Set the current DNA version for a voice clone."""
        query = select(VoiceClone).where(VoiceClone.id == clone_id)
        result = await self.db.execute(query)
        clone = result.scalar_one_or_none()

        if clone:
            clone.current_dna_id = dna_id
            await self.db.flush()

    def to_response(self, clone: VoiceClone) -> VoiceCloneResponse:
        """Convert VoiceClone model to response schema."""
        samples = clone.samples if hasattr(clone, "samples") and clone.samples else []
        return VoiceCloneResponse(
            id=clone.id,
            user_id=clone.user_id,
            name=clone.name,
            description=clone.description,
            tags=clone.tags or [],
            is_merged=clone.is_merged,
            confidence_score=clone.confidence_score,
            current_dna_id=clone.current_dna_id,
            created_at=clone.created_at,
            updated_at=clone.updated_at,
            sample_count=len(samples),
            total_word_count=sum(s.word_count for s in samples),
        )
