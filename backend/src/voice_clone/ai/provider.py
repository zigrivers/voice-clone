"""Abstract AI provider base class."""

from abc import ABC, abstractmethod
from typing import AsyncIterator

from pydantic import BaseModel


class GenerationOptions(BaseModel):
    """Options for AI text generation."""

    model: str | None = None
    max_tokens: int = 4096
    temperature: float = 0.7
    system_prompt: str | None = None


class GenerationResult(BaseModel):
    """Result from AI text generation."""

    text: str
    model: str
    input_tokens: int
    output_tokens: int


class AIProvider(ABC):
    """Abstract base class for AI providers."""

    @property
    @abstractmethod
    def name(self) -> str:
        """Get the provider name."""
        ...

    @property
    @abstractmethod
    def default_model(self) -> str:
        """Get the default model for this provider."""
        ...

    @abstractmethod
    async def generate_text(
        self,
        prompt: str,
        options: GenerationOptions | None = None,
    ) -> GenerationResult:
        """Generate text from a prompt.

        Args:
            prompt: The user prompt to generate from.
            options: Optional generation options.

        Returns:
            GenerationResult with the generated text and usage info.
        """
        ...

    @abstractmethod
    async def generate_stream(
        self,
        prompt: str,
        options: GenerationOptions | None = None,
    ) -> AsyncIterator[str]:
        """Generate text as a stream.

        Args:
            prompt: The user prompt to generate from.
            options: Optional generation options.

        Yields:
            Text chunks as they are generated.
        """
        ...

    @abstractmethod
    async def validate_api_key(self) -> bool:
        """Validate that the API key is valid.

        Returns:
            True if the API key is valid, False otherwise.
        """
        ...
