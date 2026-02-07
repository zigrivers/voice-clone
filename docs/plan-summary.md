# Voice Clone Tool - Plan Summary

> A distilled overview of the full [PRD](./plan.md) (v1.2). For complete specifications, refer to the source document.

---

## What It Does

A web app that analyzes writing samples to capture a writer's unique "Voice DNA," then generates new content that authentically replicates their style. It can merge multiple voices into hybrids and format output for different platforms.

**Core value:**
- **Authentic voice replication** - content that sounds like the writer, not generic AI
- **Voice merging** - combine elements from multiple writers (e.g., one person's structure + another's humor)
- **Multi-platform output** - single input generates optimized content for LinkedIn, Twitter, blogs, email, etc.
- **AI detection avoidance** - built-in heuristics to ensure content reads naturally

**Primary use cases:** personal content scaling, ghostwriting for clients, voice experimentation through merging.

---

## Key Features

### 1. Voice Clone Methodology Settings

Global configuration that governs how the system analyzes writing and generates content. Three editable sections:

- **Voice Cloning Instructions** - defines how AI analyzes samples to extract Voice DNA (vocabulary patterns, sentence structure, tone markers, rhetorical devices, punctuation habits, opening/closing patterns, humor, distinctive signatures)
- **Anti-AI Detection Guidelines** - rules for making generated content sound human (avoid AI tells like "Furthermore," embrace specific details, vary sentence structure, include personality)
- **Platform Best Practices** - per-platform formatting and optimization guidelines for LinkedIn, Twitter/X, Facebook, Instagram, Email, Blog, and SMS

All three support version history (last 10 versions) and revert capability.

### 2. Voice Clone Generator

Create and manage voice clones that capture a writer's unique DNA.

**Clone creation:** Name, description, tags, optional avatar. Each clone gets a unique ID and confidence score.

**Writing samples:** Add via copy/paste, file upload (.txt, .docx, .pdf), or URL scraping. No limit on sample count. Each sample tracks word count, source type, and content type (tweet, blog, email, article, etc.).

**Confidence score (0-100):** Calculated from five components:
| Component | Max Points |
|-----------|------------|
| Total word count | 30 |
| Number of samples | 20 |
| Content type variety | 20 |
| Short/long-form mix | 15 |
| Voice consistency | 15 |

Scores 80+ = ready for use. Below 60 = add more samples. System provides specific recommendations (e.g., "Add longer-form content for better paragraph analysis").

**Voice DNA analysis:** AI analyzes all samples and produces a structured JSON document covering vocabulary, sentence/paragraph structure, tone, rhetorical devices, punctuation habits, opening/closing patterns, humor/personality, and distinctive signatures. Users can view and manually edit the DNA.

**Versioning:** Last 10 DNA versions retained. Users can view history, revert to previous versions, and see what triggered each version (initial analysis, regeneration, manual edit, revert).

### 3. Voice Clone Merger

Combine elements from 2-5 existing voice clones into a new hybrid voice.

**Mergeable elements** (each weighted 0-100% per source):
vocabulary, sentence structure, paragraph structure, tone, rhetorical devices, punctuation, openings, closings, humor, personality

Example: Take 100% of Ken's vocabulary and sentence structure, but blend in 80% of Sam's humor. The system generates new merged Voice DNA using weighted blending (numeric values = weighted average, arrays = weighted selection, strings = highest-weighted source).

Merged clones function identically to regular clones and track their source lineage.

### 4. Content Creator

Generate new content using a selected voice clone.

**Workflow:** Select clone → enter rough input (bullets, ideas, draft) → configure properties → pick platform(s) → generate → review AI detection score → edit/regenerate → save or export.

**Configurable properties:**
- Target platform(s): LinkedIn, Twitter, Facebook, Instagram, Email, Blog, SMS
- Length: short, medium, long, or custom word count
- Tone, humor, and formality overrides (1-10 scales, or inherit from Voice DNA)
- Target audience (free text)
- CTA style: none, soft, direct, urgent
- Phrases to include or exclude

**Generation:** Uses a structured prompt combining Voice DNA + anti-AI guidelines + platform best practices + user input. Multi-platform selection generates a separate optimized version per platform. Target: < 30 seconds per platform.

**AI Detection Scoring (0-100):** Custom heuristic algorithm scoring eight dimensions:
| Dimension | Max Points |
|-----------|------------|
| Sentence variety | 20 |
| Vocabulary diversity | 15 |
| Specificity (concrete details) | 15 |
| Transition naturalness | 10 |
| Opening/closing quality | 10 |
| Punctuation authenticity | 10 |
| Personality presence | 10 |
| Structural naturalness | 10 |

Scores 85+ = excellent, 50-69 = recommend regeneration, below 50 = do not use. System provides specific feedback (e.g., "4 of 6 paragraphs start with 'The' - vary your openings").

**Editing:** Direct inline editing, full or partial regeneration, feedback-driven regeneration ("make it shorter," "more humor"), and targeted improvement for specific detection issues.

### 5. Content Library

Store, organize, and manage all generated content.

**Each content record stores:** the content (current + original), voice clone used, platform, input provided, generation properties, AI detection score, status (draft/ready/published/archived), topic, campaign, and tags.

