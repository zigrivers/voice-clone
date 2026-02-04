"""Content generation prompts."""

CONTENT_GENERATION_PROMPT = """You are a content writer who must precisely match a specific voice. Generate content that sounds exactly like the voice described in the Voice DNA profile below.

## Voice DNA Profile
{voice_dna}

## Anti-AI Detection Guidelines
{anti_ai_guidelines}

## Platform Best Practices ({platform})
{platform_practices}

## Content Request
**Input/Topic:** {input_text}

**Length:** {length}
**Tone Override:** {tone_override}
**Target Audience:** {audience}
**Call-to-Action Style:** {cta_style}

## Instructions
1. Write content that matches the Voice DNA exactly
2. Use vocabulary, sentence patterns, and personality traits from the profile
3. Follow the anti-AI detection guidelines to ensure natural, human-like output
4. Optimize for the specified platform's best practices
5. Apply any tone overrides while maintaining the core voice

Generate the content now. Output ONLY the content text, no explanations or meta-commentary."""


def build_generation_prompt(
    voice_dna: dict,
    anti_ai_guidelines: str,
    platform: str,
    platform_practices: str,
    input_text: str,
    length: str = "medium",
    tone_override: str | None = None,
    audience: str | None = None,
    cta_style: str | None = None,
) -> str:
    """Build the complete generation prompt.

    Args:
        voice_dna: The Voice DNA profile dictionary.
        anti_ai_guidelines: Custom anti-AI detection guidelines.
        platform: Target platform name.
        platform_practices: Platform-specific best practices.
        input_text: The topic or input for content generation.
        length: Desired length ('short', 'medium', 'long').
        tone_override: Optional tone override.
        audience: Optional target audience description.
        cta_style: Optional call-to-action style.

    Returns:
        Formatted prompt string.
    """
    # Format Voice DNA for the prompt
    dna_parts = []
    for element, data in voice_dna.items():
        if isinstance(data, dict):
            desc = data.get("description", "")
            examples = data.get("examples", [])
            examples_text = ", ".join(f'"{ex}"' for ex in examples[:3]) if examples else "N/A"
            dna_parts.append(f"**{element.replace('_', ' ').title()}:** {desc}\n  Examples: {examples_text}")
        else:
            dna_parts.append(f"**{element.replace('_', ' ').title()}:** {data}")

    voice_dna_text = "\n\n".join(dna_parts)

    # Format length guidance
    length_guidance = {
        "short": "Keep it concise, 50-100 words",
        "medium": "Standard length, 150-300 words",
        "long": "Comprehensive, 400-600 words",
    }.get(length, "Standard length")

    return CONTENT_GENERATION_PROMPT.format(
        voice_dna=voice_dna_text,
        anti_ai_guidelines=anti_ai_guidelines,
        platform=platform,
        platform_practices=platform_practices,
        input_text=input_text,
        length=length_guidance,
        tone_override=tone_override or "Use voice's natural tone",
        audience=audience or "General audience",
        cta_style=cta_style or "Natural, non-pushy",
    )
