"""Voice DNA merge prompts."""

VOICE_DNA_MERGE_PROMPT = """You are an expert linguistic analyst. Your task is to merge multiple Voice DNA profiles into a single cohesive profile based on the specified element weights.

## Source Voice DNA Profiles

{source_profiles}

## Element Weights
For each Voice DNA element, use the weighted contributions specified below:

{element_weights}

## Instructions
1. For each Voice DNA element, blend the characteristics from the source profiles according to their weights
2. Higher-weighted sources should dominate that element's characteristics
3. Create natural transitions between different source styles
4. Maintain internal consistency in the merged profile
5. Preserve the most distinctive features from heavily-weighted sources

## Output Format
Return a merged Voice DNA JSON object with the same structure as the input profiles:

```json
{{
  "vocabulary_patterns": {{
    "description": "Merged vocabulary patterns",
    "examples": [],
    "notes": "Blend of sources..."
  }},
  // ... all 10 elements
}}
```

Generate the merged Voice DNA profile now."""


def build_merge_prompt(
    source_dnas: list[dict],
    source_names: list[str],
    element_weights: list[dict],
) -> str:
    """Build the complete merge prompt.

    Args:
        source_dnas: List of Voice DNA dictionaries to merge.
        source_names: Names of the source voice clones.
        element_weights: List of weight dictionaries for each source.

    Returns:
        Formatted prompt string.
    """
    # Format source profiles
    source_parts = []
    for i, (dna, name) in enumerate(zip(source_dnas, source_names)):
        source_parts.append(f"### Source {i + 1}: {name}")
        for element, data in dna.items():
            if isinstance(data, dict):
                desc = data.get("description", "")
                source_parts.append(f"**{element}:** {desc}")
            else:
                source_parts.append(f"**{element}:** {data}")
        source_parts.append("")

    # Format element weights
    weight_parts = []
    elements = list(source_dnas[0].keys()) if source_dnas else []

    for element in elements:
        element_weight_text = []
        for i, (name, weights) in enumerate(zip(source_names, element_weights)):
            weight = weights.get(element, 0)
            element_weight_text.append(f"{name}: {weight}%")
        weight_parts.append(f"**{element}:** {', '.join(element_weight_text)}")

    return VOICE_DNA_MERGE_PROMPT.format(
        source_profiles="\n".join(source_parts),
        element_weights="\n".join(weight_parts),
    )
