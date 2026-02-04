"""URL content scraper for extracting text from web pages."""

import httpx
from bs4 import BeautifulSoup


async def extract_text_from_url(url: str) -> str:
    """Extract text content from a URL.

    Args:
        url: The URL to fetch and extract text from.

    Returns:
        Extracted text content from the page.

    Raises:
        httpx.HTTPError: If the request fails.
    """
    async with httpx.AsyncClient() as client:
        response = await client.get(
            url,
            headers={
                "User-Agent": "Mozilla/5.0 (compatible; VoiceCloneBot/1.0; +https://voiceclone.app)",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            },
            follow_redirects=True,
            timeout=30.0,
        )
        response.raise_for_status()

    soup = BeautifulSoup(response.text, "lxml")

    # Remove unwanted elements
    for element in soup(["script", "style", "nav", "footer", "header", "aside", "noscript", "iframe"]):
        element.decompose()

    # Remove common non-content elements by class/id patterns
    for element in soup.find_all(class_=lambda x: x and any(
        pattern in str(x).lower() for pattern in ["sidebar", "menu", "nav", "footer", "header", "ad", "social", "share", "comment"]
    )):
        element.decompose()

    # Find main content area
    main_content = (
        soup.find("article")
        or soup.find("main")
        or soup.find(class_=lambda x: x and any(
            pattern in str(x).lower() for pattern in ["content", "article", "post", "entry"]
        ))
        or soup.body
    )

    if not main_content:
        return ""

    # Extract text
    text = main_content.get_text(separator="\n", strip=True)

    # Clean up multiple newlines
    lines = [line.strip() for line in text.split("\n") if line.strip()]
    text = "\n\n".join(lines)

    return text
