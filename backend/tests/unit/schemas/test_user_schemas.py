"""Tests for User schemas."""

from datetime import datetime

import pytest
from pydantic import ValidationError

from voice_clone.schemas.user import (
    ApiKeyCreate,
    ApiKeyResponse,
    UserCreate,
    UserResponse,
)


class TestUserCreateSchema:
    """Tests for UserCreate schema validation."""

    def test_valid_user_create(self):
        """Test UserCreate accepts valid data."""
        data = {
            "email": "test@example.com",
            "oauth_provider": "google",
            "oauth_id": "google-123",
        }
        user = UserCreate(**data)

        assert user.email == "test@example.com"
        assert user.oauth_provider == "google"
        assert user.oauth_id == "google-123"
        assert user.name is None
        assert user.avatar_url is None

    def test_user_create_with_optional_fields(self):
        """Test UserCreate with all fields."""
        data = {
            "email": "test@example.com",
            "name": "Test User",
            "avatar_url": "https://example.com/avatar.jpg",
            "oauth_provider": "github",
            "oauth_id": "github-456",
        }
        user = UserCreate(**data)

        assert user.name == "Test User"
        assert user.avatar_url == "https://example.com/avatar.jpg"

    def test_user_create_invalid_email(self):
        """Test UserCreate rejects invalid email."""
        data = {
            "email": "not-an-email",
            "oauth_provider": "google",
            "oauth_id": "google-123",
        }
        with pytest.raises(ValidationError) as exc_info:
            UserCreate(**data)

        errors = exc_info.value.errors()
        assert any(e["loc"] == ("email",) for e in errors)

    def test_user_create_missing_required_fields(self):
        """Test UserCreate requires email, oauth_provider, oauth_id."""
        with pytest.raises(ValidationError) as exc_info:
            UserCreate()

        errors = exc_info.value.errors()
        required_fields = {"email", "oauth_provider", "oauth_id"}
        error_fields = {e["loc"][0] for e in errors}
        assert required_fields <= error_fields


class TestUserResponseSchema:
    """Tests for UserResponse schema serialization."""

    def test_user_response_serialization(self):
        """Test UserResponse serializes correctly."""
        data = {
            "id": "user-123",
            "email": "test@example.com",
            "name": "Test User",
            "avatar_url": "https://example.com/avatar.jpg",
            "oauth_provider": "google",
            "created_at": datetime(2024, 1, 15, 10, 30, 0),
            "updated_at": None,
        }
        response = UserResponse(**data)

        assert response.id == "user-123"
        assert response.email == "test@example.com"
        assert response.name == "Test User"
        assert response.oauth_provider == "google"

    def test_user_response_from_attributes(self):
        """Test UserResponse supports from_attributes mode."""
        assert UserResponse.model_config.get("from_attributes") is True


class TestApiKeyCreateSchema:
    """Tests for ApiKeyCreate schema validation."""

    def test_valid_api_key_create_openai(self):
        """Test ApiKeyCreate accepts valid OpenAI key."""
        data = {
            "provider": "openai",
            "api_key": "sk-test1234567890",
        }
        api_key = ApiKeyCreate(**data)

        assert api_key.provider == "openai"
        assert api_key.api_key == "sk-test1234567890"

    def test_valid_api_key_create_anthropic(self):
        """Test ApiKeyCreate accepts valid Anthropic key."""
        data = {
            "provider": "anthropic",
            "api_key": "sk-ant-test1234567890",
        }
        api_key = ApiKeyCreate(**data)

        assert api_key.provider == "anthropic"

    def test_api_key_create_invalid_provider(self):
        """Test ApiKeyCreate rejects invalid provider."""
        data = {
            "provider": "invalid-provider",
            "api_key": "sk-test1234567890",
        }
        with pytest.raises(ValidationError) as exc_info:
            ApiKeyCreate(**data)

        errors = exc_info.value.errors()
        assert any(e["loc"] == ("provider",) for e in errors)

    def test_api_key_create_key_too_short(self):
        """Test ApiKeyCreate rejects keys shorter than 10 characters."""
        data = {
            "provider": "openai",
            "api_key": "short",
        }
        with pytest.raises(ValidationError) as exc_info:
            ApiKeyCreate(**data)

        errors = exc_info.value.errors()
        assert any(e["loc"] == ("api_key",) for e in errors)


class TestApiKeyResponseSchema:
    """Tests for ApiKeyResponse schema."""

    def test_api_key_response_masked_format(self):
        """Test ApiKeyResponse with masked key."""
        data = {
            "id": "key-123",
            "provider": "openai",
            "masked_key": "sk-...abc123",
            "is_valid": True,
            "created_at": datetime(2024, 1, 15, 10, 30, 0),
        }
        response = ApiKeyResponse(**data)

        assert response.masked_key == "sk-...abc123"
        assert response.is_valid is True

    def test_api_key_response_from_attributes(self):
        """Test ApiKeyResponse supports from_attributes mode."""
        assert ApiKeyResponse.model_config.get("from_attributes") is True
