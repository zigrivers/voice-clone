"""Encryption utilities for API key management."""

from cryptography.fernet import Fernet, InvalidToken

from voice_clone.config import settings


def get_fernet() -> Fernet:
    """Get Fernet instance for encryption/decryption."""
    key = settings.encryption_key
    if not key:
        raise ValueError("ENCRYPTION_KEY environment variable is not set")
    # Ensure the key is properly encoded
    if isinstance(key, str):
        key = key.encode()
    return Fernet(key)


def encrypt_api_key(api_key: str) -> str:
    """Encrypt an API key for secure storage.

    Args:
        api_key: The plaintext API key to encrypt.

    Returns:
        The encrypted API key as a string.
    """
    fernet = get_fernet()
    encrypted = fernet.encrypt(api_key.encode())
    return encrypted.decode()


def decrypt_api_key(encrypted_key: str) -> str:
    """Decrypt an encrypted API key.

    Args:
        encrypted_key: The encrypted API key.

    Returns:
        The decrypted plaintext API key.

    Raises:
        InvalidToken: If the encrypted key is invalid or tampered.
    """
    fernet = get_fernet()
    decrypted = fernet.decrypt(encrypted_key.encode())
    return decrypted.decode()


def mask_api_key(api_key: str, visible_chars: int = 8) -> str:
    """Mask an API key for display, showing only the last few characters.

    Args:
        api_key: The API key to mask.
        visible_chars: Number of characters to show at the end.

    Returns:
        Masked API key like "sk-...abc12345"
    """
    if len(api_key) <= visible_chars:
        return "*" * len(api_key)

    # Get prefix (e.g., "sk-" for OpenAI)
    prefix = ""
    if api_key.startswith("sk-"):
        prefix = "sk-"
    elif api_key.startswith("sk-ant-"):
        prefix = "sk-ant-"

    suffix = api_key[-visible_chars:]
    return f"{prefix}...{suffix}"
