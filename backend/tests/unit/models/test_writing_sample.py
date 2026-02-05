"""Tests for WritingSample model."""

import uuid

import pytest
from sqlalchemy import select

from voice_clone.models.writing_sample import SourceType, WritingSample

from tests.conftest import requires_postgres
from tests.factories import WritingSampleFactory


class TestWritingSampleModelUnit:
    """Unit tests for WritingSample model that don't require database."""

    def test_writing_sample_factory_build(self):
        """Test WritingSampleFactory builds valid instances."""
        sample = WritingSampleFactory.build()

        assert sample.id is not None
        assert sample.voice_clone_id is not None
        assert sample.source_type is not None
        assert sample.content is not None
        assert sample.word_count is not None
        assert sample.created_at is not None

    def test_source_type_paste(self):
        """Test WritingSample with PASTE source type."""
        sample = WritingSampleFactory.build(source_type=SourceType.PASTE)
        assert sample.source_type == SourceType.PASTE
        assert sample.source_type.value == "paste"

    def test_source_type_file(self):
        """Test WritingSample with FILE source type."""
        sample = WritingSampleFactory.build(source_type=SourceType.FILE)
        assert sample.source_type == SourceType.FILE
        assert sample.source_type.value == "file"

    def test_source_type_url(self):
        """Test WritingSample with URL source type."""
        sample = WritingSampleFactory.build(source_type=SourceType.URL)
        assert sample.source_type == SourceType.URL
        assert sample.source_type.value == "url"

    def test_source_url_optional(self):
        """Test WritingSample source_url is optional."""
        sample = WritingSampleFactory.build(source_url=None)
        assert sample.source_url is None

    def test_source_url_set(self):
        """Test WritingSample source_url can be set."""
        sample = WritingSampleFactory.build(source_url="https://example.com/article")
        assert sample.source_url == "https://example.com/article"

    def test_original_filename_optional(self):
        """Test WritingSample original_filename is optional."""
        sample = WritingSampleFactory.build(original_filename=None)
        assert sample.original_filename is None

    def test_original_filename_set(self):
        """Test WritingSample original_filename can be set."""
        sample = WritingSampleFactory.build(original_filename="document.pdf")
        assert sample.original_filename == "document.pdf"

    def test_word_count_stored(self):
        """Test WritingSample word_count is stored."""
        sample = WritingSampleFactory.build(word_count=100)
        assert sample.word_count == 100

    def test_writing_sample_repr(self):
        """Test WritingSample model __repr__ method."""
        sample = WritingSampleFactory.build(
            source_type=SourceType.PASTE,
            word_count=150,
        )
        assert "paste" in repr(sample)
        assert "150" in repr(sample)
        assert sample.id in repr(sample)

    def test_uuid_generation(self):
        """Test that WritingSample id is a valid UUID."""
        sample = WritingSampleFactory.build()
        parsed = uuid.UUID(sample.id)
        assert str(parsed) == sample.id


@pytest.mark.usefixtures("db_session")
@requires_postgres
class TestWritingSampleModelIntegration:
    """Integration tests for WritingSample model requiring database."""

    async def test_writing_sample_instantiation(
        self, user_factory, voice_clone_factory, writing_sample_factory
    ):
        """Test WritingSample model can be created."""
        user = await user_factory()
        clone = await voice_clone_factory(user_id=user.id)
        sample = await writing_sample_factory(
            voice_clone_id=clone.id,
            source_type=SourceType.PASTE,
            content="This is sample writing content.",
            word_count=5,
        )

        assert sample.id is not None
        assert sample.voice_clone_id == clone.id
        assert sample.source_type == SourceType.PASTE
        assert sample.content == "This is sample writing content."
        assert sample.word_count == 5
        assert sample.created_at is not None


@pytest.mark.usefixtures("db_session")
@requires_postgres
class TestWritingSampleRelationships:
    """Tests for WritingSample model relationships."""

    async def test_relationship_to_voice_clone(
        self, db_session, user_factory, voice_clone_factory, writing_sample_factory
    ):
        """Test WritingSample relationship to VoiceClone."""
        user = await user_factory()
        clone = await voice_clone_factory(user_id=user.id, name="Parent Clone")
        sample = await writing_sample_factory(voice_clone_id=clone.id)

        await db_session.refresh(sample)

        assert sample.voice_clone is not None
        assert sample.voice_clone.name == "Parent Clone"

    async def test_cascade_delete_with_voice_clone(
        self, db_session, user_factory, voice_clone_factory, writing_sample_factory
    ):
        """Test WritingSample is deleted when parent VoiceClone is deleted."""
        user = await user_factory()
        clone = await voice_clone_factory(user_id=user.id)
        sample = await writing_sample_factory(voice_clone_id=clone.id)
        sample_id = sample.id

        await db_session.delete(clone)
        await db_session.commit()

        result = await db_session.execute(
            select(WritingSample).where(WritingSample.id == sample_id)
        )
        assert result.scalar_one_or_none() is None
