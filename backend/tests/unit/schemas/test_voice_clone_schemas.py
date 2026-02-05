"""Tests for VoiceClone schemas."""

import uuid
from datetime import datetime

import pytest
from pydantic import ValidationError

from voice_clone.models.writing_sample import SourceType
from voice_clone.schemas.voice_clone import (
    ConfidenceScoreResponse,
    MergeCloneRequest,
    MergeSourceConfig,
    VoiceCloneCreate,
    VoiceCloneDetailResponse,
    VoiceCloneListResponse,
    VoiceCloneResponse,
    VoiceCloneUpdate,
    VoiceDnaResponse,
    WritingSampleCreate,
    WritingSampleResponse,
)


class TestVoiceCloneCreateSchema:
    """Tests for VoiceCloneCreate schema validation."""

    def test_valid_voice_clone_create(self):
        """Test VoiceCloneCreate accepts valid data."""
        data = {"name": "My Voice Clone"}
        clone = VoiceCloneCreate(**data)

        assert clone.name == "My Voice Clone"
        assert clone.description is None
        assert clone.tags == []

    def test_voice_clone_create_with_all_fields(self):
        """Test VoiceCloneCreate with all fields."""
        data = {
            "name": "Professional Voice",
            "description": "A professional writing voice.",
            "tags": ["professional", "formal"],
        }
        clone = VoiceCloneCreate(**data)

        assert clone.name == "Professional Voice"
        assert clone.description == "A professional writing voice."
        assert clone.tags == ["professional", "formal"]

    def test_voice_clone_create_name_required(self):
        """Test VoiceCloneCreate requires name."""
        with pytest.raises(ValidationError) as exc_info:
            VoiceCloneCreate()

        errors = exc_info.value.errors()
        assert any(e["loc"] == ("name",) for e in errors)

    def test_voice_clone_create_name_min_length(self):
        """Test VoiceCloneCreate name must have min_length=1."""
        with pytest.raises(ValidationError) as exc_info:
            VoiceCloneCreate(name="")

        errors = exc_info.value.errors()
        assert any(e["loc"] == ("name",) for e in errors)

    def test_voice_clone_create_name_max_length(self):
        """Test VoiceCloneCreate name must have max_length=255."""
        with pytest.raises(ValidationError) as exc_info:
            VoiceCloneCreate(name="x" * 256)

        errors = exc_info.value.errors()
        assert any(e["loc"] == ("name",) for e in errors)


class TestVoiceCloneUpdateSchema:
    """Tests for VoiceCloneUpdate schema validation."""

    def test_voice_clone_update_partial(self):
        """Test VoiceCloneUpdate allows partial updates."""
        data = {"name": "Updated Name"}
        update = VoiceCloneUpdate(**data)

        assert update.name == "Updated Name"
        assert update.description is None
        assert update.tags is None

    def test_voice_clone_update_empty(self):
        """Test VoiceCloneUpdate can be empty."""
        update = VoiceCloneUpdate()

        assert update.name is None
        assert update.description is None
        assert update.tags is None

    def test_voice_clone_update_tags(self):
        """Test VoiceCloneUpdate can update tags."""
        data = {"tags": ["new-tag", "updated"]}
        update = VoiceCloneUpdate(**data)

        assert update.tags == ["new-tag", "updated"]


class TestWritingSampleCreateSchema:
    """Tests for WritingSampleCreate schema validation."""

    def test_writing_sample_create_paste(self):
        """Test WritingSampleCreate validates PASTE type."""
        data = {
            "source_type": SourceType.PASTE,
            "content": "This is pasted content.",
        }
        sample = WritingSampleCreate(**data)

        assert sample.source_type == SourceType.PASTE
        assert sample.content == "This is pasted content."

    def test_writing_sample_create_file(self):
        """Test WritingSampleCreate validates FILE type."""
        data = {"source_type": SourceType.FILE}
        sample = WritingSampleCreate(**data)

        assert sample.source_type == SourceType.FILE

    def test_writing_sample_create_url(self):
        """Test WritingSampleCreate validates URL type."""
        data = {
            "source_type": SourceType.URL,
            "source_url": "https://example.com/article",
        }
        sample = WritingSampleCreate(**data)

        assert sample.source_type == SourceType.URL
        assert str(sample.source_url) == "https://example.com/article"

    def test_writing_sample_create_invalid_url(self):
        """Test WritingSampleCreate rejects invalid URL."""
        data = {
            "source_type": SourceType.URL,
            "source_url": "not-a-valid-url",
        }
        with pytest.raises(ValidationError) as exc_info:
            WritingSampleCreate(**data)

        errors = exc_info.value.errors()
        assert any(e["loc"] == ("source_url",) for e in errors)


class TestWritingSampleResponseSchema:
    """Tests for WritingSampleResponse schema."""

    def test_writing_sample_response(self):
        """Test WritingSampleResponse serialization."""
        data = {
            "id": "sample-123",
            "voice_clone_id": "clone-456",
            "source_type": SourceType.PASTE,
            "content": "Sample content here.",
            "source_url": None,
            "original_filename": None,
            "word_count": 3,
            "created_at": datetime(2024, 1, 15, 10, 30, 0),
        }
        response = WritingSampleResponse(**data)

        assert response.id == "sample-123"
        assert response.word_count == 3
        assert response.source_type == SourceType.PASTE


class TestVoiceDnaResponseSchema:
    """Tests for VoiceDnaResponse schema."""

    def test_voice_dna_response(self):
        """Test VoiceDnaResponse structure."""
        data = {
            "id": "dna-123",
            "voice_clone_id": "clone-456",
            "version": 1,
            "dna_data": {"vocabulary": {"complexity": "advanced"}},
            "analysis_metadata": {"provider": "openai"},
            "created_at": datetime(2024, 1, 15, 10, 30, 0),
        }
        response = VoiceDnaResponse(**data)

        assert response.id == "dna-123"
        assert response.version == 1
        assert response.dna_data == {"vocabulary": {"complexity": "advanced"}}


