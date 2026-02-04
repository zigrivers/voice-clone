"""AI detection scoring service."""

import re
from collections import Counter


def calculate_detection_score(text: str, voice_dna: dict | None = None) -> dict:
    """Calculate AI detection score for generated content.

    Higher score = more human-like (less likely to be detected as AI).

    Scoring breakdown (max 100 points):
    - Sentence variety: max 20 pts
    - Vocabulary diversity: max 15 pts
    - Specificity: max 15 pts
    - Transition naturalness: max 10 pts
    - Opening/closing patterns: max 10 pts
    - Punctuation variety: max 10 pts
    - Personality markers: max 10 pts
    - Structure variety: max 10 pts

    Args:
        text: The content text to score.
        voice_dna: Optional Voice DNA for personalized scoring.

    Returns:
        Dict with 'score' (0-100) and 'breakdown' of individual scores.
    """
    if not text or not text.strip():
        return {"score": 0, "breakdown": {}}

    breakdown = {}

    # 1. Sentence variety (max 20 pts)
    breakdown["sentence_variety"] = _score_sentence_variety(text)

    # 2. Vocabulary diversity (max 15 pts)
    breakdown["vocabulary_diversity"] = _score_vocabulary_diversity(text)

    # 3. Specificity (max 15 pts)
    breakdown["specificity"] = _score_specificity(text)

    # 4. Transition naturalness (max 10 pts)
    breakdown["transition_naturalness"] = _score_transitions(text)

    # 5. Opening/closing patterns (max 10 pts)
    breakdown["opening_closing"] = _score_openings_closings(text, voice_dna)

    # 6. Punctuation variety (max 10 pts)
    breakdown["punctuation"] = _score_punctuation(text, voice_dna)

    # 7. Personality markers (max 10 pts)
    breakdown["personality"] = _score_personality(text, voice_dna)

    # 8. Structure variety (max 10 pts)
    breakdown["structure"] = _score_structure(text)

    total = sum(breakdown.values())
    total = min(total, 100)

    return {"score": total, "breakdown": breakdown}


def _get_sentences(text: str) -> list[str]:
    """Split text into sentences."""
    # Simple sentence splitting
    sentences = re.split(r"[.!?]+", text)
    return [s.strip() for s in sentences if s.strip()]


def _get_words(text: str) -> list[str]:
    """Extract words from text."""
    return re.findall(r"\b\w+\b", text.lower())


def _score_sentence_variety(text: str) -> int:
    """Score sentence length variety (max 20 pts)."""
    sentences = _get_sentences(text)
    if len(sentences) < 2:
        return 5

    lengths = [len(s.split()) for s in sentences]
    if not lengths:
        return 5

    # Calculate coefficient of variation
    mean_len = sum(lengths) / len(lengths)
    if mean_len == 0:
        return 5

    variance = sum((l - mean_len) ** 2 for l in lengths) / len(lengths)
    std_dev = variance ** 0.5
    cv = std_dev / mean_len

    # Higher CV = more variety
    if cv > 0.5:
        return 20
    elif cv > 0.4:
        return 17
    elif cv > 0.3:
        return 14
    elif cv > 0.2:
        return 10
    else:
        return 5


def _score_vocabulary_diversity(text: str) -> int:
    """Score vocabulary diversity using TTR (max 15 pts)."""
    words = _get_words(text)
    if len(words) < 10:
        return 5

    unique_words = set(words)
    ttr = len(unique_words) / len(words)

    # Adjust for text length (longer texts naturally have lower TTR)
    if len(words) > 200:
        ttr = ttr * 1.3  # Boost for longer texts

    if ttr > 0.7:
        return 15
    elif ttr > 0.6:
        return 12
    elif ttr > 0.5:
        return 9
    elif ttr > 0.4:
        return 6
    else:
        return 3


def _score_specificity(text: str) -> int:
    """Score use of specific details vs generic phrases (max 15 pts)."""
    score = 0
    text_lower = text.lower()

    # Reward specific markers
    specific_patterns = [
        r"\b\d{1,2}[%]\b",  # Percentages
        r"\b\d+[,.]\d+\b",  # Decimal numbers
        r"\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b",
        r"\b(january|february|march|april|may|june|july|august|september|october|november|december)\b",
        r"\b\d{4}\b",  # Years
        r'"[^"]+?"',  # Quoted text
        r"\b(specifically|particularly|exactly|precisely)\b",
    ]

    for pattern in specific_patterns:
        if re.search(pattern, text_lower):
            score += 2

    # Penalize generic AI phrases
    generic_phrases = [
        "in today's world",
        "in conclusion",
        "it's important to note",
        "as we all know",
        "in this day and age",
        "going forward",
        "at the end of the day",
        "it goes without saying",
    ]

    for phrase in generic_phrases:
        if phrase in text_lower:
            score -= 2

    return max(0, min(15, score + 8))


