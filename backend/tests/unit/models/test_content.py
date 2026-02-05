"""Tests for Content model."""

import uuid

import pytest
from sqlalchemy import select

from voice_clone.models.content import Content, ContentStatus

from tests.conftest import requires_postgres
from tests.factories import ContentFactory


class TestContentModelUnit:
    """Unit tests for Content model that don't require database."""

    def test_content_factory_build(self):
        """Test ContentFactory builds valid instances."""
        content = ContentFactory.build()

        assert content.id is not None
        assert content.user_id is not None
        assert content.platform is not None
        assert content.content_text is not None
        assert content.input_text is not None
        assert content.created_at is not None

    def test_content_status_draft(self):
        """Test Content with DRAFT status."""
        content = ContentFactory.build(status=ContentStatus.DRAFT)
        assert content.status == ContentStatus.DRAFT
        assert content.status.value == "draft"

    def test_content_status_ready(self):
        """Test Content with READY status."""
        content = ContentFactory.build(status=ContentStatus.READY)
        assert content.status == ContentStatus.READY
        assert content.status.value == "ready"

    def test_content_status_published(self):
        """Test Content with PUBLISHED status."""
        content = ContentFactory.build(status=ContentStatus.PUBLISHED)
        assert content.status == ContentStatus.PUBLISHED
        assert content.status.value == "published"

    def test_content_status_archived(self):
        """Test Content with ARCHIVED status."""
        content = ContentFactory.build(status=ContentStatus.ARCHIVED)
        assert content.status == ContentStatus.ARCHIVED
        assert content.status.value == "archived"

    def test_properties_used_dict(self):
        """Test Content properties_used dict."""
        properties = {"vocabulary_level": "professional", "tone": "formal"}
        content = ContentFactory.build(properties_used=properties)
        assert content.properties_used == properties

    def test_detection_score_optional(self):
        """Test Content detection_score is optional."""
        content = ContentFactory.build(detection_score=None)
        assert content.detection_score is None

    def test_detection_score_set(self):
        """Test Content detection_score can be set."""
        content = ContentFactory.build(detection_score=85)
        assert content.detection_score == 85

    def test_detection_breakdown_optional(self):
        """Test Content detection_breakdown is optional."""
        content = ContentFactory.build(detection_breakdown=None)
        assert content.detection_breakdown is None

    def test_detection_breakdown_set(self):
        """Test Content detection_breakdown can be set."""
        breakdown = {"perplexity": 0.85, "burstiness": 0.72}
        content = ContentFactory.build(detection_breakdown=breakdown)
        assert content.detection_breakdown == breakdown

    def test_tags_default_empty(self):
        """Test Content tags defaults to empty list."""
        content = ContentFactory.build(tags=[])
        assert content.tags == []

    def test_tags_with_values(self):
        """Test Content tags can be set."""
        content = ContentFactory.build(tags=["marketing", "social"])
        assert content.tags == ["marketing", "social"]

    def test_voice_clone_id_optional(self):
        """Test Content voice_clone_id is optional."""
        content = ContentFactory.build(voice_clone_id=None)
        assert content.voice_clone_id is None

    def test_content_repr(self):
        """Test Content model __repr__ method."""
        content = ContentFactory.build(
            platform="twitter",
            status=ContentStatus.READY,
        )
        assert content.id in repr(content)
        assert "twitter" in repr(content)
        assert "ready" in repr(content)

    def test_uuid_generation(self):
        """Test that Content id is a valid UUID."""
        content = ContentFactory.build()
        parsed = uuid.UUID(content.id)
        assert str(parsed) == content.id


@pytest.mark.usefixtures("db_session")
@requires_postgres
class TestContentModelIntegration:
    """Integration tests for Content model requiring database."""

    async def test_content_instantiation(self, user_factory, content_factory):
        """Test Content model can be created."""
        user = await user_factory()
        content = await content_factory(
            user_id=user.id,
            platform="linkedin",
            content_text="Generated content here.",
            input_text="Original prompt text.",
        )

        assert content.id is not None
        assert content.user_id == user.id
        assert content.platform == "linkedin"
        assert content.content_text == "Generated content here."
        assert content.input_text == "Original prompt text."
        assert content.created_at is not None


@pytest.mark.usefixtures("db_session")
@requires_postgres
class TestContentRelationships:
    """Tests for Content model relationships."""

    async def test_relationship_to_user(self, db_session, user_factory, content_factory):
        """Test Content relationship to User."""
        user = await user_factory(email="content-owner@example.com")
        content = await content_factory(user_id=user.id)

        await db_session.refresh(content)

        assert content.user is not None
        assert content.user.email == "content-owner@example.com"

    async def test_relationship_to_voice_clone(
        self, db_session, user_factory, voice_clone_factory, content_factory
    ):
        """Test Content relationship to VoiceClone."""
        user = await user_factory()
        clone = await voice_clone_factory(user_id=user.id, name="Content Clone")
        content = await content_factory(
            user_id=user.id,
            voice_clone_id=clone.id,
        )

        await db_session.refresh(content)

        assert content.voice_clone is not None
        assert content.voice_clone.name == "Content Clone"

    async def test_cascade_delete_with_user(self, db_session, user_factory, content_factory):
        """Test Content is deleted when parent User is deleted."""
        user = await user_factory()
        content = await content_factory(user_id=user.id)
        content_id = content.id

        await db_session.delete(user)
        await db_session.commit()

        result = await db_session.execute(
            select(Content).where(Content.id == content_id)
        )
        assert result.scalar_one_or_none() is None

    async def test_voice_clone_set_null_on_delete(
        self, db_session, user_factory, voice_clone_factory, content_factory
    ):
        """Test Content voice_clone_id is set to NULL when VoiceClone is deleted."""
        user = await user_factory()
        clone = await voice_clone_factory(user_id=user.id)
        content = await content_factory(
            user_id=user.id,
            voice_clone_id=clone.id,
        )
        content_id = content.id

        await db_session.delete(clone)
        await db_session.commit()

        result = await db_session.execute(
            select(Content).where(Content.id == content_id)
        )
        updated_content = result.scalar_one_or_none()
        assert updated_content is not None
        assert updated_content.voice_clone_id is None