class TestMergeCloneRequestSchema:
    """Tests for MergeCloneRequest schema validation."""

    def test_valid_merge_clone_request(self):
        """Test MergeCloneRequest with valid data."""
        data = {
            "name": "Merged Voice",
            "sources": [
                {
                    "voice_clone_id": str(uuid.uuid4()),
                    "element_weights": {"vocabulary": 60, "tone": 40},
                },
                {
                    "voice_clone_id": str(uuid.uuid4()),
                    "element_weights": {"vocabulary": 40, "tone": 60},
                },
            ],
        }
        request = MergeCloneRequest(**data)

        assert request.name == "Merged Voice"
        assert len(request.sources) == 2

    def test_merge_clone_request_min_sources(self):
        """Test MergeCloneRequest requires at least 2 sources."""
        data = {
            "name": "Merged Voice",
            "sources": [
                {
                    "voice_clone_id": str(uuid.uuid4()),
                    "element_weights": {"vocabulary": 100},
                },
            ],
        }
        with pytest.raises(ValidationError) as exc_info:
            MergeCloneRequest(**data)

        errors = exc_info.value.errors()
        assert any("sources" in str(e["loc"]) for e in errors)

    def test_merge_clone_request_max_sources(self):
        """Test MergeCloneRequest allows max 5 sources."""
        data = {
            "name": "Merged Voice",
            "sources": [
                {
                    "voice_clone_id": str(uuid.uuid4()),
                    "element_weights": {"vocabulary": 20},
                }
                for _ in range(6)
            ],
        }
        with pytest.raises(ValidationError) as exc_info:
            MergeCloneRequest(**data)

        errors = exc_info.value.errors()
        assert any("sources" in str(e["loc"]) for e in errors)

    def test_merge_clone_request_valid_5_sources(self):
        """Test MergeCloneRequest accepts 5 sources."""
        data = {
            "name": "Merged Voice",
            "sources": [
                {
                    "voice_clone_id": str(uuid.uuid4()),
                    "element_weights": {"vocabulary": 20},
                }
                for _ in range(5)
            ],
        }
        request = MergeCloneRequest(**data)
        assert len(request.sources) == 5


class TestMergeSourceConfigSchema:
    """Tests for MergeSourceConfig schema."""

    def test_merge_source_config(self):
        """Test MergeSourceConfig with element weights."""
        data = {
            "voice_clone_id": str(uuid.uuid4()),
            "element_weights": {"vocabulary": 60, "tone": 30, "structure": 10},
        }
        config = MergeSourceConfig(**data)

        assert config.element_weights == {"vocabulary": 60, "tone": 30, "structure": 10}

    def test_merge_source_config_missing_weights(self):
        """Test MergeSourceConfig requires element_weights."""
        data = {"voice_clone_id": str(uuid.uuid4())}
        with pytest.raises(ValidationError) as exc_info:
            MergeSourceConfig(**data)

        errors = exc_info.value.errors()
        assert any(e["loc"] == ("element_weights",) for e in errors)


class TestVoiceCloneResponseSchemas:
    """Tests for VoiceClone response schemas."""

    def test_confidence_score_response_bounds(self):
        """Test ConfidenceScoreResponse score bounds."""
        # Valid score
        data = {"score": 85, "breakdown": {"samples": 50, "words": 35}}
        response = ConfidenceScoreResponse(**data)
        assert response.score == 85

    def test_confidence_score_response_min(self):
        """Test ConfidenceScoreResponse accepts score of 0."""
        data = {"score": 0, "breakdown": {}}
        response = ConfidenceScoreResponse(**data)
        assert response.score == 0

    def test_confidence_score_response_max(self):
        """Test ConfidenceScoreResponse accepts score of 100."""
        data = {"score": 100, "breakdown": {"samples": 50, "words": 50}}
        response = ConfidenceScoreResponse(**data)
        assert response.score == 100

    def test_confidence_score_response_invalid_min(self):
        """Test ConfidenceScoreResponse rejects score below 0."""
        data = {"score": -1, "breakdown": {}}
        with pytest.raises(ValidationError):
            ConfidenceScoreResponse(**data)

    def test_confidence_score_response_invalid_max(self):
        """Test ConfidenceScoreResponse rejects score above 100."""
        data = {"score": 101, "breakdown": {}}
        with pytest.raises(ValidationError):
            ConfidenceScoreResponse(**data)

    def test_voice_clone_list_response(self):
        """Test VoiceCloneListResponse structure."""
        data = {
            "items": [],
            "total": 0,
            "page": 1,
            "per_page": 20,
            "pages": 1,
        }
        response = VoiceCloneListResponse(**data)

        assert response.items == []
        assert response.total == 0
        assert response.pages == 1

    def test_voice_clone_detail_response_inherits(self):
        """Test VoiceCloneDetailResponse inherits from VoiceCloneResponse."""
        data = {
            "id": "clone-123",
            "user_id": "user-456",
            "name": "Test Clone",
            "description": None,
            "tags": [],
            "is_merged": False,
            "confidence_score": 50,
            "current_dna_id": None,
            "created_at": datetime(2024, 1, 15),
            "updated_at": None,
            "sample_count": 2,
            "total_word_count": 500,
            "samples": [],
            "current_dna": None,
        }
        response = VoiceCloneDetailResponse(**data)

        assert response.name == "Test Clone"
        assert response.samples == []
        assert response.current_dna is None
