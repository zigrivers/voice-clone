"""Anthropic Claude provider implementation."""

from typing import AsyncIterator

from anthropic import AsyncAnthropic, APIError, AuthenticationError

from voice_clone.ai.provider import AIProvider, GenerationOptions, GenerationResult


class AnthropicProvider(AIProvider):
    """Anthropic Claude API provider implementation."""

    def __init__(self, api_key: str, default_model: str = "claude-3-5-sonnet-20241022"):
        self.client = AsyncAnthropic(api_key=api_key)
        self._default_model = default_model

    @property
    def name(self) -> str:
        return "anthropic"

    @property
    def default_model(self) -> str:
        return self._default_model

    async def generate_text(
        self,
        prompt: str,
        options: GenerationOptions | None = None,
    ) -> GenerationResult:
        """Generate text using Anthropic's API."""
        opts = options or GenerationOptions()
        model = opts.model or self.default_model

        kwargs = {
            "model": model,
            "max_tokens": opts.max_tokens,
            "messages": [{"role": "user", "content": prompt}],
        }

        if opts.system_prompt:
            kwargs["system"] = opts.system_prompt

        # Note: Anthropic doesn't have a direct temperature parameter in the same way
        # but we can use it if the API supports it
        if opts.temperature != 0.7:  # Only set if not default
            kwargs["temperature"] = opts.temperature

        response = await self.client.messages.create(**kwargs)

        # Extract text from response
        text = ""
        for block in response.content:
            if hasattr(block, "text"):
                text += block.text

        return GenerationResult(
            text=text,
            model=model,
            input_tokens=response.usage.input_tokens,
            output_tokens=response.usage.output_tokens,
        )

    async def generate_stream(
        self,
        prompt: str,
        options: GenerationOptions | None = None,
    ) -> AsyncIterator[str]:
        """Generate text as a stream using Anthropic's API."""
        opts = options or GenerationOptions()
        model = opts.model or self.default_model

        kwargs = {
            "model": model,
            "max_tokens": opts.max_tokens,
            "messages": [{"role": "user", "content": prompt}],
        }

        if opts.system_prompt:
            kwargs["system"] = opts.system_prompt

        async with self.client.messages.stream(**kwargs) as stream:
            async for text in stream.text_stream:
                yield text

    async def validate_api_key(self) -> bool:
        """Validate the Anthropic API key."""
        try:
            # Make a minimal API call to validate the key
            await self.client.messages.create(
                model="claude-3-haiku-20240307",
                max_tokens=1,
                messages=[{"role": "user", "content": "Hi"}],
            )
            return True
        except AuthenticationError:
            return False
        except APIError:
            # Other API errors might mean the key is valid but there's another issue
            return True