**Organization:** Filter by voice clone, platform, status, topic/campaign, date range, or tags. Full-text keyword search. Sort by date, score, or status. Combinable filters and bulk actions.

**Management:** View details, edit content/metadata, change status, duplicate, archive, delete.

### 6. Platform Output Manager

Format and prepare content for each target platform.

**Preview:** Platform-specific preview showing character/word count vs. platform limits, with warnings when content exceeds constraints (e.g., 280 chars for Twitter, 3,000 for LinkedIn).

**Export:** One-click copy to clipboard (platform-formatted), export as plain text or PDF, multi-item document export.

---

## Technical Architecture

### Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14+ (App Router), React 18, TypeScript, Tailwind CSS, shadcn/ui |
| State | TanStack Query (server state) + Zustand (UI state) |
| Backend | FastAPI (Python 3.11+), Pydantic validation |
| Database | PostgreSQL with SQLAlchemy 2.0 ORM + Alembic migrations |
| AI Providers | OpenAI + Anthropic (abstracted behind a common provider interface) |
| File Parsing | PyMuPDF (PDF), python-docx (DOCX) |
| URL Scraping | httpx + BeautifulSoup (Playwright fallback for JS-rendered pages) |
| NLP | spaCy + textstat (for AI detection heuristics) |
| Auth | Auth.js (NextAuth.js) with Google/GitHub OAuth |
| File Storage | Local filesystem (dev), S3/R2 (prod) |

### Architecture Pattern

Separated frontend/backend. Next.js frontend communicates with FastAPI backend via REST API (JSON). Backend organized into layers: API endpoints → services (business logic) → models (data) + AI providers.

### Key Backend Services

- **Voice Clone Service** - CRUD, sample management, merging
- **Analysis Service** - DNA extraction, NLP analysis, confidence scoring
- **Content Generator** - content generation, platform formatting
- **Detection Service** - AI detection heuristics, scoring, feedback

---

## Data Models

### Core Entities

```
User ──────────── UserApiKey (encrypted, per AI provider)
  │                ApiUsageLog (token tracking per operation)
  │                ContentTemplate (saved generation configs)
  │
VoiceClone ────── WritingSample (paste/file/url, word count, content type)
  │                VoiceDnaVersion (versioned DNA JSON, trigger tracking)
  │                VoiceCloneMergeSource (source clones + element weights)
  │                Content (generated text, score, status, metadata)
  │
Settings ──────── SettingsHistory (version history)
PlatformSettings   (per-platform best practices)
```

### Key Relationships

- A **VoiceClone** has many **WritingSamples** and many **VoiceDnaVersions**
- A **VoiceClone** can be merged from multiple sources tracked via **VoiceCloneMergeSource**
- **Content** belongs to one VoiceClone and one Platform, stores both current and original text
- **Settings** and **PlatformSettings** have versioned history for rollback

---

## AI Integration

Three primary AI-powered operations, all using the configurable provider abstraction (OpenAI or Anthropic):

### 1. Voice DNA Analysis
- **Input:** All writing samples for a clone + voice cloning instructions
- **Output:** Structured JSON Voice DNA document
- **Prompt:** Instructs AI to act as expert linguistic analyst, extract patterns across 10+ categories

### 2. Content Generation
- **Input:** Voice DNA + anti-AI guidelines + platform best practices + user input + properties
- **Output:** Platform-optimized content in the clone's voice
- **Prompt:** Instructs AI to act as ghostwriter, match exact voice patterns, follow anti-AI rules

### 3. Merge DNA Generation
- **Input:** Multiple source Voice DNAs + element weights per source
- **Output:** New blended Voice DNA JSON
- **Prompt:** Instructs AI to combine styles proportionally, resolve conflicts, produce coherent voice

All three operations track token usage via **ApiUsageLog** for cost monitoring.

---

## V1 Scope vs. Future

### Included in V1
- Voice clone creation, management, and versioning
- Writing sample input (paste, upload, URL)
- Voice DNA analysis with confidence scoring
- Voice clone merging with element-level weight control
- Content generation with platform optimization
- Custom AI detection heuristics and scoring
- Content library with filtering, search, and bulk actions
- Platform output manager with preview and export
- OAuth authentication (Google/GitHub)
- AI provider configuration and usage tracking
- Content templates and A/B content variations
- Voice clone data export

### Deferred to V2+
- **Content Automator** - scheduled posting, recurring posts, queue management, platform API integrations
- **Multi-user / Teams** - workspaces, shared clones, permissions, audit logging
- **External AI Detection** - GPTZero, Originality.ai integration
- **Advanced Analytics** - usage stats, performance tracking, score trends

### V3+ Horizon
- Mobile app
- Browser extension for in-place generation
- Public API for external integrations
- White-label capabilities
- Voice clone marketplace

---

## Performance Targets

| Metric | Target |
|--------|--------|
| Page load | < 2s |
| DNA analysis | < 60s |
| Content generation | < 30s per platform |
| AI detection scoring | < 5s |
| Library search | < 1s |

**V1 scale:** Up to 100 voice clones, unlimited samples per clone, up to 10,000 content items, sequential generation (1 at a time).
