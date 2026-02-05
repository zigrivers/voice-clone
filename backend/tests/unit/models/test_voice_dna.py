"""Tests for VoiceDnaVersion model."""

import uuid

import pytest
from sqlalchemy import select

from voice_clone.models.voice_dna import VoiceDnaVersion

from tests.conftest import requires_postgres
from tests.factories import VoiceDnaVersionFactory


class TestVoiceDnaVersionModelUnit:
    """Unit tests for VoiceDnaVersion model that don't require database."""

    def test_voice_dna_factory_build(self):
        """Test VoiceDnaVersionFactory builds valid instances."""
        dna = VoiceDnaVersionFactory.build()

        assert dna.id is not None
        assert dna.voice_clone_id is not None
        assert dna.version is not None
        assert dna.dna_data is not None
        assert dna.created_at is not None

    def test_dna_data_structure(self):
        """Test VoiceDnaVersion dna_data structure."""
        dna_data = {
            "vocabulary": {"complexity": "advanced"},
            "tone": {"primary": "professional"},
        }
        dna = VoiceDnaVersionFactory.build(dna_data=dna_data)
        assert dna.dna_data == dna_data
        assert dna.dna_data["vocabulary"]["complexity"] == "advanced"

    def test_version_numbering(self):
        """Test VoiceDnaVersion version numbering."""
        dna1 = VoiceDnaVersionFactory.build(version=1)
        dna2 = VoiceDnaVersionFactory.build(version=2)
        dna3 = VoiceDnaVersionFactory.build(version=3)

        assert dna1.version == 1
        assert dna2.version == 2
        assert dna3.version == 3

    def test_analysis_metadata_optional(self):
        """Test VoiceDnaVersion analysis_metadata is optional."""
        dna = VoiceDnaVersionFactory.build(analysis_metadata=None)
        assert dna.analysis_metadata is None

    def test_analysis_metadata_set(self):
        """Test VoiceDnaVersion analysis_metadata can be set."""
        metadata = {"provider": "openai", "model": "gpt-4"}
        dna = VoiceDnaVersionFactory.build(analysis_metadata=metadata)
        assert dna.analysis_metadata == metadata

    def test_voice_dna_version_repr(self):
        """Test VoiceDnaVersion model __repr__ method."""
        dna = VoiceDnaVersionFactory.build(version=5)
        assert dna.id in repr(dna)
        assert dna.voice_clone_id in repr(dna)
        assert "5" in repr(dna)

    def test_uuid_generation(self):
        """Test that VoiceDnaVersion id is a valid UUID."""
        dna = VoiceDnaVersionFactory.build()
        parsed = uuid.UUID(dna.id)
        assert str(parsed) == dna.id


@pytest.mark.usefixtures("db_session")
@requires_postgres
class TestVoiceDnaVersionModelIntegration:
    """Integration tests for VoiceDnaVersion model requiring database."""

    async def test_voice_dna_version_instantiation(
        self, user_factory, voice_clone_factory, voice_dna_version_factory
    ):
        """Test VoiceDnaVersion model can be created."""
        user = await user_factory()
        clone = await voice_clone_factory(user_id=user.id)
        dna = await voice_dna_version_factory(
            voice_clone_id=clone.id,
            version=1,
            dna_data={"vocabulary": {"level": "advanced"}},
        )

        assert dna.id is not None
        assert dna.voice_clone_id == clone.id
        assert dna.version == 1
        assert dna.created_at is not None

    async def test_dna_data_jsonb_storage_retrieval(
        self, user_factory, voice_clone_factory, voice_dna_version_factory
    ):
        """Test VoiceDnaVersion JSONB dna_data storage and retrieval."""
        user = await user_factory()
        clone = await voice_clone_factory(user_id=user.id)

        complex_dna_data = {
            "vocabulary": {
                "complexity": "advanced",
                "preferences": ["technical", "precise"],
            },
            "tone": {
                "primary": "professional",
                "formality_score": 0.75,
            },
        }

        dna = await voice_dna_version_factory(
            voice_clone_id=clone.id,
            dna_data=complex_dna_data,
        )

        assert dna.dna_data == complex_dna_data


@pytest.mark.usefixtures("db_session")
@requires_postgres
class TestVoiceDnaVersionRelationships:
    """Tests for VoiceDnaVersion model relationships."""

    async def test_relationship_to_voice_clone(
        self, db_session, user_factory, voice_clone_factory, voice_dna_version_factory
    ):
        """Test VoiceDnaVersion relationship to VoiceClone."""
        user = await user_factory()
        clone = await voice_clone_factory(user_id=user.id, name="DNA Parent")
        dna = await voice_dna_version_factory(voice_clone_id=clone.id)

        await db_session.refresh(dna)

        assert dna.voice_clone is not None
        assert dna.voice_clone.name == "DNA Parent"

    async def test_cascade_delete_with_voice_clone(
        self, db_session, user_factory, voice_clone_factory, voice_dna_version_factory
    ):
        """Test VoiceDnaVersion is deleted when parent VoiceClone is deleted."""
        user = await user_factory()
        clone = await voice_clone_factory(user_id=user.id)
        dna = await voice_dna_version_factory(voice_clone_id=clone.id)
        dna_id = dna.id

        await db_session.delete(clone)
        await db_session.commit()

        result = await db_session.execute(
            select(VoiceDnaVersion).where(VoiceDnaVersion.id == dna_id)
        )
        assert result.scalar_one_or_none() is None
