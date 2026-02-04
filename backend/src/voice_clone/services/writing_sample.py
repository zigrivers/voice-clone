"""Writing sample service for managing voice clone training data."""

import re
from uuid import uuid4

from fastapi import UploadFile
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from voice_clone.exceptions import NotFoundError, BadRequestError
from voice_clone.models import WritingSample, SourceType, VoiceClone
from voice_clone.schemas.voice_clone import WritingSampleCreate, WritingSampleResponse


class WritingSampleService:
    """Service for managing writing samples."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_samples(self, clone_id: str) -> list[WritingSample]:
        """Get all samples for a voice clone."""
        result = await self.db.execute(
            select(WritingSample)
            .where(WritingSample.voice_clone_id == clone_id)
            .order_by(WritingSample.created_at.desc())
        )
        return list(result.scalars().all())

    async def get_sample_by_id(self, sample_id: str) -> WritingSample | None:
        """Get a sample by ID."""
        result = await self.db.execute(
            select(WritingSample).where(WritingSample.id == sample_id)
        )
        return result.scalar_one_or_none()

    async def add_sample_from_paste(self, clone_id: str, content: str) -> WritingSample:
        """Add a sample from pasted text."""
        if not content or not content.strip():
            raise BadRequestError("Content cannot be empty")

        content = content.strip()
        word_count = self._count_words(content)

        if word_count < 50:
            raise BadRequestError("Sample must contain at least 50 words")

        sample = WritingSample(
            id=str(uuid4()),
            voice_clone_id=clone_id,
            source_type=SourceType.PASTE,
            content=content,
            word_count=word_count,
        )
        self.db.add(sample)
        await self.db.flush()
        return sample

    async def add_sample_from_file(
        self,
        clone_id: str,
        file: UploadFile,
    ) -> WritingSample:
        """Add a sample from an uploaded file."""
        if not file.filename:
            raise BadRequestError("File must have a filename")

        filename = file.filename.lower()
        content = await file.read()

        # Determine file type and extract text
        if filename.endswith(".txt"):
            text = content.decode("utf-8")
        elif filename.endswith(".pdf"):
            from voice_clone.parsers.pdf import extract_text_from_pdf
            text = await extract_text_from_pdf(content)
        elif filename.endswith(".docx"):
            from voice_clone.parsers.docx import extract_text_from_docx
            text = await extract_text_from_docx(content)
        else:
            raise BadRequestError(
                "Unsupported file type. Supported: .txt, .pdf, .docx"
            )

        text = text.strip()
        if not text:
            raise BadRequestError("Could not extract text from file")

        word_count = self._count_words(text)
        if word_count < 50:
            raise BadRequestError("Sample must contain at least 50 words")

        sample = WritingSample(
            id=str(uuid4()),
            voice_clone_id=clone_id,
            source_type=SourceType.FILE,
            content=text,
            original_filename=file.filename,
            word_count=word_count,
        )
        self.db.add(sample)
        await self.db.flush()
        return sample

    async def add_sample_from_url(self, clone_id: str, url: str) -> WritingSample:
        """Add a sample from a URL."""
        from voice_clone.parsers.url import extract_text_from_url

        try:
            text = await extract_text_from_url(str(url))
        except Exception as e:
            raise BadRequestError(f"Failed to fetch URL: {str(e)}")

        text = text.strip()
        if not text:
            raise BadRequestError("Could not extract text from URL")

        word_count = self._count_words(text)
        if word_count < 50:
            raise BadRequestError("Sample must contain at least 50 words")

        sample = WritingSample(
            id=str(uuid4()),
            voice_clone_id=clone_id,
            source_type=SourceType.URL,
            content=text,
            source_url=str(url),
            word_count=word_count,
        )
        self.db.add(sample)
        await self.db.flush()
        return sample

    async def delete_sample(self, sample_id: str, clone_id: str) -> bool:
        """Delete a writing sample."""
        result = await self.db.execute(
            select(WritingSample).where(
                WritingSample.id == sample_id,
                WritingSample.voice_clone_id == clone_id,
            )
        )
        sample = result.scalar_one_or_none()
        if not sample:
            return False

        await self.db.delete(sample)
        await self.db.flush()
        return True

    def _count_words(self, text: str) -> int:
        """Count words in text."""
        # Split on whitespace and filter empty strings
        words = re.findall(r"\b\w+\b", text)
        return len(words)

    def to_response(self, sample: WritingSample) -> WritingSampleResponse:
        """Convert WritingSample model to response schema."""
        return WritingSampleResponse(
            id=sample.id,
            voice_clone_id=sample.voice_clone_id,
            source_type=sample.source_type,
            content=sample.content,
            source_url=sample.source_url,
            original_filename=sample.original_filename,
            word_count=sample.word_count,
            created_at=sample.created_at,
        )
