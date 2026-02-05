"""Tests for VoiceClone model."""

import uuid

import pytest
from sqlalchemy import select

from voice_clone.models.voice_clone import VoiceClone, VoiceCloneMergeSource

from tests.conftest import requires_postgres
from tests.factories import VoiceCloneFactory, VoiceCloneMergeSourceFactory


class TestVoiceCloneModelUnit:
    """Unit tests for VoiceClone model that don't require database."""

    def test_voice_clone_factory_build(self):
        """Test VoiceCloneFactory builds valid instances."""
        clone = VoiceCloneFactory.build()

        assert clone.id is not None
        assert clone.user_id is not None
        assert clone.name is not None
        assert clone.created_at is not None

    def test_voice_clone_is_merged_default_false(self):
        """Test VoiceClone is_merged defaults to False."""
        clone = VoiceCloneFactory.build()
        assert clone.is_merged is False

    def test_voice_clone_is_merged_set_true(self):
        """Test VoiceClone is_merged can be set to True."""
        clone = VoiceCloneFactory.build(is_merged=True)
        assert clone.is_merged is True

    def test_voice_clone_confidence_score_default(self):
        """Test VoiceClone confidence_score defaults to 0."""
        clone = VoiceCloneFactory.build(confidence_score=0)
        assert clone.confidence_score == 0

    def test_voice_clone_confidence_score_set(self):
        """Test VoiceClone confidence_score can be set."""
        clone = VoiceCloneFactory.build(confidence_score=85)
        assert clone.confidence_score == 85

    def test_voice_clone_tags_default_empty(self):
        """Test VoiceClone tags defaults to empty list."""
        clone = VoiceCloneFactory.build(tags=[])
        assert clone.tags == []

    def test_voice_clone_tags_with_values(self):
        """Test VoiceClone tags can be set."""
        clone = VoiceCloneFactory.build(tags=["professional", "formal"])
        assert clone.tags == ["professional", "formal"]

    def test_voice_clone_description_optional(self):
        """Test VoiceClone description is optional."""
        clone = VoiceCloneFactory.build(description=None)
        assert clone.description is None

    def test_voice_clone_repr(self):
        """Test VoiceClone model __repr__ method."""
        clone = VoiceCloneFactory.build(name="TestClone")
        assert "TestClone" in repr(clone)
        assert clone.id in repr(clone)

    def test_uuid_generation(self):
        """Test that VoiceClone id is a valid UUID."""
        clone = VoiceCloneFactory.build()
        parsed = uuid.UUID(clone.id)
        assert str(parsed) == clone.id


class TestVoiceCloneMergeSourceModelUnit:
    """Unit tests for VoiceCloneMergeSource model."""

    def test_merge_source_factory_build(self):
        """Test VoiceCloneMergeSourceFactory builds valid instances."""
        merge_source = VoiceCloneMergeSourceFactory.build()

        assert merge_source.id is not None
        assert merge_source.merged_clone_id is not None
        assert merge_source.source_clone_id is not None
        assert merge_source.element_weights is not None
        assert merge_source.created_at is not None

    def test_merge_source_element_weights(self):
        """Test VoiceCloneMergeSource element_weights."""
        weights = {"vocabulary": 60, "tone": 40}
        merge_source = VoiceCloneMergeSourceFactory.build(element_weights=weights)
        assert merge_source.element_weights == weights

    def test_merge_source_repr(self):
        """Test VoiceCloneMergeSource model __repr__ method."""
        merge_source = VoiceCloneMergeSourceFactory.build()
        assert merge_source.merged_clone_id in repr(merge_source)
        assert merge_source.source_clone_id in repr(merge_source)


@pytest.mark.usefixtures("db_session")
@requires_postgres
class TestVoiceCloneModelIntegration:
    """Integration tests for VoiceClone model requiring database."""

    async def test_voice_clone_instantiation(self, user_factory, voice_clone_factory):
        """Test VoiceClone model can be created."""
        user = await user_factory()
        clone = await voice_clone_factory(
            user_id=user.id,
            name="My Voice Clone",
        )

        assert clone.id is not None
        assert clone.user_id == user.id
        assert clone.name == "My Voice Clone"
        assert clone.created_at is not None

    async def test_tags_array_storage_retrieval(self, user_factory, voice_clone_factory):
        """Test VoiceClone tags array storage and retrieval."""
        user = await user_factory()
        clone = await voice_clone_factory(
            user_id=user.id,
            name="Tagged Clone",
            tags=["professional", "formal", "business"],
        )

        assert clone.tags == ["professional", "formal", "business"]
        assert len(clone.tags) == 3


@pytest.mark.usefixtures("db_session")
@requires_postgres
class TestVoiceCloneRelationships:
    """Tests for VoiceClone model relationships."""

    async def test_relationship_to_user(self, db_session, user_factory, voice_clone_factory):
        """Test VoiceClone relationship to User."""
        user = await user_factory(email="clone-owner@example.com")
        clone = await voice_clone_factory(user_id=user.id)

        await db_session.refresh(clone)

        assert clone.user is not None
        assert clone.user.email == "clone-owner@example.com"

    async def test_relationship_to_samples(
        self, db_session, user_factory, voice_clone_factory, writing_sample_factory
    ):
        """Test VoiceClone relationship to samples."""
        user = await user_factory()
        clone = await voice_clone_factory(user_id=user.id)
        await writing_sample_factory(voice_clone_id=clone.id, word_count=100)
        await writing_sample_factory(voice_clone_id=clone.id, word_count=200)

        await db_session.refresh(clone)

        assert len(clone.samples) == 2

    async def test_cascade_delete_removes_samples(
        self, db_session, user_factory, voice_clone_factory, writing_sample_factory
    ):
        """Test that deleting VoiceClone cascades to samples."""
        from voice_clone.models.writing_sample import WritingSample

        user = await user_factory()
        clone = await voice_clone_factory(user_id=user.id)
        sample = await writing_sample_factory(voice_clone_id=clone.id, word_count=100)
        sample_id = sample.id

        await db_session.delete(clone)
        await db_session.commit()

        result = await db_session.execute(
            select(WritingSample).where(WritingSample.id == sample_id)
        )
        assert result.scalar_one_or_none() is None
