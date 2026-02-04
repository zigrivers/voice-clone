"""Voice DNA analysis prompts."""

VOICE_DNA_ANALYSIS_PROMPT = """You are an expert linguistic analyst specializing in voice and writing style analysis. Analyze the following writing samples to extract a comprehensive "Voice DNA" profile that captures the unique characteristics of this writer.

## Instructions
{instructions}

## Writing Samples
{samples}

## Output Format
Return a JSON object with these 10 elements. For each element, provide:
- A description of the pattern
- 2-3 specific examples from the text
- Frequency/consistency notes

```json
{{
  "vocabulary_patterns": {{
    "description": "Word choice preferences, jargon, favorite phrases",
    "examples": [],
    "notes": ""
  }},
  "sentence_structure": {{
    "description": "Typical sentence length, complexity, variety",
    "examples": [],
    "notes": ""
  }},
  "paragraph_structure": {{
    "description": "Paragraph length, organization patterns",
    "examples": [],
    "notes": ""
  }},
  "tone_markers": {{
    "description": "Emotional tone, formality level, attitude",
    "examples": [],
    "notes": ""
  }},
  "rhetorical_devices": {{
    "description": "Persuasion techniques, metaphors, analogies",
    "examples": [],
    "notes": ""
  }},
  "punctuation_habits": {{
    "description": "Distinctive punctuation usage, em-dashes, ellipses",
    "examples": [],
    "notes": ""
  }},
  "opening_patterns": {{
    "description": "How they typically start content",
    "examples": [],
    "notes": ""
  }},
  "closing_patterns": {{
    "description": "How they typically end content",
    "examples": [],
    "notes": ""
  }},
  "humor_and_personality": {{
    "description": "Wit, sarcasm, personality traits that come through",
    "examples": [],
    "notes": ""
  }},
  "distinctive_signatures": {{
    "description": "Unique catchphrases, mannerisms, or habits",
    "examples": [],
    "notes": ""
  }}
}}
```

Be specific and concrete. Extract actual patterns from the text, not generic observations. The goal is to capture enough detail to replicate this voice in new content."""


def build_analysis_prompt(samples: list[str], instructions: str) -> str:
    """Build the complete analysis prompt.

    Args:
        samples: List of writing sample texts.
        instructions: Custom analysis instructions.

    Returns:
        Formatted prompt string.
    """
    # Format samples with separators
    formatted_samples = []
    for i, sample in enumerate(samples, 1):
        # Truncate very long samples for the prompt
        truncated = sample[:5000] + "..." if len(sample) > 5000 else sample
        formatted_samples.append(f"### Sample {i}\n{truncated}")

    samples_text = "\n\n".join(formatted_samples)

    return VOICE_DNA_ANALYSIS_PROMPT.format(
        instructions=instructions,
        samples=samples_text,
    )