def _score_transitions(text: str) -> int:
    """Score natural vs robotic transitions (max 10 pts)."""
    text_lower = text.lower()

    # Overused AI transitions (penalize)
    ai_transitions = [
        "furthermore",
        "moreover",
        "additionally",
        "in addition",
        "consequently",
        "subsequently",
        "thus",
        "hence",
    ]

    # Natural transitions (reward)
    natural_transitions = [
        "but",
        "so",
        "and",
        "also",
        "though",
        "still",
        "yet",
        "anyway",
        "look",
        "honestly",
    ]

    ai_count = sum(1 for t in ai_transitions if t in text_lower)
    natural_count = sum(1 for t in natural_transitions if t in text_lower)

    score = 5 + (natural_count * 2) - (ai_count * 2)
    return max(0, min(10, score))


def _score_openings_closings(text: str, voice_dna: dict | None) -> int:
    """Score opening and closing patterns (max 10 pts)."""
    score = 5

    sentences = _get_sentences(text)
    if not sentences:
        return score

    first_sentence = sentences[0].lower()
    last_sentence = sentences[-1].lower() if len(sentences) > 1 else ""

    # Penalize generic AI openings
    ai_openings = [
        "in today's",
        "have you ever",
        "let me tell you",
        "i'm excited to",
    ]

    for opening in ai_openings:
        if first_sentence.startswith(opening):
            score -= 2

    # Reward direct openings
    if first_sentence[0].isupper() and len(first_sentence.split()) < 10:
        score += 2

    # Check for call-to-action variety in closing
    if last_sentence:
        cta_patterns = ["let me know", "share your", "drop a comment", "what do you think"]
        for cta in cta_patterns:
            if cta in last_sentence:
                score += 1
                break

    return max(0, min(10, score))


def _score_punctuation(text: str, voice_dna: dict | None) -> int:
    """Score punctuation variety and naturalness (max 10 pts)."""
    score = 5

    # Count punctuation types
    has_em_dash = "—" in text or " - " in text
    has_ellipsis = "..." in text or "…" in text
    has_parenthetical = "(" in text and ")" in text
    has_exclamation = "!" in text
    has_question = "?" in text

    # Reward variety
    variety_count = sum([has_em_dash, has_ellipsis, has_parenthetical, has_exclamation, has_question])
    score += min(variety_count, 3)

    # Check for natural comma usage
    comma_count = text.count(",")
    sentence_count = len(_get_sentences(text))
    if sentence_count > 0:
        comma_ratio = comma_count / sentence_count
        if 1.0 < comma_ratio < 3.0:
            score += 2

    return max(0, min(10, score))


def _score_personality(text: str, voice_dna: dict | None) -> int:
    """Score personality and voice markers (max 10 pts)."""
    score = 5
    text_lower = text.lower()

    # Look for personality indicators
    personality_markers = [
        r"\bi\b",  # First person
        r"\bwe\b",
        r"\bmy\b",
        r"\bour\b",
        r"\bhonestly\b",
        r"\bfrankly\b",
        r"\bactually\b",
        r"\bliterally\b",
        r"\bseriously\b",
        r"!",  # Emotional punctuation
        r"\?$",  # Questions
    ]

    for marker in personality_markers:
        if re.search(marker, text_lower):
            score += 0.5

    # If we have voice DNA, check for voice-specific patterns
    if voice_dna:
        signatures = voice_dna.get("distinctive_signatures", {})
        if isinstance(signatures, dict):
            examples = signatures.get("examples", [])
            for example in examples:
                if isinstance(example, str) and example.lower() in text_lower:
                    score += 2

    return max(0, min(10, int(score)))


def _score_structure(text: str) -> int:
    """Score structural variety (max 10 pts)."""
    score = 5

    # Check for paragraph variety
    paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]
    if len(paragraphs) > 1:
        para_lengths = [len(p.split()) for p in paragraphs]
        if max(para_lengths) - min(para_lengths) > 20:
            score += 2

    # Check for list usage (natural in many contexts)
    has_bullets = any(line.strip().startswith(("-", "•", "*", "→")) for line in text.split("\n"))
    has_numbers = any(re.match(r"^\d+\.", line.strip()) for line in text.split("\n"))
    if has_bullets or has_numbers:
        score += 2

    # Check for varied paragraph openings
    para_starts = [p.split()[0].lower() if p.split() else "" for p in paragraphs]
    unique_starts = len(set(para_starts))
    if unique_starts >= len(para_starts) * 0.7:
        score += 1

    return max(0, min(10, score))
