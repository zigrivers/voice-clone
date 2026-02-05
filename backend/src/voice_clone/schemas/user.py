"""User and authentication schemas."""

from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


class UserCreate(BaseModel):
    """Schema for creating a user from OAuth profile."""

    email: EmailStr
    name: str | None = None
    avatar_url: str | None = None
    oauth_provider: str
    oauth_id: str


class UserResponse(BaseModel):
    """Schema for user response."""

    id: str
    email: str
    name: str | None
    avatar_url: str | None
    oauth_provider: str
    created_at: datetime
    updated_at: datetime | None

    model_config = {"from_attributes": True}


class ApiKeyCreate(BaseModel):
    """Schema for creating an API key."""

    provider: str = Field(..., pattern="^(openai|anthropic)$")
    api_key: str = Field(..., min_length=10)


class ApiKeyResponse(BaseModel):
    """Schema for API key response (masked)."""

    id: str
    provider: str
    masked_key: str  # e.g., "sk-...abc123"
    is_valid: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class ApiKeyValidationResponse(BaseModel):
    """Schema for API key validation response."""

    valid: bool
    provider: str
    message: str | None = None
