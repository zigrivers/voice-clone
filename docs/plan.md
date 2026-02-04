# Voice Clone Tool - Product Requirements Document (PRD)

**Version**: 1.1
**Created**: February 4, 2026
**Updated**: February 4, 2026
**Status**: Draft - Awaiting Approval

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Product Vision](#2-product-vision)
3. [User Personas](#3-user-personas)
4. [Feature Specifications](#4-feature-specifications)
   - 4.1 Voice Clone Methodology Settings
   - 4.2 Voice Clone Generator
   - 4.3 Voice Clone Merger
   - 4.4 Voice Clone Content Creator
   - 4.5 Content Library
   - 4.6 Platform Output Manager
5. [Technical Architecture](#5-technical-architecture)
6. [Data Models](#6-data-models)
7. [AI Integration Specifications](#7-ai-integration-specifications)
8. [User Interface Requirements](#8-user-interface-requirements)
9. [Non-Functional Requirements](#9-non-functional-requirements)
10. [Future Considerations (V2+)](#10-future-considerations-v2)
11. [Open Questions & Decisions](#11-open-questions--decisions)
12. [Glossary](#12-glossary)

---

## 1. Executive Summary

### What We're Building

A web application that analyzes writing samples to capture a writer's unique "voice DNA," then uses that DNA to generate new content that authentically replicates their writing style. The system can merge multiple voice clones to create unique combinations and format content for various platforms.

### Core Value Proposition

- **Authentic voice replication**: Content that genuinely sounds like the writer, not generic AI output
- **Voice merging**: Combine elements from multiple writers (e.g., one person's structure with another's humor)
- **Multi-platform optimization**: Single input generates platform-optimized content for LinkedIn, Twitter, blogs, etc.
- **AI detection avoidance**: Built-in heuristics to ensure content reads naturally and avoids AI tells

### Primary Use Cases

1. **Personal content scaling**: Create more content in your own voice without writing everything manually
2. **Ghostwriting**: Write content that authentically sounds like clients based on their writing samples
3. **Voice experimentation**: Merge voices to create new stylistic combinations

### V1 Scope Summary

| Included in V1 | Deferred to V2+ |
|----------------|-----------------|
| Voice clone creation & management | Content Automator (scheduling) |
| Writing sample input (paste, upload, URL) | Auto-posting to platforms |
| Voice DNA analysis | Multi-user / Teams |
| Voice clone merging | Mobile optimization |
| Content generation | External AI detection APIs |
| Platform-specific formatting | Voice clone import |
| Content library | |
| Custom AI detection heuristics | |
| OAuth authentication (Google/GitHub) | |
| AI provider configuration & usage tracking | |
| Voice clone data export | |
| Content templates | |
| A/B content variations | |

---

## 2. Product Vision

### Mission Statement

Enable anyone to scale their authentic written voice across platforms without sacrificing the personal touch that makes their writing distinctive.

### Success Metrics

| Metric | Target | How Measured |
|--------|--------|--------------|
| Voice clone accuracy | User rates generated content as "sounds like me" 80%+ of the time | In-app feedback after generation |
| AI naturalness score | Average score of 75+ on custom heuristics | Automated scoring |
| Time savings | 70% reduction in content creation time | User survey |
| Content usability | 90% of generated content used with minimal edits | Track edit percentage before copy/export |

### Design Principles

1. **Accuracy over speed**: Better to take longer and get the voice right than generate fast but generic content
2. **User control**: Expose the knobs and settings that matter; don't hide complexity that affects output
3. **Transparent AI**: Show confidence scores, explain what the system knows and doesn't know
4. **Iterative refinement**: Easy to regenerate, tweak, and improve until it's right

---

## 3. User Personas

### Primary Persona: Content Creator / Thought Leader

**Name**: Alex
**Role**: Consultant who builds personal brand through content
**Goals**:
- Publish consistently on LinkedIn and Twitter without spending hours writing
- Maintain authentic voice that followers recognize
- Occasionally ghostwrite for executive clients

**Pain Points**:
- AI-generated content sounds generic and "off"
- Editing AI content takes almost as long as writing from scratch
- Different platforms require different formats

**How Voice Clone Helps**:
- Captures Alex's unique voice from existing content
- Generates platform-optimized content that sounds authentic
- For ghostwriting, creates separate voice clones for each client

### Secondary Persona: Marketing Team Lead

**Name**: Jordan
**Role**: Manages content for multiple team members
**Goals**:
- Scale content production across team
- Maintain consistent voice per team member
- Streamline content approval workflow

**Pain Points**:
- Each team member writes differently; hard to maintain consistency
- Reviewing and editing AI content is time-consuming
- Content often needs reformatting for each platform

**How Voice Clone Helps**: (V2 when multi-user is added)
- Central library of voice clones for team
- Consistent output per person
- One input generates all platform variants

---

## 4. Feature Specifications

### 4.1 Voice Clone Methodology Settings

**Purpose**: Configure the global instructions and guidelines that govern how the system analyzes writing samples and generates content.

#### 4.1.1 Voice Cloning Instructions

**Description**: Editable instructions that define how the AI should analyze writing samples to extract voice DNA.

**Requirements**:

| ID | Requirement | Priority |
|----|-------------|----------|
| VCM-001 | System shall provide default voice cloning instructions | Must Have |
| VCM-002 | User shall be able to view current voice cloning instructions | Must Have |
| VCM-003 | User shall be able to edit voice cloning instructions | Must Have |
| VCM-004 | System shall save instruction edit history (last 10 versions) | Should Have |
| VCM-005 | User shall be able to revert to a previous instruction version | Should Have |
| VCM-006 | System shall display when instructions were last modified | Must Have |

**Default Voice Cloning Instructions** (editable by user):

```
When analyzing writing samples to create a voice clone, identify and document:

1. VOCABULARY PATTERNS
   - Preferred words and phrases
   - Industry jargon or technical terms used
   - Avoided words or phrases
   - Unique expressions or coinages

2. SENTENCE STRUCTURE
   - Average sentence length
   - Sentence length variation patterns
   - Simple vs. complex sentence ratio
   - Use of fragments or run-ons (stylistic)

3. PARAGRAPH STRUCTURE
   - Average paragraph length
   - How ideas are organized within paragraphs
   - Transition patterns between paragraphs

4. TONE MARKERS
   - Formality level (1-10 scale)
   - Confidence level in assertions
   - Use of hedging language
   - Directness vs. indirectness

5. RHETORICAL DEVICES
   - Metaphor and analogy usage
   - Storytelling patterns
   - Use of questions (rhetorical or direct)
   - Call-to-action style

6. PUNCTUATION HABITS
   - Em dash usage
   - Parenthetical asides
   - Exclamation point frequency
   - Ellipsis usage
   - Oxford comma preference

7. OPENING PATTERNS
   - How pieces typically begin
   - Hook styles used
   - First sentence patterns

8. CLOSING PATTERNS
   - How pieces typically end
   - Call-to-action presence
   - Summary vs. forward-looking endings

9. HUMOR AND PERSONALITY
   - Humor style (if present)
   - Self-reference patterns
   - Personality traits that come through

10. DISTINCTIVE SIGNATURES
    - Any unique patterns not covered above
    - Quirks that make this voice recognizable
```

#### 4.1.2 Anti-AI Detection Guidelines

**Description**: Editable instructions that define how generated content should be crafted to avoid AI detection tells.

**Requirements**:

| ID | Requirement | Priority |
|----|-------------|----------|
| VCM-010 | System shall provide default anti-AI guidelines | Must Have |
| VCM-011 | User shall be able to view current anti-AI guidelines | Must Have |
| VCM-012 | User shall be able to edit anti-AI guidelines | Must Have |
| VCM-013 | System shall save guideline edit history (last 10 versions) | Should Have |
| VCM-014 | User shall be able to revert to a previous guideline version | Should Have |

**Default Anti-AI Guidelines** (editable by user):

```
When generating content, follow these guidelines to ensure natural, human-like output:

AVOID THESE AI TELLS:
- Starting paragraphs with "In today's [X]..." or "In the world of..."
- Overusing transitional phrases: "Furthermore," "Moreover," "Additionally"
- Generic opening hooks without specific details
- Perfect parallel structure in every list
- Overly balanced "on one hand... on the other hand" constructions
- Summarizing conclusions that restate all points
- Exclamation points for false enthusiasm
- Phrases like "It's important to note that..." or "It's worth mentioning..."
- Generic calls-to-action without personality

EMBRACE THESE HUMAN PATTERNS:
- Specific, concrete details and examples
- Imperfect sentence structures (occasional fragments, varied lengths)
- Personal anecdotes or observations
- Opinions stated directly without excessive hedging
- Natural conversation flow vs. essay structure
- Unexpected word choices that fit the voice
- Humor or personality appropriate to the voice clone
- Incomplete thoughts that trust the reader
- References to real events, people, or experiences

SENTENCE VARIETY:
- Vary sentence openings (don't start 3+ sentences the same way)
- Mix short punchy sentences with longer complex ones
- Use questions sparingly but naturally
- Break "rules" occasionally in ways the voice clone would

AUTHENTICITY MARKERS:
- Include voice-specific phrases from the DNA
- Match the vocabulary level of the voice clone
- Maintain consistent tone throughout
- Add specific details that ground the content
```

#### 4.1.3 Platform Best Practices

**Description**: Configurable best practices for each content platform that guide how content should be formatted and optimized.

**Requirements**:

| ID | Requirement | Priority |
|----|-------------|----------|
| VCM-020 | System shall provide default best practices for: LinkedIn, Twitter/X, Facebook, Instagram, Email, Blog, SMS | Must Have |
| VCM-021 | User shall be able to view best practices for each platform | Must Have |
| VCM-022 | User shall be able to edit best practices for each platform | Must Have |
| VCM-023 | User shall be able to add new platforms | Should Have |
| VCM-024 | System shall save best practices edit history per platform (last 10 versions) | Should Have |
| VCM-025 | User shall be able to revert to previous best practices version | Should Have |

**Default Platform Best Practices**:

<details>
<summary><strong>LinkedIn Best Practices</strong></summary>

```
LINKEDIN CONTENT BEST PRACTICES

FORMAT:
- Optimal length: 1,200-1,500 characters for feed posts
- Use line breaks liberally (single-spaced lines perform better)
- First line is critical - must hook reader before "see more"
- Use 3-5 relevant hashtags at the end (not inline)
- Emojis: Use sparingly, 1-3 max, as visual breaks

STRUCTURE:
- Hook (1-2 lines): Pattern interrupt, bold claim, or question
- Body: Short paragraphs, 1-3 sentences each
- Value delivery: Insight, lesson, or actionable takeaway
- Engagement prompt: Question or invitation to comment

TONE:
- Professional but personal
- First-person perspective works well
- Share lessons learned, not just achievements
- Vulnerability performs well when authentic

AVOID:
- Wall of text with no line breaks
- Clickbait hooks that don't deliver
- Excessive self-promotion
- Generic motivational content
- Too many hashtags (looks spammy)

OPTIMAL POSTING:
- Tuesday-Thursday, 8-10am or 5-6pm local time
- Engage with comments in first hour
```
</details>

<details>
<summary><strong>Twitter/X Best Practices</strong></summary>

```
TWITTER/X CONTENT BEST PRACTICES

FORMAT:
- Single tweets: 240-280 characters optimal (leave room for RT comments)
- Threads: 5-15 tweets, numbered format optional
- First tweet must stand alone AND hook into thread
- Use line breaks within tweets for readability

STRUCTURE (Single Tweet):
- One clear idea per tweet
- Hook + insight + (optional) call to action
- Questions drive engagement

STRUCTURE (Thread):
- Tweet 1: Hook + promise of value ("A thread on X")
- Body tweets: One point per tweet, building on each other
- Final tweet: Summary + call to action + "Follow for more"

TONE:
- Conversational and direct
- Hot takes perform well (if authentic to voice)
- Share opinions, not just information
- Personality > polish

AVOID:
- Threads that should have been blog posts
- Every tweet starting the same way
- Excessive hashtags (1-2 max, often 0)
- Asking for retweets explicitly

OPTIMAL POSTING:
- Multiple times per day is acceptable
- Early morning and lunch perform well
- Weekends often underutilized
```
</details>

<details>
<summary><strong>Facebook Best Practices</strong></summary>

```
FACEBOOK CONTENT BEST PRACTICES

FORMAT:
- Optimal length: 100-250 characters for engagement
- Longer posts (500+) work for storytelling
- Images/video significantly boost reach
- Link posts get lower organic reach

STRUCTURE:
- Hook question or statement
- Brief context or story
- Clear point or takeaway
- Engagement question

TONE:
- More personal/casual than LinkedIn
- Community-focused language
- Emotional resonance matters
- Authentic > polished

AVOID:
- Engagement bait ("Comment YES if...")
- External links in every post (kills reach)
- Overly promotional content
- Ignoring comments
```
</details>

<details>
<summary><strong>Instagram Best Practices</strong></summary>

```
INSTAGRAM CONTENT BEST PRACTICES

FORMAT:
- Caption length: Can be long (2,200 char max) but hook matters
- First 125 characters show before "more"
- 20-30 hashtags in first comment (not caption)
- Emojis work well as visual breaks

STRUCTURE:
- Hook line (first 125 chars critical)
- Story or context
- Value or insight
- Call to action
- Hashtags in first comment

TONE:
- Authentic and relatable
- Behind-the-scenes performs well
- Personal stories > polished content
- Conversational

AVOID:
- Hashtags in the main caption (move to comments)
- Only posting promotional content
- Ignoring DMs and comments
- Stock photo aesthetic
```
</details>

<details>
<summary><strong>Email Best Practices</strong></summary>

```
EMAIL CONTENT BEST PRACTICES

FORMAT:
- Subject line: 30-50 characters, curiosity-driven
- Preview text: Complements subject, doesn't repeat it
- Body: Scannable, short paragraphs
- Clear single CTA

STRUCTURE:
- Subject: Hook/curiosity
- Opening: Personal, direct entry (no "I hope this finds you well")
- Body: Value delivery, one main point
- CTA: Single, clear next step
- Sign-off: Consistent with voice

TONE:
- Personal, one-to-one feel
- Write like talking to one person
- Match formality to relationship
- Be direct about the ask

AVOID:
- Multiple CTAs competing
- Walls of text
- Overly formal openings
- Burying the point
```
</details>

<details>
<summary><strong>Blog Best Practices</strong></summary>

```
BLOG CONTENT BEST PRACTICES

FORMAT:
- Length: 1,500-2,500 words for SEO value
- Use headers (H2, H3) every 300-400 words
- Short paragraphs (2-4 sentences)
- Include images/visuals to break up text

STRUCTURE:
- Title: Clear value proposition, keyword-aware
- Introduction: Hook + promise + brief roadmap
- Body: Logical sections with clear headers
- Conclusion: Summary + next steps + CTA

TONE:
- Match the voice clone's natural style
- More depth than social content
- Can be more nuanced/complex
- Educational or thought-provoking

AVOID:
- Keyword stuffing
- Generic stock images
- No internal/external links
- Missing meta description

SEO CONSIDERATIONS:
- Primary keyword in title, first paragraph, headers
- Meta description: 150-160 characters
- Alt text for images
- Internal links to related content
```
</details>

<details>
<summary><strong>SMS/Messaging Best Practices</strong></summary>

```
SMS/MESSAGING CONTENT BEST PRACTICES

FORMAT:
- Length: Under 160 characters ideal (single SMS)
- No subject line
- Minimal formatting
- Clear sender identification

STRUCTURE:
- Identify yourself (if not obvious)
- Get to point immediately
- Single clear action/info
- Sign-off only if needed

TONE:
- Extremely casual
- Brief and direct
- Time-sensitive feel
- Personal

AVOID:
- Multiple points per message
- Formal language
- Long paragraphs
- Unclear purpose
```
</details>

---

### 4.2 Voice Clone Generator

**Purpose**: Create, manage, and maintain voice clones that capture a writer's unique DNA.

#### 4.2.1 Voice Clone Creation

**Requirements**:

| ID | Requirement | Priority |
|----|-------------|----------|
| VCG-001 | User shall be able to create a new voice clone with a unique name | Must Have |
| VCG-002 | User shall be able to add description to voice clone | Must Have |
| VCG-003 | User shall be able to add tags to voice clone for organization | Should Have |
| VCG-004 | System shall validate that voice clone name is unique | Must Have |
| VCG-005 | System shall assign a unique ID to each voice clone | Must Have |
| VCG-006 | System shall record creation timestamp | Must Have |
| VCG-007 | User shall be able to add a photo/avatar for the voice clone | Nice to Have |

**Voice Clone Metadata Fields**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | UUID | Auto | Unique identifier |
| name | String | Yes | Display name (e.g., "Ken - Professional") |
| description | Text | No | Description of this voice clone's style/purpose |
| tags | Array[String] | No | Tags for organization |
| avatar_url | String | No | Optional image URL |
| is_merged | Boolean | Auto | True if this is a merged voice clone |
| source_clones | Array[UUID] | Auto | If merged, the source voice clone IDs |
| created_at | Timestamp | Auto | Creation time |
| updated_at | Timestamp | Auto | Last modification time |

#### 4.2.2 Writing Sample Management

**Requirements**:

| ID | Requirement | Priority |
|----|-------------|----------|
| VCG-010 | User shall be able to add writing samples via copy/paste text | Must Have |
| VCG-011 | User shall be able to add writing samples via file upload | Must Have |
| VCG-012 | Supported file types: .txt, .docx, .pdf | Must Have |
| VCG-013 | User shall be able to add writing samples via URL | Must Have |
| VCG-014 | System shall extract text content from uploaded files | Must Have |
| VCG-015 | System shall extract text content from URLs (web scraping) | Must Have |
| VCG-016 | User shall be able to view all samples for a voice clone | Must Have |
| VCG-017 | User shall be able to delete individual samples | Must Have |
| VCG-018 | User shall be able to edit sample metadata (title, source, type) | Should Have |
| VCG-019 | System shall display word count per sample | Must Have |
| VCG-020 | System shall display total word count across all samples | Must Have |
| VCG-021 | No limit on number of samples that can be added | Must Have |
| VCG-022 | System shall handle URL scraping failures gracefully with error message | Must Have |

**Writing Sample Data Model**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | UUID | Auto | Unique identifier |
| voice_clone_id | UUID | Yes | Parent voice clone |
| title | String | No | User-provided title |
| source_type | Enum | Yes | 'paste', 'file', 'url' |
| source_reference | String | No | Filename or URL |
| content | Text | Yes | Extracted text content |
| word_count | Integer | Auto | Calculated word count |
| content_type | Enum | No | 'tweet', 'blog', 'email', 'article', 'other' |
| created_at | Timestamp | Auto | When sample was added |

#### 4.2.3 Confidence Score

**Purpose**: Provide feedback on whether there are sufficient writing samples to accurately clone the voice.

**Requirements**:

| ID | Requirement | Priority |
|----|-------------|----------|
| VCG-030 | System shall calculate confidence score (1-100) for each voice clone | Must Have |
| VCG-031 | Score shall update automatically when samples are added/removed | Must Have |
| VCG-032 | System shall display score prominently on voice clone detail page | Must Have |
| VCG-033 | System shall provide specific recommendations to improve score | Must Have |
| VCG-034 | Recommendations shall identify what's missing (e.g., "Add longer-form content") | Must Have |

**Confidence Score Algorithm**:

```
CONFIDENCE SCORE CALCULATION (1-100)

Base Score Components:
1. WORD COUNT SCORE (max 30 points)
   - < 500 words: 5 points
   - 500-1000 words: 10 points
   - 1000-2500 words: 15 points
   - 2500-5000 words: 20 points
   - 5000-10000 words: 25 points
   - > 10000 words: 30 points

2. SAMPLE COUNT SCORE (max 20 points)
   - 1-2 samples: 5 points
   - 3-5 samples: 10 points
   - 6-10 samples: 15 points
   - > 10 samples: 20 points

3. CONTENT TYPE VARIETY (max 20 points)
   - 1 content type: 5 points
   - 2 content types: 10 points
   - 3 content types: 15 points
   - 4+ content types: 20 points

4. SAMPLE LENGTH DISTRIBUTION (max 15 points)
   - Only short-form (<300 words): 5 points
   - Only long-form (>300 words): 5 points
   - Mix of short and long: 15 points

5. CONSISTENCY SCORE (max 15 points)
   - Calculated during DNA analysis
   - How consistent is the voice across samples?
   - Highly consistent: 15 points
   - Moderately consistent: 10 points
   - Inconsistent (may indicate mixed authors): 5 points

TOTAL: Sum of all components (max 100)

SCORE INTERPRETATION:
- 80-100: High confidence - voice clone ready for use
- 60-79: Medium confidence - usable, but more samples recommended
- 40-59: Low confidence - add more samples for better results
- 0-39: Very low - insufficient samples for reliable cloning
```

**Recommendation Engine**:

Based on score components, provide specific recommendations:

| Condition | Recommendation |
|-----------|----------------|
| Word count < 2500 | "Add more writing samples to improve accuracy. You have {X} words; aim for at least 2,500." |
| Sample count < 5 | "Add more samples. Different pieces help capture voice variety." |
| Content type variety < 2 | "Add different content types (blog posts, emails, tweets) to capture full range." |
| Only short-form | "Add longer-form content (articles, blog posts) for better sentence/paragraph analysis." |
| Only long-form | "Add short-form content (tweets, brief emails) to capture concise voice." |
| Low consistency | "Samples show inconsistent voice. Verify all samples are from the same author." |

#### 4.2.4 Voice DNA Analysis

**Purpose**: Analyze writing samples and generate the voice DNA document that captures the writer's unique patterns.

**Requirements**:

| ID | Requirement | Priority |
|----|-------------|----------|
| VCG-040 | User shall be able to trigger DNA analysis for a voice clone | Must Have |
| VCG-041 | System shall analyze all writing samples using AI | Must Have |
| VCG-042 | System shall generate structured Voice DNA document | Must Have |
| VCG-043 | DNA analysis shall follow Voice Cloning Instructions from settings | Must Have |
| VCG-044 | System shall display analysis status (pending, processing, complete, failed) | Must Have |
| VCG-045 | User shall be able to view generated Voice DNA | Must Have |
| VCG-046 | User shall be able to manually edit Voice DNA | Should Have |
| VCG-047 | Analysis shall complete within 60 seconds for typical sample sets | Should Have |

**Voice DNA Structure**:

```json
{
  "version": "1.0",
  "generated_at": "2026-02-04T12:00:00Z",
  "analysis_summary": {
    "total_words_analyzed": 15000,
    "sample_count": 12,
    "content_types": ["blog", "twitter", "email"],
    "confidence_score": 85
  },
  "vocabulary": {
    "preferred_words": ["actually", "fundamentally", "leverage"],
    "avoided_words": ["synergy", "circle back"],
    "technical_terms": ["API", "infrastructure", "scalability"],
    "unique_expressions": ["here's the thing", "let me be direct"],
    "vocabulary_level": "professional with casual touches",
    "jargon_frequency": "moderate"
  },
  "sentence_structure": {
    "average_length": 18,
    "length_variance": "high",
    "complexity_distribution": {
      "simple": 0.4,
      "compound": 0.35,
      "complex": 0.25
    },
    "fragment_usage": "occasional for emphasis",
    "typical_patterns": [
      "Short declarative. Then elaboration.",
      "Question followed by direct answer."
    ]
  },
  "paragraph_structure": {
    "average_length": 3,
    "organization": "topic sentence followed by examples",
    "transition_style": "minimal explicit transitions"
  },
  "tone_markers": {
    "formality_level": 6,
    "confidence_level": 8,
    "hedging_frequency": "low",
    "directness": "high",
    "warmth": "moderate"
  },
  "rhetorical_devices": {
    "metaphor_usage": "frequent",
    "favorite_metaphors": ["building/construction", "journey/path"],
    "analogy_style": "business to everyday comparisons",
    "question_usage": "rhetorical questions to set up points",
    "storytelling": "brief anecdotes, not extended narratives",
    "cta_style": "direct and specific"
  },
  "punctuation_habits": {
    "em_dash_usage": "frequent",
    "parenthetical_frequency": "moderate",
    "exclamation_frequency": "rare",
    "ellipsis_usage": "never",
    "oxford_comma": true,
    "semicolon_usage": "occasional"
  },
  "opening_patterns": {
    "typical_hooks": ["bold claim", "direct question", "surprising stat"],
    "avoided_openings": ["In today's world", "Have you ever wondered"],
    "first_sentence_style": "short and punchy"
  },
  "closing_patterns": {
    "typical_endings": ["call to action", "forward-looking statement"],
    "summary_style": "brief or none",
    "sign_off_phrases": ["Let me know what you think", "Curious to hear your take"]
  },
  "humor_and_personality": {
    "humor_presence": true,
    "humor_style": "dry, self-deprecating",
    "humor_frequency": "occasional",
    "personality_traits": ["confident", "pragmatic", "slightly irreverent"],
    "self_reference_style": "acknowledges own limitations"
  },
  "distinctive_signatures": {
    "unique_patterns": [
      "Often uses 'Look,' to start a paragraph when making a strong point",
      "Numbers things without announcing it as a list",
      "Uses 'genuinely' instead of 'really' for emphasis"
    ],
    "recognizable_phrases": ["Here's the thing:", "Let's be honest:"],
    "idiosyncrasies": ["Rarely uses the word 'very'"]
  },
  "example_phrases": {
    "characteristic_openings": [
      "Look, here's the thing:",
      "I'll be direct:",
      "Let's cut through the noise:"
    ],
    "characteristic_transitions": [
      "That said,",
      "Here's where it gets interesting:",
      "The real question is:"
    ],
    "characteristic_closings": [
      "Curious what you think.",
      "Let me know if you see it differently.",
      "More on this soon."
    ]
  }
}
```

#### 4.2.5 Voice Clone Versioning

**Requirements**:

| ID | Requirement | Priority |
|----|-------------|----------|
| VCG-050 | System shall save previous Voice DNA when regenerated | Must Have |
| VCG-051 | System shall retain last 10 versions of Voice DNA | Must Have |
| VCG-052 | User shall be able to view version history | Must Have |
| VCG-053 | User shall be able to revert to a previous Voice DNA version | Must Have |
| VCG-054 | Reverting shall not affect content already generated | Must Have |
| VCG-055 | System shall display what changed between versions (diff) | Nice to Have |

**Version Data Model**:

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Version identifier |
| voice_clone_id | UUID | Parent voice clone |
| version_number | Integer | Sequential version number |
| voice_dna | JSON | The Voice DNA document |
| created_at | Timestamp | When this version was created |
| trigger | Enum | 'initial', 'regenerate', 'manual_edit', 'revert' |
| notes | String | Optional notes about the change |

---

### 4.3 Voice Clone Merger

**Purpose**: Combine elements from multiple voice clones to create new hybrid voices.

#### 4.3.1 Merge Creation

**Requirements**:

| ID | Requirement | Priority |
|----|-------------|----------|
| VCM-101 | User shall be able to select 2+ existing voice clones to merge | Must Have |
| VCM-102 | User shall be able to specify which elements to take from each clone | Must Have |
| VCM-103 | User shall be able to assign weights to each element source | Must Have |
| VCM-104 | User shall be able to name the merged voice clone | Must Have |
| VCM-105 | System shall generate new Voice DNA for merged clone | Must Have |
| VCM-106 | Merged clone shall be usable like any other voice clone | Must Have |
| VCM-107 | System shall track which clones a merged clone was created from | Must Have |
| VCM-108 | Maximum 5 source clones per merge | Should Have |

**Mergeable Elements**:

| Element | Description | Weight Range |
|---------|-------------|--------------|
| vocabulary | Word choices, phrases, technical terms | 0-100% |
| sentence_structure | Length, complexity, patterns | 0-100% |
| paragraph_structure | Organization, transitions | 0-100% |
| tone | Formality, confidence, warmth | 0-100% |
| rhetorical_devices | Metaphors, analogies, questions | 0-100% |
| punctuation | Dashes, parentheticals, etc. | 0-100% |
| openings | How pieces begin | 0-100% |
| closings | How pieces end | 0-100% |
| humor | Humor style and frequency | 0-100% |
| personality | Overall personality markers | 0-100% |

**Example Merge Configuration**:

```json
{
  "name": "Ken with Sam's Humor",
  "description": "My professional voice with Sam's wit injected",
  "sources": [
    {
      "voice_clone_id": "uuid-ken",
      "elements": {
        "vocabulary": 100,
        "sentence_structure": 100,
        "paragraph_structure": 100,
        "tone": 80,
        "rhetorical_devices": 70,
        "punctuation": 100,
        "openings": 90,
        "closings": 90,
        "humor": 20,
        "personality": 80
      }
    },
    {
      "voice_clone_id": "uuid-sam",
      "elements": {
        "vocabulary": 0,
        "sentence_structure": 0,
        "paragraph_structure": 0,
        "tone": 20,
        "rhetorical_devices": 30,
        "punctuation": 0,
        "openings": 10,
        "closings": 10,
        "humor": 80,
        "personality": 20
      }
    }
  ]
}
```

#### 4.3.2 Merge DNA Generation

**Requirements**:

| ID | Requirement | Priority |
|----|-------------|----------|
| VCM-110 | System shall generate merged Voice DNA based on element weights | Must Have |
| VCM-111 | For each element, system shall blend source DNA proportionally | Must Have |
| VCM-112 | System shall resolve conflicts intelligently (e.g., contradictory tones) | Must Have |
| VCM-113 | User shall be able to preview merged DNA before saving | Should Have |
| VCM-114 | User shall be able to regenerate merged DNA if source clones change | Must Have |

**Merge Algorithm**:

For each DNA element:
1. Extract element from each source clone
2. Apply weight percentage
3. Combine weighted elements:
   - Numeric values: Weighted average
   - Arrays: Weighted selection (higher weight = more items selected)
   - Strings: Select from highest-weighted source
   - Objects: Recursively apply merge logic

---

### 4.4 Voice Clone Content Creator

**Purpose**: Generate new content using a selected voice clone.

#### 4.4.1 Content Creation Workflow

**User Flow**:

1. Select voice clone (single clone or merged clone)
2. Enter content input (rough ideas, bullets, or draft)
3. Configure content properties
4. Select target platform(s)
5. Generate content
6. Review AI detection score
7. Edit/regenerate if needed
8. Save to library or copy/export

#### 4.4.2 Content Input

**Requirements**:

| ID | Requirement | Priority |
|----|-------------|----------|
| VCC-001 | User shall be able to enter rough content (bullets, ideas, draft) | Must Have |
| VCC-002 | Content input shall support rich text or markdown | Should Have |
| VCC-003 | User shall be able to specify topic/subject if different from input | Must Have |
| VCC-004 | User shall be able to attach reference materials | Nice to Have |
| VCC-005 | System shall support input up to 10,000 characters | Must Have |

#### 4.4.3 Content Properties

**Requirements**:

| ID | Requirement | Priority |
|----|-------------|----------|
| VCC-010 | User shall be able to specify target platform(s) | Must Have |
| VCC-011 | User shall be able to specify approximate length | Must Have |
| VCC-012 | User shall be able to set tone override (1-10 scale) | Must Have |
| VCC-013 | User shall be able to set humor level (1-10 scale) | Must Have |
| VCC-014 | User shall be able to set formality override (1-10 scale) | Must Have |
| VCC-015 | User shall be able to specify target audience | Must Have |
| VCC-016 | User shall be able to specify call-to-action style | Should Have |
| VCC-017 | User shall be able to specify phrases/words to include | Should Have |
| VCC-018 | User shall be able to specify phrases/words to exclude | Should Have |

**Content Properties Model**:

| Property | Type | Options/Range | Default |
|----------|------|---------------|---------|
| platforms | Array[Enum] | linkedin, twitter, facebook, instagram, email, blog, sms | Required |
| length | Enum | short, medium, long, custom | medium |
| length_custom | Integer | Word count (if custom) | - |
| tone_override | Integer | 1-10 (null = use voice DNA) | null |
| humor_level | Integer | 1-10 (null = use voice DNA) | null |
| formality_override | Integer | 1-10 (null = use voice DNA) | null |
| target_audience | String | Free text description | null |
| cta_style | Enum | none, soft, direct, urgent | soft |
| include_phrases | Array[String] | Phrases to work in | [] |
| exclude_phrases | Array[String] | Phrases to avoid | [] |

#### 4.4.4 Content Generation

**Requirements**:

| ID | Requirement | Priority |
|----|-------------|----------|
| VCC-020 | System shall generate content using selected voice clone's DNA | Must Have |
| VCC-021 | System shall follow platform best practices from settings | Must Have |
| VCC-022 | System shall follow anti-AI guidelines from settings | Must Have |
| VCC-023 | If multiple platforms selected, generate optimized version for each | Must Have |
| VCC-024 | System shall display generation status | Must Have |
| VCC-025 | Generation shall complete within 30 seconds per platform | Should Have |
| VCC-026 | System shall support streaming generation (real-time output) | Nice to Have |

**Generation Prompt Template**:

```
You are a ghostwriter who has deeply studied a specific writer's voice and style.
You will write content that authentically sounds like this writer.

## Voice DNA
{voice_dna_json}

## Anti-AI Guidelines
{anti_ai_guidelines}

## Platform Best Practices
{platform_best_practices}

## Task
Write a {platform} post based on the following input:

**Input Content:**
{user_input}

**Requirements:**
- Target audience: {target_audience}
- Length: {length}
- Tone: {tone_override or "match voice DNA"}
- Humor level: {humor_level or "match voice DNA"}
- Formality: {formality_override or "match voice DNA"}
- Call-to-action style: {cta_style}
- Include these phrases naturally: {include_phrases}
- Avoid these phrases: {exclude_phrases}

**Critical Instructions:**
1. Write in the exact voice described in the Voice DNA
2. Use the specific vocabulary, sentence patterns, and personality markers
3. Follow the anti-AI guidelines strictly
4. Optimize for the platform's best practices
5. Make it sound authentically human, not AI-generated

Write the content now:
```

#### 4.4.5 AI Detection Scoring

**Purpose**: Score generated content for naturalness and AI detection risk.

**Requirements**:

| ID | Requirement | Priority |
|----|-------------|----------|
| VCC-030 | System shall score all generated content (0-100) | Must Have |
| VCC-031 | System shall display score prominently with interpretation | Must Have |
| VCC-032 | System shall provide specific feedback on potential issues | Must Have |
| VCC-033 | User shall be able to request re-generation to improve score | Must Have |
| VCC-034 | Score shall be calculated using custom heuristics | Must Have |

**AI Detection Heuristics**:

```
NATURALNESS SCORING ALGORITHM (0-100)

1. SENTENCE VARIETY (max 20 points)
   - Analyze sentence length distribution
   - Check for varied sentence openings
   - Look for structural diversity
   - Penalize: Same opening for 3+ sentences, uniform length

2. VOCABULARY DIVERSITY (max 15 points)
   - Unique word ratio (type-token ratio)
   - Check for overused AI phrases
   - Verify vocabulary matches voice DNA
   - Penalize: "Furthermore," "Additionally," "It's important to note"

3. SPECIFICITY SCORE (max 15 points)
   - Count concrete details vs. vague generalities
   - Look for specific examples, numbers, names
   - Check for personal/experiential markers
   - Penalize: Generic statements that could apply to anything

4. TRANSITION NATURALNESS (max 10 points)
   - Variety of transition types
   - Implicit vs. explicit transitions
   - Flow between paragraphs
   - Penalize: Every paragraph starting with explicit transition

5. OPENING/CLOSING QUALITY (max 10 points)
   - Matches voice DNA patterns
   - Avoids AI-typical structures
   - Authentic hook and conclusion
   - Penalize: "In today's world," generic CTA

6. PUNCTUATION AUTHENTICITY (max 10 points)
   - Matches voice DNA punctuation patterns
   - Natural rhythm
   - Appropriate use of em dashes, etc.
   - Penalize: Deviation from voice DNA patterns

7. PERSONALITY PRESENCE (max 10 points)
   - Voice personality comes through
   - Opinions stated when appropriate
   - Authentic perspective
   - Penalize: Generic, personality-less content

8. STRUCTURAL NATURALNESS (max 10 points)
   - Not overly formatted/perfect
   - Appropriate for platform
   - Human-like organization
   - Penalize: Perfect parallelism, over-structured lists

TOTAL: Sum of components (max 100)

SCORE INTERPRETATION:
- 85-100: Excellent - reads naturally, low detection risk
- 70-84: Good - minor AI tells, consider light editing
- 50-69: Fair - noticeable AI patterns, recommend regeneration
- 0-49: Poor - strong AI signals, do not use without major editing
```

**Detection Feedback Examples**:

| Issue Detected | Feedback |
|----------------|----------|
| Repetitive openings | "4 of 6 paragraphs start with 'The' - vary your openings" |
| Overused transitions | "Consider removing 'Furthermore' - it's an AI tell" |
| Lack of specifics | "Content is generic. Add specific examples or details" |
| Uniform sentences | "Sentences are too uniform in length. Mix short and long" |
| Missing personality | "Content feels flat. Add more of the voice clone's personality" |

#### 4.4.6 Content Editing & Regeneration

**Requirements**:

| ID | Requirement | Priority |
|----|-------------|----------|
| VCC-040 | User shall be able to edit generated content directly | Must Have |
| VCC-041 | User shall be able to request full regeneration | Must Have |
| VCC-042 | User shall be able to request partial regeneration (specific sections) | Should Have |
| VCC-043 | User shall be able to provide feedback for regeneration ("make it shorter", "more humor") | Must Have |
| VCC-044 | System shall offer "improve" option to address specific detection issues | Should Have |
| VCC-045 | System shall preserve edit history within session | Should Have |

---

### 4.5 Content Library

**Purpose**: Store, organize, and manage all generated content.

#### 4.5.1 Content Storage

**Requirements**:

| ID | Requirement | Priority |
|----|-------------|----------|
| VCL-001 | All generated content shall be automatically saved to library | Must Have |
| VCL-002 | User shall be able to manually save edited content | Must Have |
| VCL-003 | System shall store content with full metadata | Must Have |
| VCL-004 | System shall support unlimited content storage | Must Have |

**Content Record Model**:

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Unique identifier |
| voice_clone_id | UUID | Voice clone used |
| platform | Enum | Target platform |
| content | Text | The generated/edited content |
| original_content | Text | Content before user edits |
| input_provided | Text | User's original input |
| properties_used | JSON | Content properties at generation time |
| ai_detection_score | Integer | Naturalness score (0-100) |
| status | Enum | 'draft', 'ready', 'published', 'archived' |
| topic | String | User-assigned topic |
| campaign | String | User-assigned campaign |
| tags | Array[String] | User-assigned tags |
| created_at | Timestamp | Generation time |
| updated_at | Timestamp | Last edit time |
| published_at | Timestamp | When marked as published |

#### 4.5.2 Organization & Navigation

**Requirements**:

| ID | Requirement | Priority |
|----|-------------|----------|
| VCL-010 | User shall be able to filter content by voice clone | Must Have |
| VCL-011 | User shall be able to filter content by platform | Must Have |
| VCL-012 | User shall be able to filter content by status | Must Have |
| VCL-013 | User shall be able to filter content by topic/campaign | Must Have |
| VCL-014 | User shall be able to filter content by date range | Must Have |
| VCL-015 | User shall be able to filter content by tags | Must Have |
| VCL-016 | User shall be able to search content by keyword | Must Have |
| VCL-017 | User shall be able to sort by date, score, status | Must Have |
| VCL-018 | User shall be able to combine multiple filters | Must Have |

#### 4.5.3 Content Management

**Requirements**:

| ID | Requirement | Priority |
|----|-------------|----------|
| VCL-020 | User shall be able to view content details | Must Have |
| VCL-021 | User shall be able to edit content metadata (topic, campaign, tags) | Must Have |
| VCL-022 | User shall be able to edit content text | Must Have |
| VCL-023 | User shall be able to change content status | Must Have |
| VCL-024 | User shall be able to delete content | Must Have |
| VCL-025 | User shall be able to duplicate content | Should Have |
| VCL-026 | User shall be able to archive content | Must Have |
| VCL-027 | User shall be able to bulk select and update multiple items | Should Have |

---

### 4.6 Platform Output Manager

**Purpose**: Format and prepare content for each platform.

#### 4.6.1 Platform Preview

**Requirements**:

| ID | Requirement | Priority |
|----|-------------|----------|
| VPO-001 | System shall display platform-specific preview for each piece of content | Must Have |
| VPO-002 | Preview shall show character/word count vs. platform limits | Must Have |
| VPO-003 | Preview shall warn if content exceeds platform limits | Must Have |
| VPO-004 | Preview shall show approximate visual appearance | Nice to Have |

**Platform Constraints**:

| Platform | Constraint | Handling |
|----------|------------|----------|
| Twitter | 280 characters per tweet | Show count, warn if over, suggest thread |
| LinkedIn | 3,000 characters | Show count, warn if over |
| Facebook | 63,206 characters | Rarely an issue |
| Instagram | 2,200 characters caption | Show count, warn if over |
| Email | No hard limit | Show word count |
| Blog | No hard limit | Show word count |
| SMS | 160 characters ideal | Show count, warn if over |

#### 4.6.2 Copy & Export

**Requirements**:

| ID | Requirement | Priority |
|----|-------------|----------|
| VPO-010 | User shall be able to copy content to clipboard (one-click) | Must Have |
| VPO-011 | Copy shall be formatted appropriately for platform | Must Have |
| VPO-012 | User shall be able to export content as plain text | Must Have |
| VPO-013 | User shall be able to export content as PDF | Should Have |
| VPO-014 | User shall be able to export multiple pieces as document | Should Have |

---

## 5. Technical Architecture

> **Note**: For complete technical specifications including code examples, patterns, and implementation details, see [tech-stack.md](./tech-stack.md).

### 5.1 System Overview

The architecture uses a **separated frontend/backend** approach with a Python backend, optimized for AI-assisted development.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND                                    │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                      Next.js 14+ (App Router)                      │  │
│  │  • React 18 Components    • Tailwind CSS    • TypeScript          │  │
│  │  • TanStack Query         • Zustand (state) • shadcn/ui           │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ REST API (JSON)
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           BACKEND (Python)                               │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                         FastAPI Framework                          │  │
│  │  • Automatic OpenAPI docs  • Pydantic validation  • Async support │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                    │                                     │
│  ┌────────────────┬────────────────┼────────────────┬────────────────┐  │
│  │   Services     │   Services     │   Services     │   Services     │  │
│  │                │                │                │                │  │
│  │ Voice Clone    │   Content      │   Analysis     │   Detection    │  │
│  │ Service        │   Generator    │   Service      │   Service      │  │
│  │                │                │                │                │  │
│  │ • CRUD ops     │ • Generation   │ • DNA extract  │ • Heuristics   │  │
│  │ • Samples      │ • Platforms    │ • NLP analysis │ • Scoring      │  │
│  │ • Merging      │ • Formatting   │ • Confidence   │ • Feedback     │  │
│  └────────────────┴────────────────┴────────────────┴────────────────┘  │
│                                    │                                     │
│  ┌────────────────┬────────────────┴────────────────┬────────────────┐  │
│  │  AI Provider   │       File Processor            │   URL Scraper  │  │
│  │  Abstraction   │                                 │                │  │
│  │                │  • PDF: PyMuPDF                 │  • httpx       │  │
│  │  • OpenAI      │  • DOCX: python-docx           │  • BeautifulSoup│  │
│  │  • Anthropic   │  • TXT: native                 │  • Playwright  │  │
│  │  • LiteLLM     │                                 │    (fallback)  │  │
│  └────────────────┴─────────────────────────────────┴────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                            DATA LAYER                                    │
│  ┌─────────────────────────────────┐  ┌─────────────────────────────┐   │
│  │          PostgreSQL             │  │       File Storage          │   │
│  │                                 │  │                             │   │
│  │  SQLAlchemy 2.0 ORM             │  │  Local (dev)                │   │
│  │  Alembic migrations             │  │  S3/R2 (prod)               │   │
│  │  pgvector (optional, future)    │  │                             │   │
│  └─────────────────────────────────┘  └─────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

### 5.2 Technology Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Frontend** | Next.js 14+ (App Router), React 18, TypeScript | Modern stack, SSR support, type safety |
| **Styling** | Tailwind CSS, shadcn/ui | Rapid development, accessible components |
| **State Management** | TanStack Query + Zustand | Server state + UI state separation |
| **Backend Framework** | FastAPI (Python 3.11+) | Async, automatic docs, Pydantic validation |
| **Package Manager** | uv | Fast, reliable Python dependency management |
| **Database** | PostgreSQL | Reliable, good for relational data, JSON support |
| **ORM** | SQLAlchemy 2.0 + Alembic | Explicit queries, type hints, migrations |
| **AI - OpenAI** | openai (Python SDK) | Official SDK, async support |
| **AI - Anthropic** | anthropic (Python SDK) | Official SDK, async support |
| **File Parsing** | PyMuPDF, python-docx | Reliable PDF and DOCX extraction |
| **URL Scraping** | httpx, BeautifulSoup, Playwright | Modern async HTTP, HTML parsing |
| **NLP Analysis** | spaCy, textstat | Text analysis for detection heuristics |
| **File Storage** | Local filesystem (dev), S3/R2 (prod) | Flexibility |
| **Authentication** | Auth.js (NextAuth.js) | OAuth with Google/GitHub providers |

### 5.3 AI Provider Abstraction

```python
# src/voice_clone/ai/provider.py

from abc import ABC, abstractmethod
from typing import Optional, AsyncIterator
from pydantic import BaseModel

class GenerationOptions(BaseModel):
    """Options for text generation."""
    model: Optional[str] = None
    max_tokens: int = 4096
    temperature: float = 0.7
    stream: bool = False

class AIProvider(ABC):
    """Abstract base class for AI providers."""

    @property
    @abstractmethod
    def name(self) -> str:
        """Provider name."""
        pass

    @abstractmethod
    async def generate_text(
        self,
        prompt: str,
        options: Optional[GenerationOptions] = None
    ) -> str:
        """Generate text from a prompt."""
        pass

    @abstractmethod
    async def generate_stream(
        self,
        prompt: str,
        options: Optional[GenerationOptions] = None
    ) -> AsyncIterator[str]:
        """Generate text with streaming."""
        pass
```

### 5.4 Project Structure

```
voice-clone/
├── docs/
│   ├── plan.md                    # This document
│   ├── tech-stack.md              # Detailed tech specifications
│   └── git-workflow.md            # Git workflow guidelines
│
├── backend/
│   ├── pyproject.toml
│   ├── uv.lock
│   ├── alembic/
│   │   ├── alembic.ini
│   │   ├── env.py
│   │   └── versions/
│   ├── src/
│   │   └── voice_clone/
│   │       ├── __init__.py
│   │       ├── main.py            # FastAPI app entry point
│   │       ├── config.py          # Settings management
│   │       ├── dependencies.py    # Dependency injection
│   │       │
│   │       ├── api/               # API endpoints
│   │       │   ├── router.py
│   │       │   ├── voice_clones.py
│   │       │   ├── content.py
│   │       │   ├── library.py
│   │       │   └── settings.py
│   │       │
│   │       ├── models/            # SQLAlchemy models
│   │       │   ├── base.py
│   │       │   ├── voice_clone.py
│   │       │   ├── writing_sample.py
│   │       │   ├── voice_dna.py
│   │       │   ├── content.py
│   │       │   └── settings.py
│   │       │
│   │       ├── schemas/           # Pydantic schemas
│   │       │   ├── voice_clone.py
│   │       │   ├── content.py
│   │       │   └── settings.py
│   │       │
│   │       ├── services/          # Business logic
│   │       │   ├── voice_clone.py
│   │       │   ├── analysis.py
│   │       │   ├── generation.py
│   │       │   ├── detection.py
│   │       │   └── merge.py
│   │       │
│   │       ├── ai/                # AI provider integration
│   │       │   ├── provider.py
│   │       │   ├── openai_provider.py
│   │       │   ├── anthropic_provider.py
│   │       │   └── prompts/
│   │       │
│   │       ├── parsers/           # File and URL parsing
│   │       │   ├── pdf.py
│   │       │   ├── docx.py
│   │       │   └── url.py
│   │       │
│   │       └── utils/
│   │
│   └── tests/
│
├── frontend/
│   ├── package.json
│   ├── next.config.js
│   ├── tailwind.config.ts
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx           # Dashboard
│   │   │   ├── voice-clones/
│   │   │   ├── create/
│   │   │   ├── library/
│   │   │   └── settings/
│   │   ├── components/
│   │   │   ├── ui/                # shadcn/ui components
│   │   │   ├── voice-clone/
│   │   │   ├── content/
│   │   │   └── library/
│   │   ├── lib/
│   │   │   ├── api.ts             # API client
│   │   │   └── utils.ts
│   │   ├── hooks/
│   │   ├── stores/
│   │   └── types/
│   └── public/
│
└── docker-compose.yml
```

---

## 6. Data Models

### 6.1 Database Schema (SQLAlchemy 2.0)

> **Note**: For complete model implementations with relationships and methods, see [tech-stack.md](./tech-stack.md).

```python
# backend/src/voice_clone/models/

# Enums
class SourceType(str, Enum):
    paste = "paste"
    file = "file"
    url = "url"

class ContentType(str, Enum):
    tweet = "tweet"
    blog = "blog"
    email = "email"
    article = "article"
    linkedin = "linkedin"
    other = "other"

class DnaTrigger(str, Enum):
    initial = "initial"
    regenerate = "regenerate"
    manual_edit = "manual_edit"
    revert = "revert"
    merge = "merge"

class Platform(str, Enum):
    linkedin = "linkedin"
    twitter = "twitter"
    facebook = "facebook"
    instagram = "instagram"
    email = "email"
    blog = "blog"
    sms = "sms"

class ContentStatus(str, Enum):
    draft = "draft"
    ready = "ready"
    published = "published"
    archived = "archived"

class SettingType(str, Enum):
    voice_cloning_instructions = "voice_cloning_instructions"
    anti_ai_guidelines = "anti_ai_guidelines"
    platform_best_practices = "platform_best_practices"


# Models (SQLAlchemy 2.0 with type hints)

class VoiceClone(Base):
    """A voice clone capturing a writer's unique style."""
    __tablename__ = "voice_clones"

    id: Mapped[uuid.UUID] = mapped_column(UUID, primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    tags: Mapped[List[str]] = mapped_column(ARRAY(String), default=list)
    avatar_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    is_merged: Mapped[bool] = mapped_column(Boolean, default=False)
    merge_config: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    confidence_score: Mapped[int] = mapped_column(default=0)
    current_dna_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, onupdate=datetime.utcnow)

    # Relationships
    samples: Mapped[List["WritingSample"]] = relationship(back_populates="voice_clone")
    dna_versions: Mapped[List["VoiceDnaVersion"]] = relationship(back_populates="voice_clone")
    content: Mapped[List["Content"]] = relationship(back_populates="voice_clone")


class WritingSample(Base):
    """A writing sample used to train a voice clone."""
    __tablename__ = "writing_samples"

    id: Mapped[uuid.UUID] = mapped_column(UUID, primary_key=True, default=uuid.uuid4)
    voice_clone_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("voice_clones.id", ondelete="CASCADE"))
    title: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    source_type: Mapped[SourceType] = mapped_column(Enum(SourceType), nullable=False)
    source_reference: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    word_count: Mapped[int] = mapped_column(Integer, nullable=False)
    content_type: Mapped[Optional[ContentType]] = mapped_column(Enum(ContentType), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Relationships
    voice_clone: Mapped["VoiceClone"] = relationship(back_populates="samples")


class VoiceDnaVersion(Base):
    """A version of voice DNA analysis."""
    __tablename__ = "voice_dna_versions"

    id: Mapped[uuid.UUID] = mapped_column(UUID, primary_key=True, default=uuid.uuid4)
    voice_clone_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("voice_clones.id", ondelete="CASCADE"))
    version_number: Mapped[int] = mapped_column(Integer, nullable=False)
    voice_dna: Mapped[dict] = mapped_column(JSONB, nullable=False)
    trigger: Mapped[DnaTrigger] = mapped_column(Enum(DnaTrigger), nullable=False)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Relationships
    voice_clone: Mapped["VoiceClone"] = relationship(back_populates="dna_versions")


class VoiceCloneMergeSource(Base):
    """Tracks which voice clones were merged to create a new one."""
    __tablename__ = "voice_clone_merge_sources"

    id: Mapped[uuid.UUID] = mapped_column(UUID, primary_key=True, default=uuid.uuid4)
    merged_clone_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("voice_clones.id", ondelete="CASCADE"))
    source_clone_id: Mapped[uuid.UUID] = mapped_column(UUID, nullable=False)
    element_weights: Mapped[dict] = mapped_column(JSONB, nullable=False)


class Content(Base):
    """Generated content stored in the library."""
    __tablename__ = "content"

    id: Mapped[uuid.UUID] = mapped_column(UUID, primary_key=True, default=uuid.uuid4)
    voice_clone_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("voice_clones.id"))
    platform: Mapped[Platform] = mapped_column(Enum(Platform), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    original_content: Mapped[str] = mapped_column(Text, nullable=False)
    input_provided: Mapped[str] = mapped_column(Text, nullable=False)
    properties_used: Mapped[dict] = mapped_column(JSONB, nullable=False)
    ai_detection_score: Mapped[int] = mapped_column(Integer, nullable=False)
    status: Mapped[ContentStatus] = mapped_column(Enum(ContentStatus), default=ContentStatus.draft)
    topic: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    campaign: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    tags: Mapped[List[str]] = mapped_column(ARRAY(String), default=list)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, onupdate=datetime.utcnow)
    published_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    # Relationships
    voice_clone: Mapped["VoiceClone"] = relationship(back_populates="content")


class Settings(Base):
    """Global application settings."""
    __tablename__ = "settings"

    id: Mapped[str] = mapped_column(String(50), primary_key=True, default="global")
    voice_cloning_instructions: Mapped[str] = mapped_column(Text, nullable=False)
    anti_ai_guidelines: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, onupdate=datetime.utcnow)


class PlatformSettings(Base):
    """Per-platform content best practices."""
    __tablename__ = "platform_settings"

    id: Mapped[uuid.UUID] = mapped_column(UUID, primary_key=True, default=uuid.uuid4)
    platform: Mapped[Platform] = mapped_column(Enum(Platform), unique=True, nullable=False)
    best_practices: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, onupdate=datetime.utcnow)


class SettingsHistory(Base):
    """Version history for settings changes."""
    __tablename__ = "settings_history"

    id: Mapped[uuid.UUID] = mapped_column(UUID, primary_key=True, default=uuid.uuid4)
    setting_type: Mapped[SettingType] = mapped_column(Enum(SettingType), nullable=False)
    platform: Mapped[Optional[Platform]] = mapped_column(Enum(Platform), nullable=True)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class User(Base):
    """User account (via OAuth)."""
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(UUID, primary_key=True, default=uuid.uuid4)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    avatar_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    oauth_provider: Mapped[str] = mapped_column(String(50), nullable=False)  # 'google' or 'github'
    oauth_id: Mapped[str] = mapped_column(String(255), nullable=False)
    onboarding_completed: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, onupdate=datetime.utcnow)


class UserApiKey(Base):
    """User's AI provider API keys (encrypted)."""
    __tablename__ = "user_api_keys"

    id: Mapped[uuid.UUID] = mapped_column(UUID, primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    provider: Mapped[str] = mapped_column(String(50), nullable=False)  # 'openai' or 'anthropic'
    encrypted_api_key: Mapped[str] = mapped_column(Text, nullable=False)  # Fernet encrypted
    is_valid: Mapped[bool] = mapped_column(Boolean, default=True)
    preferred_for_analysis: Mapped[bool] = mapped_column(Boolean, default=False)
    preferred_for_generation: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, onupdate=datetime.utcnow)


class ApiUsageLog(Base):
    """Track API usage for cost monitoring."""
    __tablename__ = "api_usage_logs"

    id: Mapped[uuid.UUID] = mapped_column(UUID, primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    provider: Mapped[str] = mapped_column(String(50), nullable=False)
    operation: Mapped[str] = mapped_column(String(50), nullable=False)  # 'analysis' or 'generation'
    model: Mapped[str] = mapped_column(String(100), nullable=False)
    input_tokens: Mapped[int] = mapped_column(Integer, nullable=False)
    output_tokens: Mapped[int] = mapped_column(Integer, nullable=False)
    voice_clone_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class ContentTemplate(Base):
    """Saved content generation configurations."""
    __tablename__ = "content_templates"

    id: Mapped[uuid.UUID] = mapped_column(UUID, primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    properties: Mapped[dict] = mapped_column(JSONB, nullable=False)  # platforms, length, tone, etc.
    is_default: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, onupdate=datetime.utcnow)
```

---

## 7. AI Integration Specifications

### 7.1 Voice DNA Analysis Prompt

```
You are an expert linguistic analyst. Analyze the following writing samples to extract a comprehensive "Voice DNA" profile.

## Instructions
{voice_cloning_instructions}

## Writing Samples
{concatenated_samples}

## Output Format
Return a JSON object following this exact structure:
{voice_dna_structure}

Analyze thoroughly and be specific. Include actual examples from the text to support your analysis.
```

### 7.2 Content Generation Prompt

```
You are a ghostwriter who has deeply studied a specific writer's voice and style. You will write content that authentically sounds like this writer.

## Voice DNA
{voice_dna_json}

## Anti-AI Guidelines
{anti_ai_guidelines}

## Platform Best Practices ({platform})
{platform_best_practices}

## Task
Write a {platform} post based on the following input:

**Input Content:**
{user_input}

**Requirements:**
- Target audience: {target_audience}
- Length: {length}
- Tone: {tone}
- Humor level: {humor_level}
- Formality: {formality}
- Call-to-action style: {cta_style}
- Include these phrases naturally: {include_phrases}
- Avoid these phrases: {exclude_phrases}

**Critical Instructions:**
1. Write in the exact voice described in the Voice DNA
2. Use the specific vocabulary, sentence patterns, and personality markers
3. Follow the anti-AI guidelines strictly - this content must read as authentically human
4. Optimize for the platform's best practices
5. Do not announce what you're doing; just write the content

Write the content now:
```

### 7.3 Merge DNA Generation Prompt

```
You are an expert at combining writing styles. You will merge elements from multiple Voice DNA profiles into a single cohesive new voice.

## Source Voice Clones and Weights

{for each source}
### Source: {source_name}
**Weights:**
{element: weight for each element}

**Voice DNA:**
{source_voice_dna}
{end for}

## Task
Create a merged Voice DNA that:
1. Takes {element} primarily from {highest_weighted_source} (weight: {weight}%)
2. Blends in {element} from {other_sources} according to weights
3. Resolves any conflicts by favoring higher-weighted sources
4. Creates a coherent, usable voice profile

## Output
Return a complete Voice DNA JSON object that represents this merged voice.
```

---

## 8. User Interface Requirements

### 8.1 Navigation Structure

```
┌────────────────────────────────────────────────────────┐
│  Voice Clone Tool                          [Settings]  │
├────────────────────────────────────────────────────────┤
│                                                        │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │  Voice   │ │  Create  │ │ Library  │ │ Settings │  │
│  │  Clones  │ │ Content  │ │          │ │          │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
│                                                        │
└────────────────────────────────────────────────────────┘
```

### 8.2 Key Screens

#### Voice Clones List
- Grid or list view of all voice clones
- Show: name, avatar, confidence score, sample count, last used
- Actions: create new, view/edit, delete
- Filter by: tags, merged/original
- Quick action: generate content with this clone

#### Voice Clone Detail
- Metadata section: name, description, tags, avatar
- Confidence score with recommendations
- Samples list with add/remove capabilities
- Voice DNA viewer/editor
- Version history
- Actions: analyze, regenerate, delete

#### Voice Clone Merge
- Multi-select source clones
- Element weight sliders for each source
- Preview of merge configuration
- Generate merged clone

#### Content Creator
- Voice clone selector (with search)
- Input area (rich text)
- Properties panel (collapsible)
- Platform selector (multi-select)
- Generate button
- Results panel with:
  - Platform tabs
  - AI detection score
  - Edit inline
  - Regenerate/improve buttons
  - Copy/save buttons

#### Content Library
- Filterable table/grid
- Columns: content preview, voice clone, platform, score, status, date
- Bulk actions
- Quick view/edit modal
- Export options

#### Settings
- Tabbed interface: Methodology, Anti-AI, Platforms
- Each tab: current content, edit button, version history

### 8.3 Design Principles

1. **Information density**: Show relevant info without overwhelming
2. **Progressive disclosure**: Hide advanced options until needed
3. **Immediate feedback**: Show loading states, success/error messages
4. **Keyboard navigation**: Support power users
5. **Mobile-responsive**: Usable on smaller screens (not optimized for v1)

---

## 9. Non-Functional Requirements

### 9.1 Performance

| Metric | Target |
|--------|--------|
| Page load time | < 2 seconds |
| DNA analysis | < 60 seconds |
| Content generation | < 30 seconds per platform |
| AI detection scoring | < 5 seconds |
| Library search | < 1 second |

### 9.2 Scalability

| Dimension | V1 Target |
|-----------|-----------|
| Voice clones | Up to 100 |
| Samples per clone | Unlimited |
| Content items | Up to 10,000 |
| Concurrent generations | 1 (sequential) |

### 9.3 Security

| Requirement | Implementation |
|-------------|----------------|
| API key storage | Environment variables, never client-side |
| Data encryption | HTTPS in transit, encrypted at rest (production) |
| Input sanitization | All user input sanitized before storage |
| File upload validation | Type checking, size limits, virus scanning (production) |

### 9.4 Reliability

| Requirement | Implementation |
|-------------|----------------|
| Error handling | Graceful degradation, user-friendly error messages |
| Data backup | Daily automated backups (production) |
| AI provider fallback | If primary fails, fall back to secondary |

---

## 10. Future Considerations (V2+)

### V2 Features (Prioritized)

1. **Content Automator**
   - Scheduled posting
   - One-time delayed posts
   - Recurring posts with variability
   - Queue management
   - Platform API integrations

2. **Multi-User / Teams**
   - User authentication
   - Team workspaces
   - Shared voice clones
   - Permission levels
   - Audit logging

3. **External AI Detection**
   - GPTZero integration
   - Originality.ai integration
   - Multiple detector consensus

4. **Advanced Analytics**
   - Voice clone usage stats
   - Content performance tracking (if platform APIs available)
   - AI detection score trends

### V3+ Features

- Mobile app
- Browser extension for in-place generation
- API for external integrations
- White-label capabilities
- Voice clone marketplace

---

## 11. Open Questions & Decisions

### Resolved

| Question | Decision | Rationale |
|----------|----------|-----------|
| Backend language | Python with FastAPI | Better AI/ML ecosystem, more training data for AI coding assistants |
| ORM | SQLAlchemy 2.0 + Alembic | Explicit queries, strong type hints, mature migration system |
| AI providers | OpenAI + Anthropic | Flexibility, user preference |
| AI detection | Custom heuristics (spaCy, textstat) | No external costs, full control |
| Database | PostgreSQL | Reliable, scales well, good JSON support |
| Voice merging | Include in V1 | Critical use case |
| Frontend framework | Next.js 14+ (frontend only) | Well-documented, good AI training data |
| State management | TanStack Query + Zustand | Clear separation of server/UI state |
| Architecture | Separate frontend/backend | Clear boundaries for AI maintainability |

### Open

| Question | Options | Needs Decision By |
|----------|---------|-------------------|
| Hosting provider | Vercel (frontend) + Railway (backend), Fly.io, self-hosted | Before deployment |
| File storage (prod) | AWS S3, Cloudflare R2 | Before deployment |
| Domain name | TBD | Before deployment |
| Cost monitoring | Track AI API usage | During development |
| Playwright fallback | Include for JS-rendered pages or defer | During URL scraping implementation |

---

## 12. Glossary

| Term | Definition |
|------|------------|
| **Voice Clone** | A profile that captures a writer's unique style and patterns |
| **Voice DNA** | The structured document containing all analyzed elements of a voice |
| **Writing Sample** | A piece of text used to train a voice clone |
| **Confidence Score** | A 0-100 rating of how well a voice clone can replicate a writer |
| **Merged Clone** | A voice clone created by combining elements from multiple source clones |
| **AI Detection Score** | A 0-100 rating of how natural/human content appears |
| **Platform Best Practices** | Guidelines for optimizing content for specific platforms |

---

## Appendix A: Default Settings Content

The full default content for Voice Cloning Instructions, Anti-AI Guidelines, and Platform Best Practices are included in Section 4.1 of this document.

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-02-04 | Ken + Claude | Initial PRD |
| 1.1 | 2026-02-04 | Ken + Claude | Updated tech stack: Python/FastAPI backend, SQLAlchemy ORM, separated frontend/backend architecture. Added tech-stack.md reference. |
| 1.2 | 2026-02-04 | Ken + Claude | Added OAuth authentication (Auth.js). Added new data models: User, UserApiKey, ApiUsageLog, ContentTemplate. Updated to support 65 user stories. |

---

*End of Document*
