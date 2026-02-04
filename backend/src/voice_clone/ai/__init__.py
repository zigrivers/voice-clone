"""AI provider module."""

from voice_clone.ai.provider import AIProvider, GenerationOptions, GenerationResult
from voice_clone.ai.openai_provider import OpenAIProvider
from voice_clone.ai.anthropic_provider import AnthropicProvider
from voice_clone.config import settings


def get_ai_provider(
    provider: str | None = None,
    api_key: str | None = None,
) -> AIProvider:
    """Factory function to get an AI provider instance.

    Args:
        provider: Provider name ('openai' or 'anthropic'). Defaults to settings.
        api_key: API key to use. Defaults to settings.

    Returns:
        An AIProvider instance.

    Raises:
        ValueError: If the provider is unknown.
    """
    provider = provider or settings.default_ai_provider

    if provider == "openai":
        key = api_key or settings.openai_api_key
        if not key:
            raise ValueError("OpenAI API key is not configured")
        return OpenAIProvider(api_key=key)

    elif provider == "anthropic":
        key = api_key or settings.anthropic_api_key
        if not key:
            raise ValueError("Anthropic API key is not configured")
        return AnthropicProvider(api_key=key)

    else:
        raise ValueError(f"Unknown AI provider: {provider}")


__all__ = [
    "AIProvider",
    "GenerationOptions",
    "GenerationResult",
    "OpenAIProvider",
    "AnthropicProvider",
    "get_ai_provider",
]
