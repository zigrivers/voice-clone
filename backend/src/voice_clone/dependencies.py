"""FastAPI dependency injection setup."""

from typing import Annotated

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from voice_clone.database import get_db

# Type alias for database session dependency
DbSession = Annotated[AsyncSession, Depends(get_db)]


# Placeholder for user dependency - will be implemented with auth
# async def get_current_user(
#     db: DbSession,
#     token: str = Depends(oauth2_scheme),
# ) -> User:
#     """Get the current authenticated user."""
#     ...
#
# CurrentUser = Annotated[User, Depends(get_current_user)]
