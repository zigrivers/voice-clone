"""Test factories for creating model instances."""

import uuid
from datetime import datetime

import factory

from voice_clone.models.content import Content, ContentStatus
from voice_clone.models.settings import (
    DEFAULT_ANTI_AI_GUIDELINES,
    DEFAULT_VOICE_CLONING_INSTRUCTIONS,
    Platform,
    PlatformSettings,
    Settings,
    SettingsHistory,
)
from voice_clone.models.usage import ApiUsageLog
from voice_clone.models.user import User, UserApiKey
from voice_clone.models.voice_clone import VoiceClone, VoiceCloneMergeSource
from voice_clone.models.voice_dna import VoiceDnaVersion
from voice_clone.models.writing_sample import SourceType, WritingSample


class UserFactory(factory.Factory):
    """Factory for creating User instances."""

    class Meta:
        model = User

    id = factory.LazyFunction(lambda: str(uuid.uuid4()))
    email = factory.Sequence(lambda n: f"user{n}@example.com")
    name = factory.Faker("name")
    avatar_url = factory.Faker("url")
    oauth_provider = "google"
    oauth_id = factory.LazyFunction(lambda: str(uuid.uuid4()))
    created_at = factory.LazyFunction(datetime.utcnow)
    updated_at = None


class UserApiKeyFactory(factory.Factory):
    """Factory for creating UserApiKey instances."""

    class Meta:
        model = UserApiKey

    id = factory.LazyFunction(lambda: str(uuid.uuid4()))
    user_id = factory.LazyFunction(lambda: str(uuid.uuid4()))
    provider = "openai"
    encrypted_api_key = factory.Faker("sha256")
    is_valid = True
    created_at = factory.LazyFunction(datetime.utcnow)


class VoiceCloneFactory(factory.Factory):
    """Factory for creating VoiceClone instances."""

    class Meta:
        model = VoiceClone

    id = factory.LazyFunction(lambda: str(uuid.uuid4()))
    user_id = factory.LazyFunction(lambda: str(uuid.uuid4()))
    name = factory.Sequence(lambda n: f"Voice Clone {n}")
    description = factory.Faker("paragraph")
    tags = factory.LazyFunction(list)
    is_merged = False
    confidence_score = 0
    current_dna_id = None
    created_at = factory.LazyFunction(datetime.utcnow)
    updated_at = None


class WritingSampleFactory(factory.Factory):
    """Factory for creating WritingSample instances."""

    class Meta:
        model = WritingSample

    id = factory.LazyFunction(lambda: str(uuid.uuid4()))
    voice_clone_id = factory.LazyFunction(lambda: str(uuid.uuid4()))
    source_type = SourceType.PASTE
    content = factory.Faker("paragraphs", nb=3, ext_word_list=None)
    source_url = None
    original_filename = None
    word_count = factory.LazyAttribute(
        lambda o: len(" ".join(o.content).split()) if isinstance(o.content, list) else len(o.content.split())
    )
    created_at = factory.LazyFunction(datetime.utcnow)

    @factory.lazy_attribute
    def content(self):
        """Generate text content."""
        return factory.Faker._get_faker().paragraph(nb_sentences=10)


class VoiceDnaVersionFactory(factory.Factory):
    """Factory for creating VoiceDnaVersion instances."""

    class Meta:
        model = VoiceDnaVersion

    id = factory.LazyFunction(lambda: str(uuid.uuid4()))
    voice_clone_id = factory.LazyFunction(lambda: str(uuid.uuid4()))
    version = factory.Sequence(lambda n: n + 1)
    dna_data = factory.LazyFunction(
        lambda: {
            "vocabulary": {"complexity": "moderate", "preferences": ["technical", "formal"]},
            "sentence_structure": {"avg_length": 15, "variation": "high"},
            "tone": {"primary": "professional", "secondary": "friendly"},
        }
    )
    analysis_metadata = None
    created_at = factory.LazyFunction(datetime.utcnow)


class ContentFactory(factory.Factory):
    """Factory for creating Content instances."""

    class Meta:
        model = Content

    id = factory.LazyFunction(lambda: str(uuid.uuid4()))
    user_id = factory.LazyFunction(lambda: str(uuid.uuid4()))
    voice_clone_id = None
    platform = "linkedin"
    content_text = factory.Faker("paragraph")
    input_text = factory.Faker("sentence")
    properties_used = factory.LazyFunction(dict)
    detection_score = None
    detection_breakdown = None
    status = ContentStatus.DRAFT
    tags = factory.LazyFunction(list)
    created_at = factory.LazyFunction(datetime.utcnow)
    updated_at = None


class SettingsFactory(factory.Factory):
    """Factory for creating Settings instances."""

    class Meta:
        model = Settings

    id = factory.LazyFunction(lambda: str(uuid.uuid4()))
    user_id = factory.LazyFunction(lambda: str(uuid.uuid4()))
    voice_cloning_instructions = DEFAULT_VOICE_CLONING_INSTRUCTIONS
    anti_ai_guidelines = DEFAULT_ANTI_AI_GUIDELINES
    created_at = factory.LazyFunction(datetime.utcnow)
    updated_at = None


class SettingsHistoryFactory(factory.Factory):
    """Factory for creating SettingsHistory instances."""

    class Meta:
        model = SettingsHistory

    id = factory.LazyFunction(lambda: str(uuid.uuid4()))
    settings_id = factory.LazyFunction(lambda: str(uuid.uuid4()))
    setting_type = "voice_cloning_instructions"
    content = factory.Faker("paragraph")
    version = factory.Sequence(lambda n: n + 1)
    created_at = factory.LazyFunction(datetime.utcnow)


class PlatformSettingsFactory(factory.Factory):
    """Factory for creating PlatformSettings instances."""

    class Meta:
        model = PlatformSettings

    id = factory.LazyFunction(lambda: str(uuid.uuid4()))
    user_id = factory.LazyFunction(lambda: str(uuid.uuid4()))
    platform = Platform.LINKEDIN.value
    display_name = "LinkedIn"
    best_practices = factory.Faker("paragraph")
    is_default = True
    created_at = factory.LazyFunction(datetime.utcnow)
    updated_at = None


class ApiUsageLogFactory(factory.Factory):
    """Factory for creating ApiUsageLog instances."""

    class Meta:
        model = ApiUsageLog

    id = factory.LazyFunction(lambda: str(uuid.uuid4()))
    user_id = factory.LazyFunction(lambda: str(uuid.uuid4()))
    provider = "openai"
    operation = "generate"
    model = "gpt-4"
    input_tokens = factory.Faker("random_int", min=100, max=1000)
    output_tokens = factory.Faker("random_int", min=50, max=500)
    voice_clone_id = None
    created_at = factory.LazyFunction(datetime.utcnow)


class VoiceCloneMergeSourceFactory(factory.Factory):
    """Factory for creating VoiceCloneMergeSource instances."""

    class Meta:
        model = VoiceCloneMergeSource

    id = factory.LazyFunction(lambda: str(uuid.uuid4()))
    merged_clone_id = factory.LazyFunction(lambda: str(uuid.uuid4()))
    source_clone_id = factory.LazyFunction(lambda: str(uuid.uuid4()))
    element_weights = factory.LazyFunction(
        lambda: {"vocabulary": 50, "tone": 30, "structure": 20}
    )
    created_at = factory.LazyFunction(datetime.utcnow)
