"""Settings models."""

from datetime import datetime
from enum import Enum
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from voice_clone.models.base import Base, TimestampMixin, UUIDMixin

if TYPE_CHECKING:
    from voice_clone.models.user import User


class Platform(str, Enum):
    """Supported platforms for content generation."""

    LINKEDIN = "linkedin"
    TWITTER = "twitter"
    FACEBOOK = "facebook"
    INSTAGRAM = "instagram"
    EMAIL = "email"
    BLOG = "blog"
    SMS = "sms"
    CUSTOM = "custom"


# Default voice cloning instructions
DEFAULT_VOICE_CLONING_INSTRUCTIONS = """Analyze the provided writing samples to extract a comprehensive Voice DNA profile.

Focus on identifying:
1. Vocabulary patterns and word choice preferences
2. Sentence structure and length variations
3. Paragraph organization
4. Tone and emotional markers
5. Rhetorical devices and persuasion techniques
6. Punctuation habits
7. Opening and closing patterns
8. Humor and personality traits
9. Distinctive signatures or catchphrases

Be specific and include examples from the text when possible."""

# Default anti-AI guidelines
DEFAULT_ANTI_AI_GUIDELINES = """When generating content, ensure it appears naturally human-written by:

1. Varying sentence length and structure
2. Using specific examples and anecdotes
3. Including natural transitions and flow
4. Adding personal touches and voice markers
5. Avoiding generic or formulaic phrasing
6. Including minor imperfections that feel authentic
7. Using the voice owner's typical vocabulary
8. Matching the emotional tone to the context"""


class Settings(Base, UUIDMixin, TimestampMixin):
    """User settings for methodology customization."""

    __tablename__ = "settings"

    user_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False),
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
    )
    voice_cloning_instructions: Mapped[str] = mapped_column(
        Text, nullable=False, default=DEFAULT_VOICE_CLONING_INSTRUCTIONS
    )
    anti_ai_guidelines: Mapped[str] = mapped_column(
        Text, nullable=False, default=DEFAULT_ANTI_AI_GUIDELINES
    )

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="settings")
    history: Mapped[list["SettingsHistory"]] = relationship(
        "SettingsHistory", back_populates="settings", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<Settings(id={self.id}, user={self.user_id})>"


class SettingsHistory(Base, UUIDMixin):
    """Model for settings version history."""

    __tablename__ = "settings_history"

    settings_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False),
        ForeignKey("settings.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    setting_type: Mapped[str] = mapped_column(
        String(50), nullable=False
    )  # 'voice_cloning_instructions' or 'anti_ai_guidelines'
    content: Mapped[str] = mapped_column(Text, nullable=False)
    version: Mapped[int] = mapped_column(Integer, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    settings: Mapped["Settings"] = relationship("Settings", back_populates="history")

    def __repr__(self) -> str:
        return f"<SettingsHistory(id={self.id}, type={self.setting_type}, v={self.version})>"


# Default platform best practices
DEFAULT_PLATFORM_PRACTICES = {
    Platform.LINKEDIN: """LinkedIn Best Practices:
- Professional but personable tone
- Use line breaks for readability
- Include a strong hook in the first line
- End with a call-to-action or question
- Optimal length: 1,300-2,000 characters
- Use relevant hashtags (3-5 max)""",
    Platform.TWITTER: """Twitter/X Best Practices:
- Be concise and punchy
- Use threads for longer content
- Front-load the key message
- Include relevant hashtags
- Character limit: 280 per tweet
- Use emojis sparingly for emphasis""",
    Platform.FACEBOOK: """Facebook Best Practices:
- Conversational and engaging tone
- Use questions to drive engagement
- Include visuals when possible
- Optimal length: 40-80 characters for highest engagement
- Longer posts (up to 500 chars) for detailed content""",
    Platform.INSTAGRAM: """Instagram Best Practices:
- Visual-first, caption supports image
- Use emojis to break up text
- Include a clear call-to-action
- Hashtags: 5-10 relevant tags
- Caption length: up to 2,200 characters""",
    Platform.EMAIL: """Email Best Practices:
- Clear, compelling subject line
- Personal greeting
- Get to the point quickly
- One main call-to-action per email
- Professional signature
- Keep paragraphs short""",
    Platform.BLOG: """Blog Best Practices:
- Strong headline that promises value
- Use headers and subheaders
- Include relevant images
- Optimal length: 1,500-2,500 words
- End with a conclusion and CTA
- SEO-friendly structure""",
    Platform.SMS: """SMS Best Practices:
- Ultra-concise messaging
- Clear call-to-action
- Character limit: 160 characters
- Avoid abbreviations that may confuse
- Include opt-out info when required""",
}


class PlatformSettings(Base, UUIDMixin, TimestampMixin):
    """Platform-specific best practices settings."""

    __tablename__ = "platform_settings"

    user_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    platform: Mapped[str] = mapped_column(String(50), nullable=False)
    display_name: Mapped[str] = mapped_column(String(100), nullable=False)
    best_practices: Mapped[str] = mapped_column(Text, nullable=False)
    is_default: Mapped[bool] = mapped_column(Boolean, default=False)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="platform_settings")

    def __repr__(self) -> str:
        return f"<PlatformSettings(id={self.id}, platform={self.platform})>"
