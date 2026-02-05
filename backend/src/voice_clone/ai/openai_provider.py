"""OpenAI provider implementation."""

from typing import AsyncIterator

from openai import AsyncOpenAI, APIError, AuthenticationError

from voice_clone.ai.provider import AIProvider, GenerationOptions, GenerationResult


class OpenAIProvider(AIProvider):
    """OpenAI API provider implementation."""

    def __init__(self, api_key: str, default_model: str = "gpt-4-turbo"):
        self.client = AsyncOpenAI(api_key=api_key)
        self._default_model = default_model

    @property
    def name(self) -> str:
        return "openai"

    @property
    def default_model(self) -> str:
        return self._default_model

    async def generate_text(
        self,
        prompt: str,
        options: GenerationOptions | None = None,
    ) -> GenerationResult:
        """Generate text using OpenAI's API."""
        opts = options or GenerationOptions()
        model = opts.model or self.default_model

        messages = []
        if opts.system_prompt:
            messages.append({"role": "system", "content": opts.system_prompt})
        messages.append({"role": "user", "content": prompt})

        response = await self.client.chat.completions.create(
            model=model,
            messages=messages,
            max_tokens=opts.max_tokens,
            temperature=opts.temperature,
        )

        return GenerationResult(
            text=response.choices[0].message.content or "",
            model=model,
            input_tokens=response.usage.prompt_tokens if response.usage else 0,
            output_tokens=response.usage.completion_tokens if response.usage else 0,
        )

    async def generate_stream(
        self,
        prompt: str,
        options: GenerationOptions | None = None,
    ) -> AsyncIterator[str]:
        """Generate text as a stream using OpenAI's API."""
        opts = options or GenerationOptions()
        model = opts.model or self.default_model

        messages = []
        if opts.system_prompt:
            messages.append({"role": "system", "content": opts.system_prompt})
        messages.append({"role": "user", "content": prompt})

        stream = await self.client.chat.completions.create(
            model=model,
            messages=messages,
            max_tokens=opts.max_tokens,
            temperature=opts.temperature,
            stream=True,
        )

        async for chunk in stream:
            if chunk.choices[0].delta.content:
                yield chunk.choices[0].delta.content

    async def validate_api_key(self) -> bool:
        """Validate the OpenAI API key."""
        try:
            # Make a minimal API call to validate the key
            await self.client.models.list()
            return True
        except AuthenticationError:
            return False
        except APIError:
            # Other API errors might mean the key is valid but there's another issue
            return True
