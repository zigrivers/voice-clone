# Voice Clone Tool - User Stories Document

**Version**: 1.0
**Created**: February 4, 2026
**Purpose**: Comprehensive user stories for AI-assisted development
**Related Documents**: [plan.md](./plan.md), [tech-stack.md](./tech-stack.md)

---

## Table of Contents

1. [User Story Best Practices](#1-user-story-best-practices)
2. [User Personas Reference](#2-user-personas-reference)
3. [Epic Overview](#3-epic-overview)
4. [User Stories by Epic](#4-user-stories-by-epic)
   - 4.1 Voice Clone Methodology Settings
   - 4.2 Voice Clone Generator
   - 4.3 Voice Clone Merger
   - 4.4 Voice Clone Content Creator
   - 4.5 Content Library
   - 4.6 Platform Output Manager
   - 4.7 System & Infrastructure

---

## 1. User Story Best Practices

This section documents the best practices used to create user stories in this document. These guidelines ensure consistency and provide AI developers with clear, actionable requirements.

### 1.1 User Story Format

Every user story follows this structure:

```
As a [user type],
I want [goal/desire],
So that [benefit/value].
```

**Components**:
- **User Type**: Identifies WHO is performing the action (e.g., content creator, administrator)
- **Goal/Desire**: Describes WHAT functionality is needed
- **Benefit/Value**: Explains WHY it matters to the user

### 1.2 The INVEST Criteria

All user stories in this document adhere to the INVEST criteria:

| Criterion | Description | How We Apply It |
|-----------|-------------|-----------------|
| **I**ndependent | Story can be developed without depending on other stories | Each story is self-contained with clear boundaries |
| **N**egotiable | Details can be discussed and refined | Stories focus on outcomes, not implementation |
| **V**aluable | Delivers value to the user | Every story includes explicit user benefit |
| **E**stimable | Team can estimate effort required | Stories include technical notes for estimation |
| **S**mall | Can be completed in one sprint | Large features are broken into multiple stories |
| **T**estable | Has clear acceptance criteria | Every story includes Given/When/Then scenarios |

### 1.3 The 3 C's Framework

Each user story embodies:

1. **Card**: The concise user story statement
2. **Conversation**: Additional context, technical notes, and UI/UX considerations documented in each story
3. **Confirmation**: Acceptance criteria that define when the story is complete

### 1.4 Acceptance Criteria Format

We use the **Given/When/Then** format for scenario-based acceptance criteria:

```
Given [precondition/context]
When [action is performed]
Then [expected outcome]
```

We also use **rule-based criteria** as checklists:
- Specific, measurable conditions
- Pass/fail statements
- No ambiguous terms like "fast" or "user-friendly"

### 1.5 AI Development Guidelines

Since AI will perform all coding work, each user story includes:

1. **Technical Notes**: Implementation hints and architectural considerations
2. **API Endpoints**: Expected backend endpoints (when applicable)
3. **Data Models**: References to relevant database models
4. **UI Components**: Key frontend components needed
5. **Dependencies**: Other stories or systems this depends on
6. **Edge Cases**: Scenarios to handle beyond the happy path

### 1.6 Priority Levels

| Priority | Label | Description |
|----------|-------|-------------|
| P0 | Must Have | Core functionality, blocks other work |
| P1 | Should Have | Important but not blocking |
| P2 | Nice to Have | Enhances experience but optional for MVP |

### 1.7 Story Point Reference

| Points | Complexity | Example |
|--------|------------|---------|
| 1 | Trivial | Add a field, simple UI change |
| 2 | Small | CRUD endpoint, simple component |
| 3 | Medium | Feature with validation, multiple components |
| 5 | Large | Complex feature, multiple services |
| 8 | Very Large | Major feature, significant integration |
| 13 | Epic-sized | Should be broken down further |

---

## 2. User Personas Reference

### Primary Persona: Content Creator (Alex)

| Attribute | Description |
|-----------|-------------|
| **Role** | Consultant building personal brand through content |
| **Goals** | Publish consistently, maintain authentic voice, ghostwrite for clients |
| **Pain Points** | AI content sounds generic, editing takes too long, platform reformatting |
| **Technical Skill** | Moderate - comfortable with web apps |

### Secondary Persona: Marketing Team Lead (Jordan)

| Attribute | Description |
|-----------|-------------|
| **Role** | Manages content for multiple team members |
| **Goals** | Scale content production, maintain consistency, streamline workflow |
| **Pain Points** | Inconsistent voices, time-consuming reviews, reformatting needs |
| **Technical Skill** | Moderate to Advanced |

---

## 3. Epic Overview

| Epic ID | Epic Name | Description | Story Count |
|---------|-----------|-------------|-------------|
| EP-01 | Voice Clone Methodology Settings | Configure global instructions for voice analysis and content generation | 6 |
| EP-02 | Voice Clone Generator | Create, manage, and analyze voice clones | 16 |
| EP-03 | Voice Clone Merger | Combine multiple voice clones | 5 |
| EP-04 | Content Creator | Generate content using voice clones | 14 |
| EP-05 | Content Library | Store and manage generated content | 8 |
| EP-06 | Platform Output | Format and export content for platforms | 5 |
| EP-07 | System & Infrastructure | Authentication, settings, and system features | 11 |

**Total User Stories**: 65

---

## 4. User Stories by Epic

---

### 4.1 Epic: Voice Clone Methodology Settings (EP-01)

**Epic Description**: Configure the global instructions and guidelines that govern how the system analyzes writing samples and generates content.

---

#### US-01-001: View Voice Cloning Instructions

**Priority**: P0 | **Points**: 2 | **Sprint**: 1

**User Story**:
```
As a content creator,
I want to view the current voice cloning instructions,
So that I understand how the system will analyze my writing samples.
```

**Acceptance Criteria**:

*Scenario 1: View default instructions*
```
Given I am on the Settings page
When I navigate to the "Voice Cloning Instructions" tab
Then I see the current instructions displayed in a readable format
And I see when the instructions were last modified
And I see a version indicator (e.g., "Version 3 of 10")
```

*Scenario 2: First-time user sees defaults*
```
Given I am a new user with no custom instructions
When I view the Voice Cloning Instructions
Then I see the system default instructions
And a label indicates these are "Default Instructions"
```

*Rule-based Criteria*:
- [ ] Instructions display in a code/text block with syntax highlighting for structure
- [ ] Last modified timestamp is human-readable (e.g., "2 hours ago")
- [ ] Instructions are read-only in view mode
- [ ] Page loads within 2 seconds

**Technical Notes**:
- API Endpoint: `GET /api/settings/voice-cloning-instructions`
- Database: Query `Settings` table for `voice_cloning_instructions` field
- Frontend: Create `VoiceCloningInstructionsView` component
- Use markdown rendering for instruction display

**Dependencies**: None (foundational)

**Edge Cases**:
- Handle case where settings record doesn't exist (create with defaults)
- Handle very long instructions (scrollable container)

---

#### US-01-002: Edit Voice Cloning Instructions

**Priority**: P0 | **Points**: 3 | **Sprint**: 1

**User Story**:
```
As a content creator,
I want to edit the voice cloning instructions,
So that I can customize how the system analyzes writing samples to better match my needs.
```

**Acceptance Criteria**:

*Scenario 1: Edit and save instructions*
```
Given I am viewing the Voice Cloning Instructions
When I click the "Edit" button
Then the instructions become editable in a text editor
And I see a "Save" and "Cancel" button
When I modify the instructions and click "Save"
Then the instructions are saved
And I see a success notification
And the "Last Modified" timestamp updates
```

*Scenario 2: Cancel editing*
```
Given I am editing the Voice Cloning Instructions
When I click "Cancel"
Then my changes are discarded
And the view returns to read-only mode with original content
```

*Scenario 3: Unsaved changes warning*
```
Given I have unsaved changes to the instructions
When I attempt to navigate away from the page
Then I see a confirmation dialog warning about unsaved changes
```

*Rule-based Criteria*:
- [ ] Editor supports at least 50,000 characters
- [ ] Editor has line numbers
- [ ] Changes are validated before saving (non-empty)
- [ ] Save operation completes within 3 seconds
- [ ] Previous version is saved to history before overwriting

**Technical Notes**:
- API Endpoint: `PUT /api/settings/voice-cloning-instructions`
- Request body: `{ content: string }`
- Before saving, create `SettingsHistory` record
- Frontend: Use CodeMirror or Monaco editor for better editing experience
- Implement autosave draft to localStorage every 30 seconds

**Dependencies**: US-01-001

**Edge Cases**:
- Handle concurrent edits (last-write-wins with warning)
- Handle network failure during save (retry with queued changes)
- Validate instructions aren't empty

---

#### US-01-003: View and Revert Instruction History

**Priority**: P1 | **Points**: 3 | **Sprint**: 2

**User Story**:
```
As a content creator,
I want to view previous versions of the voice cloning instructions and revert to them,
So that I can recover from unwanted changes or compare different approaches.
```

**Acceptance Criteria**:

*Scenario 1: View version history*
```
Given I am on the Voice Cloning Instructions page
When I click "Version History"
Then I see a list of the last 10 versions
And each version shows: version number, date modified, and preview snippet
```

*Scenario 2: Compare versions*
```
Given I am viewing the version history
When I select a previous version
Then I see that version's full content
And I can compare it side-by-side with current version
```

*Scenario 3: Revert to previous version*
```
Given I am viewing a previous version
When I click "Revert to this version"
Then I see a confirmation dialog
When I confirm
Then the selected version becomes the current version
And a new history entry is created with trigger "revert"
And I see a success notification
```

*Rule-based Criteria*:
- [ ] System retains exactly the last 10 versions
- [ ] Oldest version is deleted when 11th is created
- [ ] Revert operation is atomic (all-or-nothing)
- [ ] Version list loads within 2 seconds

**Technical Notes**:
- API Endpoint: `GET /api/settings/voice-cloning-instructions/history`
- API Endpoint: `POST /api/settings/voice-cloning-instructions/revert/{version_id}`
- Database: Query `SettingsHistory` where `setting_type = 'voice_cloning_instructions'`
- Implement diff view using a library like `diff` or `jsdiff`

**Dependencies**: US-01-002

**Edge Cases**:
- Handle case where no history exists yet
- Handle deleted history entries gracefully

---

#### US-01-004: View Anti-AI Detection Guidelines

**Priority**: P0 | **Points**: 2 | **Sprint**: 1

**User Story**:
```
As a content creator,
I want to view the anti-AI detection guidelines,
So that I understand how the system crafts content to avoid AI detection.
```

**Acceptance Criteria**:

*Scenario 1: View guidelines*
```
Given I am on the Settings page
When I navigate to the "Anti-AI Guidelines" tab
Then I see the current guidelines displayed
And I see when guidelines were last modified
```

*Rule-based Criteria*:
- [ ] Guidelines display in readable, structured format
- [ ] Sections are clearly delineated (AVOID, EMBRACE, etc.)
- [ ] Page loads within 2 seconds

**Technical Notes**:
- API Endpoint: `GET /api/settings/anti-ai-guidelines`
- Database: Query `Settings` table for `anti_ai_guidelines` field
- Reuse same component pattern as US-01-001

**Dependencies**: None

**Edge Cases**:
- Handle missing guidelines (use defaults)

---

#### US-01-005: Edit Anti-AI Detection Guidelines

**Priority**: P0 | **Points**: 3 | **Sprint**: 1

**User Story**:
```
As a content creator,
I want to edit the anti-AI detection guidelines,
So that I can customize how the system avoids AI detection patterns.
```

**Acceptance Criteria**:

*Scenario 1: Edit and save guidelines*
```
Given I am viewing the Anti-AI Guidelines
When I click "Edit" and modify the guidelines
And I click "Save"
Then the guidelines are saved
And I see a success notification
And the timestamp updates
```

*Rule-based Criteria*:
- [ ] All criteria from US-01-002 apply
- [ ] Previous version saved to history before overwriting

**Technical Notes**:
- API Endpoint: `PUT /api/settings/anti-ai-guidelines`
- Same implementation pattern as US-01-002
- Create history record in `SettingsHistory` with `setting_type = 'anti_ai_guidelines'`

**Dependencies**: US-01-004

**Edge Cases**:
- Same as US-01-002

---

#### US-01-006: Manage Platform Best Practices

**Priority**: P0 | **Points**: 5 | **Sprint**: 2

**User Story**:
```
As a content creator,
I want to view and edit best practices for each content platform,
So that I can customize how content is optimized for LinkedIn, Twitter, and other platforms.
```

**Acceptance Criteria**:

*Scenario 1: View platform list*
```
Given I am on the Settings page
When I navigate to the "Platform Best Practices" tab
Then I see a list of all supported platforms: LinkedIn, Twitter/X, Facebook, Instagram, Email, Blog, SMS
And each platform shows a preview of its best practices
```

*Scenario 2: View specific platform practices*
```
Given I am viewing the platform list
When I click on a platform (e.g., "LinkedIn")
Then I see the full best practices for that platform
And I see options to Edit
```

*Scenario 3: Edit platform practices*
```
Given I am viewing a platform's best practices
When I click "Edit" and modify the content
And I click "Save"
Then the best practices are saved for that platform
And I see a success notification
```

*Scenario 4: Add custom platform*
```
Given I am on the Platform Best Practices tab
When I click "Add Platform"
Then I see a form to enter: Platform Name, Best Practices
When I fill in the form and click "Save"
Then the new platform appears in the list
```

*Rule-based Criteria*:
- [ ] Default platforms cannot be deleted (only edited)
- [ ] Custom platforms can be deleted
- [ ] Each platform's practices stored separately
- [ ] History maintained per platform (last 10 versions each)

**Technical Notes**:
- API Endpoint: `GET /api/settings/platforms`
- API Endpoint: `GET /api/settings/platforms/{platform}`
- API Endpoint: `PUT /api/settings/platforms/{platform}`
- API Endpoint: `POST /api/settings/platforms` (for custom)
- API Endpoint: `DELETE /api/settings/platforms/{platform}` (custom only)
- Database: `PlatformSettings` table with `platform` enum and `best_practices` text

**Dependencies**: None

**Edge Cases**:
- Prevent duplicate platform names
- Handle platform name with special characters
- Validate best practices aren't empty

---

### 4.2 Epic: Voice Clone Generator (EP-02)

**Epic Description**: Create, manage, and maintain voice clones that capture a writer's unique DNA.

---

#### US-02-001: View Voice Clone List

**Priority**: P0 | **Points**: 3 | **Sprint**: 1

**User Story**:
```
As a content creator,
I want to view a list of all my voice clones,
So that I can see what voices I have available and their status.
```

**Acceptance Criteria**:

*Scenario 1: View clone list*
```
Given I have created voice clones
When I navigate to the Voice Clones page
Then I see a list/grid of all my voice clones
And each clone shows: name, avatar (or placeholder), confidence score, sample count, tags, last used date
And clones are sorted by most recently used by default
```

*Scenario 2: Empty state*
```
Given I have no voice clones
When I navigate to the Voice Clones page
Then I see a friendly empty state message
And I see a prominent "Create Voice Clone" button
```

*Scenario 3: Filter clones*
```
Given I have multiple voice clones with different tags
When I filter by a specific tag
Then I see only clones with that tag
```

*Scenario 4: Toggle merged vs original*
```
Given I have both original and merged voice clones
When I toggle the "Show Merged Only" filter
Then I see only merged voice clones
```

*Rule-based Criteria*:
- [ ] List supports both grid and list view toggle
- [ ] Confidence score displayed with color coding (green >80, yellow 60-79, red <60)
- [ ] Page loads within 2 seconds for up to 100 clones
- [ ] Search by name is instant (client-side filter)

**Technical Notes**:
- API Endpoint: `GET /api/voice-clones`
- Query params: `?tag=&is_merged=&sort=&order=`
- Frontend: Create `VoiceCloneList` and `VoiceCloneCard` components
- Implement client-side search/filter for responsiveness
- Use TanStack Query for caching and background refetch

**Dependencies**: None (foundational)

**Edge Cases**:
- Handle very long clone names (truncate with tooltip)
- Handle clones with no samples (show "No samples" indicator)

---

#### US-02-002: Create New Voice Clone

**Priority**: P0 | **Points**: 3 | **Sprint**: 1

**User Story**:
```
As a content creator,
I want to create a new voice clone with a name and description,
So that I can start building a profile of a writer's voice.
```

**Acceptance Criteria**:

*Scenario 1: Create basic clone*
```
Given I am on the Voice Clones page
When I click "Create Voice Clone"
Then I see a form with fields: Name (required), Description (optional), Tags (optional)
When I enter a name and click "Create"
Then a new voice clone is created
And I am redirected to the clone's detail page
And I see a success notification
```

*Scenario 2: Duplicate name validation*
```
Given a voice clone named "Ken - Professional" exists
When I try to create a clone with the same name
Then I see an error message "A voice clone with this name already exists"
And the form is not submitted
```

*Scenario 3: Add tags during creation*
```
Given I am creating a new voice clone
When I add tags by typing and pressing Enter
Then tags appear as chips below the input
And I can remove tags by clicking the X
```

*Rule-based Criteria*:
- [ ] Name is required, 1-255 characters
- [ ] Name allows alphanumeric, spaces, hyphens, underscores only
- [ ] Description is optional, max 2000 characters
- [ ] Tags: max 20 tags, each max 50 characters
- [ ] Form validates in real-time
- [ ] Creation completes within 2 seconds

**Technical Notes**:
- API Endpoint: `POST /api/voice-clones`
- Request body: `{ name: string, description?: string, tags?: string[] }`
- Database: Insert into `voice_clones` table
- Generate UUID on server side
- Frontend: Create `VoiceCloneCreateForm` component
- Use Zod for form validation

**Dependencies**: None

**Edge Cases**:
- Handle special characters in name (sanitize)
- Handle network timeout (show retry option)
- Trim whitespace from name

---

#### US-02-003: View Voice Clone Details

**Priority**: P0 | **Points**: 3 | **Sprint**: 1

**User Story**:
```
As a content creator,
I want to view detailed information about a voice clone,
So that I can understand its status, samples, and voice DNA.
```

**Acceptance Criteria**:

*Scenario 1: View clone details*
```
Given I have a voice clone
When I click on the clone from the list
Then I see the clone's detail page with:
  - Name, description, tags, avatar
  - Confidence score with visual indicator
  - Recommendations to improve score
  - List of writing samples with word counts
  - Total word count across all samples
  - Voice DNA section (if analyzed)
  - Created and last modified dates
```

*Scenario 2: View confidence recommendations*
```
Given my voice clone has a confidence score below 80
When I view the clone details
Then I see specific recommendations to improve the score
Examples:
  - "Add more writing samples to improve accuracy. You have 800 words; aim for at least 2,500."
  - "Add different content types (blog posts, emails, tweets) to capture full range."
```

*Scenario 3: Clone with no samples*
```
Given my voice clone has no writing samples
When I view the clone details
Then I see the confidence score as 0
And I see a prominent call-to-action to add samples
And the Voice DNA section shows "Analyze requires samples"
```

*Rule-based Criteria*:
- [ ] Page loads within 2 seconds
- [ ] All metadata fields are displayed even if empty (show placeholder)
- [ ] Confidence score updates immediately when samples change
- [ ] Quick actions visible: Edit, Add Sample, Analyze, Delete

**Technical Notes**:
- API Endpoint: `GET /api/voice-clones/{id}`
- Include related data: samples, current DNA version
- Frontend: Create `VoiceCloneDetail` component with tabbed sections
- Calculate confidence score on backend when fetching

**Dependencies**: US-02-001, US-02-002

**Edge Cases**:
- Handle deleted clone (404 page)
- Handle clone with analysis in progress (show loading state)

---

#### US-02-004: Edit Voice Clone Metadata

**Priority**: P0 | **Points**: 2 | **Sprint**: 1

**User Story**:
```
As a content creator,
I want to edit my voice clone's name, description, and tags,
So that I can keep the information accurate and organized.
```

**Acceptance Criteria**:

*Scenario 1: Edit metadata*
```
Given I am on a voice clone's detail page
When I click "Edit"
Then the metadata fields become editable
When I modify the name, description, or tags and click "Save"
Then the changes are saved
And I see a success notification
And the updated_at timestamp refreshes
```

*Scenario 2: Cancel editing*
```
Given I am editing a voice clone
When I click "Cancel"
Then my changes are discarded
And the fields return to read-only with original values
```

*Rule-based Criteria*:
- [ ] Same validation rules as US-02-002 apply
- [ ] Name uniqueness checked (excluding current clone)
- [ ] Save completes within 2 seconds

**Technical Notes**:
- API Endpoint: `PATCH /api/voice-clones/{id}`
- Request body: `{ name?: string, description?: string, tags?: string[] }`
- Only update fields that are provided
- Frontend: Reuse form components from creation

**Dependencies**: US-02-003

**Edge Cases**:
- Handle concurrent edits (last-write-wins)
- Validate name uniqueness server-side

---

#### US-02-005: Delete Voice Clone

**Priority**: P0 | **Points**: 2 | **Sprint**: 1

**User Story**:
```
As a content creator,
I want to delete a voice clone I no longer need,
So that I can keep my workspace organized.
```

**Acceptance Criteria**:

*Scenario 1: Delete clone*
```
Given I am on a voice clone's detail page
When I click "Delete"
Then I see a confirmation dialog with the clone's name
And a warning that this action cannot be undone
And a warning that all samples and DNA will be deleted
When I confirm deletion
Then the clone is deleted
And I am redirected to the Voice Clones list
And I see a success notification
```

*Scenario 2: Cancel deletion*
```
Given I see the delete confirmation dialog
When I click "Cancel"
Then the dialog closes
And the clone is not deleted
```

*Rule-based Criteria*:
- [ ] Deletion is cascading (removes samples, DNA versions, merge sources)
- [ ] Content generated from this clone is NOT deleted (orphaned)
- [ ] Deletion completes within 3 seconds
- [ ] User must type clone name to confirm (for clones with >5 samples)

**Technical Notes**:
- API Endpoint: `DELETE /api/voice-clones/{id}`
- Use database cascade delete for related records
- Update Content records to set `voice_clone_id` to null (preserve content)
- Frontend: Implement confirmation modal with optional name typing

**Dependencies**: US-02-003

**Edge Cases**:
- Handle deletion of merged clone source (preserve merged clone, mark source as deleted)
- Handle deletion while analysis is in progress (cancel analysis first)

---

#### US-02-006: Add Writing Sample via Paste

**Priority**: P0 | **Points**: 3 | **Sprint**: 2

**User Story**:
```
As a content creator,
I want to add a writing sample by pasting text,
So that I can quickly add content I've copied from elsewhere.
```

**Acceptance Criteria**:

*Scenario 1: Paste text sample*
```
Given I am on a voice clone's detail page
When I click "Add Sample" and select "Paste Text"
Then I see a form with: Title (optional), Content (required), Content Type (dropdown)
When I paste text content and click "Save"
Then the sample is added to the voice clone
And I see the word count calculated
And the confidence score updates
And I see a success notification
```

*Scenario 2: Empty content validation*
```
Given I am adding a sample via paste
When I try to save with empty content
Then I see an error "Content is required"
And the form is not submitted
```

*Rule-based Criteria*:
- [ ] Content type options: Tweet, Blog, Email, Article, LinkedIn, Other
- [ ] Word count calculated accurately (handle hyphenated words, contractions)
- [ ] Maximum 100,000 characters per sample
- [ ] Whitespace is trimmed but preserved internally

**Technical Notes**:
- API Endpoint: `POST /api/voice-clones/{id}/samples`
- Request body: `{ title?: string, content: string, content_type?: string, source_type: "paste" }`
- Calculate word count server-side
- Frontend: Create `AddSampleModal` with tabs for different input methods

**Dependencies**: US-02-003

**Edge Cases**:
- Handle pasting formatted text (strip HTML, keep plain text)
- Handle very long pastes (show character count warning)

---

#### US-02-007: Add Writing Sample via File Upload

**Priority**: P0 | **Points**: 5 | **Sprint**: 2

**User Story**:
```
As a content creator,
I want to add a writing sample by uploading a file,
So that I can use existing documents without manual copying.
```

**Acceptance Criteria**:

*Scenario 1: Upload text file*
```
Given I am adding a sample and select "Upload File"
When I select a .txt file
Then the file content is extracted
And I see a preview of the extracted text
And I can edit the title and content type
When I click "Save"
Then the sample is added with source_type "file" and source_reference as filename
```

*Scenario 2: Upload DOCX file*
```
Given I am adding a sample
When I select a .docx file
Then the text content is extracted (without formatting)
And I see a preview of the extracted text
```

*Scenario 3: Upload PDF file*
```
Given I am adding a sample
When I select a .pdf file
Then the text content is extracted
And I see a preview of the extracted text
```

*Scenario 4: Unsupported file type*
```
Given I am adding a sample
When I select an unsupported file type (e.g., .jpg, .xlsx)
Then I see an error "Unsupported file type. Please upload .txt, .docx, or .pdf"
```

*Rule-based Criteria*:
- [ ] Supported formats: .txt, .docx, .pdf
- [ ] Maximum file size: 10MB
- [ ] File parsing happens server-side
- [ ] Original file is NOT stored (only extracted text)
- [ ] Extraction preserves paragraph breaks

**Technical Notes**:
- API Endpoint: `POST /api/voice-clones/{id}/samples/upload`
- Use multipart form data for file upload
- Backend parsers: PyMuPDF for PDF, python-docx for DOCX
- Extract text and create sample record
- Return extracted text for preview before final save

**Dependencies**: US-02-006

**Edge Cases**:
- Handle password-protected PDFs (error message)
- Handle corrupted files (graceful error)
- Handle scanned PDFs with no text (OCR out of scope, show warning)

---

#### US-02-008: Add Writing Sample via URL

**Priority**: P0 | **Points**: 5 | **Sprint**: 2

**User Story**:
```
As a content creator,
I want to add a writing sample by providing a URL,
So that I can easily import content from my published articles and posts.
```

**Acceptance Criteria**:

*Scenario 1: Scrape URL content*
```
Given I am adding a sample and select "From URL"
When I enter a valid URL and click "Fetch"
Then the system scrapes the URL and extracts main text content
And I see a preview of the extracted text
And the URL is stored as source_reference
When I click "Save"
Then the sample is added with source_type "url"
```

*Scenario 2: Invalid URL*
```
Given I am adding a sample from URL
When I enter an invalid URL format
Then I see an error "Please enter a valid URL"
```

*Scenario 3: URL fetch failure*
```
Given I am adding a sample from URL
When the URL cannot be fetched (404, timeout, blocked)
Then I see an error message explaining the issue
And I have the option to try again or paste content manually
```

*Rule-based Criteria*:
- [ ] URL validation: must be http or https
- [ ] Timeout: 30 seconds maximum
- [ ] Extracted content excludes navigation, ads, footers
- [ ] Respects robots.txt (best effort)

**Technical Notes**:
- API Endpoint: `POST /api/voice-clones/{id}/samples/url`
- Request body: `{ url: string }`
- Backend: Use httpx for fetching, BeautifulSoup for parsing
- Extract from `<article>`, `<main>`, or `.content` selectors
- Store URL but not full HTML

**Dependencies**: US-02-006

**Edge Cases**:
- Handle JavaScript-rendered pages (return error, suggest paste)
- Handle paywalled content (return error)
- Handle redirects (follow up to 5 redirects)
- Handle rate limiting (respect and report)
- Handle authentication-required pages (error: "This page requires login. Please copy and paste the content manually.")
- Handle sites that block scraping/bots (error: "Unable to access this URL. The site may block automated access.")
- Rate limit requests to same domain (max 1 request per second per domain)
- Display legal/TOS notice: "Ensure you have rights to use scraped content"

---

#### US-02-009: View and Manage Writing Samples

**Priority**: P0 | **Points**: 3 | **Sprint**: 2

**User Story**:
```
As a content creator,
I want to view and manage all writing samples for a voice clone,
So that I can review what content is being used and remove irrelevant samples.
```

**Acceptance Criteria**:

*Scenario 1: View samples list*
```
Given I am on a voice clone's detail page
When I view the Writing Samples section
Then I see a list of all samples with: title (or snippet), source type icon, word count, content type, date added
And samples are sorted by date added (newest first)
```

*Scenario 2: View sample details*
```
Given I am viewing the samples list
When I click on a sample
Then I see the full content of the sample
And I see all metadata: title, source reference, content type, word count
```

*Scenario 3: Edit sample metadata*
```
Given I am viewing a sample's details
When I click "Edit"
Then I can modify: title, content type
And I click "Save"
Then the changes are saved
```

*Scenario 4: Delete sample*
```
Given I am viewing a sample's details
When I click "Delete"
Then I see a confirmation dialog
When I confirm
Then the sample is deleted
And the confidence score updates
And I see a notification suggesting re-analysis
```

*Rule-based Criteria*:
- [ ] Sample content is NOT editable (only metadata)
- [ ] Deleting a sample triggers confidence score recalculation
- [ ] System suggests re-analyzing DNA after sample changes

**Technical Notes**:
- API Endpoint: `GET /api/voice-clones/{id}/samples`
- API Endpoint: `GET /api/voice-clones/{id}/samples/{sample_id}`
- API Endpoint: `PATCH /api/voice-clones/{id}/samples/{sample_id}`
- API Endpoint: `DELETE /api/voice-clones/{id}/samples/{sample_id}`
- Frontend: Create `SampleList` and `SampleDetail` components

**Dependencies**: US-02-006, US-02-007, US-02-008

**Edge Cases**:
- Handle very long samples (paginate content view)
- Handle deleting last sample (confidence goes to 0)

---

#### US-02-010: Calculate Confidence Score

**Priority**: P0 | **Points**: 5 | **Sprint**: 2

**User Story**:
```
As a content creator,
I want to see a confidence score for my voice clone,
So that I know if I have enough samples for accurate voice replication.
```

**Acceptance Criteria**:

*Scenario 1: View confidence score*
```
Given I have a voice clone with samples
When I view the clone's detail page
Then I see a confidence score (0-100) with visual indicator
And I see a breakdown of what contributes to the score
```

*Scenario 2: Score interpretation*
```
Given my voice clone has a confidence score
Then I see an interpretation:
  - 80-100: "High confidence - voice clone ready for use" (green)
  - 60-79: "Medium confidence - usable, but more samples recommended" (yellow)
  - 40-59: "Low confidence - add more samples for better results" (orange)
  - 0-39: "Very low - insufficient samples for reliable cloning" (red)
```

*Scenario 3: Score breakdown*
```
Given I am viewing the confidence score
When I click "See Details"
Then I see a breakdown:
  - Word count: X/30 points
  - Sample count: X/20 points
  - Content type variety: X/20 points
  - Length distribution: X/15 points
  - Consistency: X/15 points (if DNA analyzed)
```

*Rule-based Criteria*:
- [ ] Score recalculates when samples added/removed
- [ ] Score algorithm matches PRD specification exactly
- [ ] Score is cached and only recalculated on sample changes

**Technical Notes**:
- Implement in `services/voice_clone.py` as `calculate_confidence_score()`
- Score components per PRD section 4.2.3
- Store `confidence_score` on `VoiceClone` model
- Recalculate on sample CRUD operations
- Consistency score requires DNA analysis (use placeholder until analyzed)

**Dependencies**: US-02-006, US-02-007, US-02-008, US-02-009

**Edge Cases**:
- Handle clone with no samples (score = 0)
- Handle consistency calculation before DNA analysis (skip that component)

---

#### US-02-011: Trigger Voice DNA Analysis

**Priority**: P0 | **Points**: 8 | **Sprint**: 3

**User Story**:
```
As a content creator,
I want to analyze my writing samples to generate Voice DNA,
So that the system can understand and replicate my writing style.
```

**Acceptance Criteria**:

*Scenario 1: Start analysis*
```
Given I have a voice clone with at least one sample
When I click "Analyze Voice"
Then I see a loading state indicating analysis is in progress
And the button becomes disabled
And I see estimated time remaining
```

*Scenario 2: Analysis complete*
```
Given analysis is in progress
When the analysis completes successfully
Then I see a success notification
And the Voice DNA section updates with the new analysis
And a new DNA version is created
And the confidence score's consistency component updates
```

*Scenario 3: Insufficient samples*
```
Given my voice clone has less than 500 words total
When I click "Analyze Voice"
Then I see a warning that more samples are recommended
And I can choose to proceed anyway or add more samples
```

*Scenario 4: Analysis failure*
```
Given analysis is in progress
When the analysis fails (API error, timeout)
Then I see an error message with the reason
And I have the option to retry
And no partial DNA is saved
```

*Rule-based Criteria*:
- [ ] Analysis uses Voice Cloning Instructions from settings
- [ ] Analysis creates a new VoiceDnaVersion record
- [ ] Previous DNA versions are preserved
- [ ] Analysis completes within 60 seconds for typical sample sets
- [ ] Analysis can be triggered multiple times (regenerate)

**Technical Notes**:
- API Endpoint: `POST /api/voice-clones/{id}/analyze`
- Async operation - return immediately with status, poll for completion
- Or use WebSocket for real-time updates
- Build prompt from: Voice Cloning Instructions + concatenated samples
- Parse AI response as JSON into VoiceDNA structure
- Store in `VoiceDnaVersion` with trigger='initial' or 'regenerate'
- Update `VoiceClone.current_dna_id`

**Dependencies**: US-01-001, US-02-009

**Edge Cases**:
- Handle concurrent analysis requests (queue or reject)
- Handle AI provider rate limiting
- Handle malformed AI response (retry with different prompt)
- Handle samples from visibly different time periods (note in DNA: "Voice patterns may have evolved over time - samples span X years")
- Warn if samples appear to be from multiple authors: "Inconsistent voice patterns detected. Please verify all samples are from the same writer."
- Handle mixed language samples (note languages detected, warn if analysis may be less accurate)

---

#### US-02-012: View Voice DNA

**Priority**: P0 | **Points**: 3 | **Sprint**: 3

**User Story**:
```
As a content creator,
I want to view the analyzed Voice DNA for my clone,
So that I can understand what the system learned about my writing style.
```

**Acceptance Criteria**:

*Scenario 1: View DNA overview*
```
Given my voice clone has been analyzed
When I view the Voice DNA section
Then I see a summary including:
  - Analysis date
  - Total words analyzed
  - Sample count used
  - Content types analyzed
  - Confidence score at analysis time
```

*Scenario 2: View DNA details*
```
Given I am viewing the Voice DNA section
When I expand the detailed view
Then I see all DNA components organized by category:
  - Vocabulary (preferred words, avoided words, technical terms)
  - Sentence Structure (average length, complexity distribution)
  - Tone Markers (formality, confidence, directness)
  - Rhetorical Devices (metaphors, questions, storytelling)
  - Punctuation Habits
  - Opening Patterns
  - Closing Patterns
  - Humor and Personality
  - Distinctive Signatures
```

*Scenario 3: No DNA yet*
```
Given my voice clone has not been analyzed
When I view the Voice DNA section
Then I see a message "No Voice DNA yet"
And I see a button to "Analyze Voice"
```

*Rule-based Criteria*:
- [ ] DNA displays in human-readable format (not raw JSON)
- [ ] Each section is collapsible/expandable
- [ ] Example phrases are highlighted
- [ ] Technical terms have tooltips explaining them

**Technical Notes**:
- API Endpoint: `GET /api/voice-clones/{id}/dna`
- Return current DNA version with formatted display data
- Frontend: Create `VoiceDnaViewer` component with accordion sections
- Consider visual representations (charts for distributions)

**Dependencies**: US-02-011

**Edge Cases**:
- Handle partially complete DNA (if some sections failed)
- Handle very long example lists (truncate with "show more")

---

#### US-02-013: Edit Voice DNA Manually

**Priority**: P1 | **Points**: 5 | **Sprint**: 4

**User Story**:
```
As a content creator,
I want to manually edit the Voice DNA,
So that I can fine-tune the analysis or correct inaccuracies.
```

**Acceptance Criteria**:

*Scenario 1: Edit DNA field*
```
Given I am viewing the Voice DNA
When I click "Edit"
Then the DNA fields become editable
When I modify a field (e.g., add a preferred word)
And I click "Save"
Then the changes are saved
And a new DNA version is created with trigger "manual_edit"
```

*Scenario 2: Edit validation*
```
Given I am editing the Voice DNA
When I try to save invalid JSON structure
Then I see a validation error
And the save is prevented
```

*Rule-based Criteria*:
- [ ] Edits create new version (don't overwrite)
- [ ] JSON structure must remain valid
- [ ] Individual fields can be edited without affecting others
- [ ] Changes are highlighted compared to previous version

**Technical Notes**:
- API Endpoint: `PATCH /api/voice-clones/{id}/dna`
- Request body: Partial DNA object with only changed fields
- Merge with existing DNA and create new version
- Frontend: Use JSON editor with schema validation

**Dependencies**: US-02-012

**Edge Cases**:
- Handle conflicting edits while regenerating
- Validate DNA structure against expected schema

---

#### US-02-014: View and Revert DNA History

**Priority**: P1 | **Points**: 3 | **Sprint**: 4

**User Story**:
```
As a content creator,
I want to view previous versions of Voice DNA and revert to them,
So that I can recover from unwanted changes or compare analyses.
```

**Acceptance Criteria**:

*Scenario 1: View DNA version history*
```
Given my voice clone has multiple DNA versions
When I click "Version History"
Then I see a list of versions with: version number, date, trigger (initial/regenerate/manual_edit/revert)
And I see the last 10 versions
```

*Scenario 2: Compare versions*
```
Given I am viewing the version history
When I select a previous version
Then I see that version's DNA
And I can compare side-by-side with current
```

*Scenario 3: Revert to previous version*
```
Given I am viewing a previous DNA version
When I click "Revert to this version"
And I confirm
Then that version becomes the current DNA
And a new version is created with trigger "revert"
```

*Rule-based Criteria*:
- [ ] System retains last 10 versions
- [ ] Revert creates new version (preserves history)
- [ ] Version comparison highlights differences

**Technical Notes**:
- API Endpoint: `GET /api/voice-clones/{id}/dna/history`
- API Endpoint: `POST /api/voice-clones/{id}/dna/revert/{version_id}`
- Frontend: Reuse version history components from settings

**Dependencies**: US-02-011, US-02-013

**Edge Cases**:
- Handle version being reverted while editing

---

#### US-02-015: Upload Voice Clone Avatar

**Priority**: P2 | **Points**: 2 | **Sprint**: 5

**User Story**:
```
As a content creator,
I want to upload an avatar image for my voice clone,
So that I can visually identify different clones easily.
```

**Acceptance Criteria**:

*Scenario 1: Upload avatar*
```
Given I am on a voice clone's detail page
When I click on the avatar placeholder
Then I can select an image file to upload
When I select a valid image
Then the image is uploaded and displayed as the avatar
```

*Scenario 2: Remove avatar*
```
Given my voice clone has an avatar
When I click "Remove Avatar"
Then the avatar is removed
And a placeholder is shown
```

*Rule-based Criteria*:
- [ ] Supported formats: JPG, PNG, GIF, WebP
- [ ] Maximum file size: 5MB
- [ ] Image is resized/cropped to 256x256
- [ ] Images stored securely (local dev, S3/R2 prod)

**Technical Notes**:
- API Endpoint: `POST /api/voice-clones/{id}/avatar`
- API Endpoint: `DELETE /api/voice-clones/{id}/avatar`
- Use multipart form data
- Process image server-side (resize with Pillow)
- Store URL in `avatar_url` field

**Dependencies**: US-02-003

**Edge Cases**:
- Handle invalid image files
- Handle very large images (resize before upload)

---

#### US-02-016: Compare Voice Clones Side-by-Side

**Priority**: P1 | **Points**: 5 | **Sprint**: 4

**User Story**:
```
As a content creator,
I want to compare two voice clones side-by-side,
So that I can understand their differences before merging or choosing one for content.
```

**Acceptance Criteria**:

*Scenario 1: Select clones to compare*
```
Given I am on the Voice Clones page
When I select 2 voice clones using checkboxes
Then I see a "Compare" button appear
When I click "Compare"
Then a side-by-side comparison view opens
```

*Scenario 2: View comparison details*
```
Given I am viewing the comparison
Then I see for each clone:
  - Name and description
  - Confidence score with visual indicator
  - Sample count and total word count
  - Voice DNA summary (key elements)
And differences are highlighted with color coding
```

*Scenario 3: Compare DNA elements*
```
Given I am viewing the comparison
When I expand the "Voice DNA Comparison" section
Then I see DNA elements side-by-side:
  - Vocabulary (preferred words, avoided words)
  - Tone markers (formality level, directness)
  - Sentence structure (average length, complexity)
And elements that differ significantly are highlighted
Example: Clone A formality=3, Clone B formality=8 → highlighted
```

*Scenario 4: Actions from comparison*
```
Given I am viewing the comparison
Then I see action buttons:
  - "Merge These Clones" → goes to merge flow with these pre-selected
  - "Use Clone A for Content" → goes to content creator with Clone A
  - "Use Clone B for Content" → goes to content creator with Clone B
```

*Rule-based Criteria*:
- [ ] Only clones with DNA can be compared meaningfully
- [ ] Highlight differences with color coding (red/green for variance)
- [ ] Comparison is read-only
- [ ] Can only compare exactly 2 clones at a time
- [ ] Clone without DNA shows warning "Analyze first for full comparison"

**Technical Notes**:
- API Endpoint: `GET /api/voice-clones/compare?ids=uuid1,uuid2`
- Returns both clones with computed diff highlights
- Frontend: Create `VoiceCloneComparison` component
- Use diff algorithm to identify significant differences
- Consider threshold for "significant" difference (e.g., >2 points on scales)

**Dependencies**: US-02-012, US-02-003

**Edge Cases**:
- Handle comparing merged clone with its source clone
- Handle comparing clone with no DNA to clone with DNA
- Handle very different DNA structures

---

### 4.3 Epic: Voice Clone Merger (EP-03)

**Epic Description**: Combine elements from multiple voice clones to create new hybrid voices.

---

#### US-03-001: Select Clones to Merge

**Priority**: P0 | **Points**: 3 | **Sprint**: 4

**User Story**:
```
As a content creator,
I want to select multiple voice clones to merge,
So that I can combine different writing style elements.
```

**Acceptance Criteria**:

*Scenario 1: Start merge flow*
```
Given I am on the Voice Clones page
When I click "Merge Clones"
Then I see a selection interface showing all my voice clones
And clones without DNA are disabled with tooltip "Analyze first"
```

*Scenario 2: Select clones*
```
Given I am in the merge selection interface
When I select 2 or more voice clones (up to 5)
And I click "Continue"
Then I proceed to the element weighting step
```

*Scenario 3: Minimum selection*
```
Given I have selected only 1 voice clone
When I try to continue
Then I see an error "Select at least 2 voice clones to merge"
```

*Rule-based Criteria*:
- [ ] Minimum 2 clones required
- [ ] Maximum 5 clones allowed
- [ ] Only clones with DNA can be selected
- [ ] Shows clone name, confidence score, sample count

**Technical Notes**:
- Frontend: Create `MergeCloneSelection` component
- Track selected clones in local state
- Validate DNA exists before allowing selection

**Dependencies**: US-02-011

**Edge Cases**:
- Handle user with less than 2 analyzed clones
- Handle clone being deleted during selection

---

#### US-03-002: Configure Element Weights

**Priority**: P0 | **Points**: 5 | **Sprint**: 4

**User Story**:
```
As a content creator,
I want to configure which elements come from which clone and in what proportion,
So that I can create a precisely customized merged voice.
```

**Acceptance Criteria**:

*Scenario 1: View element configuration*
```
Given I have selected clones to merge
When I reach the element configuration step
Then I see all mergeable elements listed:
  - Vocabulary, Sentence Structure, Paragraph Structure, Tone
  - Rhetorical Devices, Punctuation, Openings, Closings
  - Humor, Personality
And for each element, I see a slider/input for each selected clone
```

*Scenario 2: Set element weights*
```
Given I am configuring element weights
When I adjust the slider for "Humor" to take 80% from Clone A and 20% from Clone B
Then the interface shows the proportion visually
And the weights for that element total 100%
```

*Scenario 3: Preset configurations*
```
Given I am configuring element weights
When I select a preset (e.g., "Equal Mix", "Primary with Accent")
Then all sliders adjust to match the preset configuration
```

*Rule-based Criteria*:
- [ ] Each element's weights across all sources must sum to 100%
- [ ] Minimum weight: 0%, Maximum: 100%
- [ ] Real-time validation of weight totals
- [ ] Preview of what the merge will produce

**Technical Notes**:
- Frontend: Create `ElementWeightConfig` component with sliders
- Use Zustand for complex state management
- Presets stored as configuration objects
- Element list matches PRD section 4.3.1

**Dependencies**: US-03-001

**Edge Cases**:
- Handle 5 clones with complex weight distribution
- Handle UI responsiveness with many sliders

---

#### US-03-003: Create Merged Voice Clone

**Priority**: P0 | **Points**: 8 | **Sprint**: 4

**User Story**:
```
As a content creator,
I want to generate a new merged voice clone from my configuration,
So that I can use the combined voice for content generation.
```

**Acceptance Criteria**:

*Scenario 1: Generate merged clone*
```
Given I have configured element weights
When I enter a name for the merged clone
And I click "Create Merged Clone"
Then the system generates a merged Voice DNA
And a new voice clone is created with is_merged = true
And I am redirected to the new clone's detail page
```

*Scenario 2: Merge in progress*
```
Given I clicked "Create Merged Clone"
Then I see a loading state
And I see progress indication (e.g., "Merging vocabulary... Merging tone...")
```

*Scenario 3: Duplicate name*
```
Given a voice clone with my chosen name already exists
When I try to create the merged clone
Then I see an error about the duplicate name
```

*Rule-based Criteria*:
- [ ] Merged clone has is_merged = true
- [ ] merge_config stores full configuration
- [ ] Source clone IDs tracked in VoiceCloneMergeSource
- [ ] Merged DNA follows merge algorithm from PRD
- [ ] Creation completes within 60 seconds

**Technical Notes**:
- API Endpoint: `POST /api/voice-clones/merge`
- Request body: `{ name: string, sources: [{ voice_clone_id, elements: {element: weight} }] }`
- Use AI to generate merged DNA from source DNAs and weights
- Store merge configuration for later reference/regeneration

**Dependencies**: US-03-002

**Edge Cases**:
- Handle source clone deletion after merge (preserve merged clone)
- Handle merge failure (cleanup partial data)

---

#### US-03-004: View Merged Clone Sources

**Priority**: P1 | **Points**: 2 | **Sprint**: 5

**User Story**:
```
As a content creator,
I want to see which clones were used to create a merged clone,
So that I can understand the composition and potentially recreate it.
```

**Acceptance Criteria**:

*Scenario 1: View merge composition*
```
Given I am viewing a merged voice clone
Then I see a "Merge Composition" section
And I see the source clones listed with their element weights
And I see links to each source clone (if still exists)
```

*Scenario 2: Deleted source clone*
```
Given a source clone has been deleted
When I view the merge composition
Then I see the deleted clone marked as "(Deleted)"
And the historical weights are still shown
```

*Rule-based Criteria*:
- [ ] Display shows element-by-element breakdown
- [ ] Visualization shows proportions clearly
- [ ] Links to source clones work (if not deleted)

**Technical Notes**:
- Data from `VoiceCloneMergeSource` table
- Frontend: Create `MergeComposition` component
- Handle deleted source clones gracefully

**Dependencies**: US-03-003

**Edge Cases**:
- Handle all source clones being deleted

---

#### US-03-005: Regenerate Merged DNA

**Priority**: P1 | **Points**: 3 | **Sprint**: 5

**User Story**:
```
As a content creator,
I want to regenerate the merged DNA when source clones are updated,
So that my merged clone reflects the latest source analyses.
```

**Acceptance Criteria**:

*Scenario 1: Detect outdated merge*
```
Given a source clone's DNA has been updated since the merge
When I view the merged clone
Then I see a notification "Source clones have been updated"
And I see an option to "Regenerate Merged DNA"
```

*Scenario 2: Regenerate merge*
```
Given I click "Regenerate Merged DNA"
Then the system uses the stored merge configuration
And applies it to the current source DNAs
And a new DNA version is created
```

*Rule-based Criteria*:
- [ ] Regeneration uses original weight configuration
- [ ] Creates new DNA version (doesn't overwrite)
- [ ] Works even if some source clones were deleted (use last known DNA)

**Technical Notes**:
- Track source DNA version IDs in merge_config
- Compare current source DNA IDs to detect changes
- Regeneration creates new VoiceDnaVersion with trigger='regenerate'

**Dependencies**: US-03-003, US-03-004

**Edge Cases**:
- Handle deleted source clones (use cached DNA from merge_config)
- Handle all sources deleted (cannot regenerate)

---

### 4.4 Epic: Voice Clone Content Creator (EP-04)

**Epic Description**: Generate new content using a selected voice clone.

---

#### US-04-001: Select Voice Clone for Content Creation

**Priority**: P0 | **Points**: 2 | **Sprint**: 3

**User Story**:
```
As a content creator,
I want to select which voice clone to use when creating content,
So that I can generate content in a specific voice.
```

**Acceptance Criteria**:

*Scenario 1: Select clone*
```
Given I am on the Create Content page
When I see the voice clone selector
Then I see a searchable dropdown of all my voice clones
And each option shows: name, confidence score indicator, merged badge (if applicable)
When I select a clone
Then it becomes the active voice for generation
```

*Scenario 2: Filter clones*
```
Given I am selecting a voice clone
When I type in the search box
Then the list filters to matching clone names
And tags are also searched
```

*Scenario 3: No analyzed clones*
```
Given I have no voice clones with DNA
When I try to select a clone for content creation
Then I see a message "No voice clones ready. Analyze a clone first."
And I see a link to the Voice Clones page
```

*Rule-based Criteria*:
- [ ] Only clones with DNA are selectable
- [ ] Most recently used clone is pre-selected (if any)
- [ ] Clone confidence score visible during selection
- [ ] Search is case-insensitive

**Technical Notes**:
- API Endpoint: `GET /api/voice-clones?has_dna=true`
- Frontend: Create `VoiceCloneSelector` component
- Store last used clone in localStorage

**Dependencies**: US-02-011

**Edge Cases**:
- Handle clone being deleted after selection (clear selection, show message)

---

#### US-04-002: Enter Content Input

**Priority**: P0 | **Points**: 3 | **Sprint**: 3

**User Story**:
```
As a content creator,
I want to enter my rough content ideas, bullets, or draft,
So that the system has material to transform into my voice.
```

**Acceptance Criteria**:

*Scenario 1: Enter text input*
```
Given I have selected a voice clone
When I see the content input area
Then I see a large text area with placeholder "Enter your ideas, bullets, or rough draft..."
And I can type or paste content up to 10,000 characters
And I see a character count indicator
```

*Scenario 2: Markdown support*
```
Given I am entering content
When I use markdown formatting (bullets, headers, bold)
Then the formatting is preserved and rendered in preview
```

*Scenario 3: Empty input validation*
```
Given I have not entered any content
When I try to generate
Then I see an error "Please enter some content to transform"
```

*Rule-based Criteria*:
- [ ] Maximum 10,000 characters
- [ ] Supports markdown formatting
- [ ] Autosaves draft to localStorage every 30 seconds
- [ ] Shows character count with warning at 9,000+

**Technical Notes**:
- Frontend: Create `ContentInput` component with markdown preview
- Use localStorage for draft persistence
- Consider using a markdown editor library

**Dependencies**: US-04-001

**Edge Cases**:
- Handle pasting very long content (truncate with warning)
- Handle special characters and emojis

---

#### US-04-003: Configure Content Properties

**Priority**: P0 | **Points**: 5 | **Sprint**: 3

**User Story**:
```
As a content creator,
I want to configure properties like length, tone, and audience,
So that I can customize the generated content for my needs.
```

**Acceptance Criteria**:

*Scenario 1: Configure basic properties*
```
Given I am creating content
When I view the properties panel
Then I see configurable options:
  - Length: Short / Medium / Long / Custom (word count)
  - Tone Override: Slider 1-10 (or "Match Voice DNA")
  - Formality Override: Slider 1-10 (or "Match Voice DNA")
  - Humor Level: Slider 1-10 (or "Match Voice DNA")
```

*Scenario 2: Set target audience*
```
Given I am configuring content properties
When I enter a target audience description
Then it is included in the generation context
Example: "Tech executives who are skeptical of AI"
```

*Scenario 3: Set call-to-action style*
```
Given I am configuring content properties
When I select a CTA style (None / Soft / Direct / Urgent)
Then the generated content will match that CTA approach
```

*Scenario 4: Include/exclude phrases*
```
Given I am configuring content properties
When I add phrases to include (e.g., "sign up today")
And I add phrases to exclude (e.g., "synergy")
Then the generated content respects these constraints
```

*Rule-based Criteria*:
- [ ] Properties panel is collapsible (default expanded)
- [ ] Sliders show current value
- [ ] "Match Voice DNA" is default for tone/formality/humor
- [ ] Target audience is optional, max 500 characters
- [ ] Max 10 include phrases, 10 exclude phrases, each max 100 chars

**Technical Notes**:
- Frontend: Create `ContentProperties` component
- Store properties in Zustand store
- Defaults reset for each new content creation

**Dependencies**: US-04-002

**Edge Cases**:
- Handle conflicting settings (e.g., "urgent" CTA with low formality)

---

#### US-04-004: Select Target Platforms

**Priority**: P0 | **Points**: 3 | **Sprint**: 3

**User Story**:
```
As a content creator,
I want to select which platforms to generate content for,
So that I get properly formatted content for each platform.
```

**Acceptance Criteria**:

*Scenario 1: Select platforms*
```
Given I am creating content
When I view the platform selector
Then I see all available platforms: LinkedIn, Twitter/X, Facebook, Instagram, Email, Blog, SMS
And I can select one or multiple platforms
And selected platforms are visually highlighted
```

*Scenario 2: Multi-platform selection*
```
Given I select multiple platforms (e.g., LinkedIn and Twitter)
When content is generated
Then I get a separate, optimized version for each platform
```

*Scenario 3: No platform selected*
```
Given I have not selected any platforms
When I try to generate
Then I see an error "Please select at least one platform"
```

*Rule-based Criteria*:
- [ ] At least one platform must be selected
- [ ] Platforms show icons for visual recognition
- [ ] Platform best practices tooltip on hover
- [ ] Custom platforms from settings appear here

**Technical Notes**:
- API Endpoint: `GET /api/settings/platforms` (for list)
- Frontend: Create `PlatformSelector` component with checkboxes/toggles
- Multiple selection using checkbox or toggle buttons

**Dependencies**: US-01-006

**Edge Cases**:
- Handle custom platforms being deleted (remove from selection)

---

#### US-04-005: Generate Content

**Priority**: P0 | **Points**: 8 | **Sprint**: 3

**User Story**:
```
As a content creator,
I want to generate content based on my input and configuration,
So that I can get platform-optimized content in my voice.
```

**Acceptance Criteria**:

*Scenario 1: Generate single platform*
```
Given I have entered content, selected a voice clone, and chosen one platform
When I click "Generate"
Then I see a loading state with progress indication
And within 30 seconds, the generated content appears
And the content is displayed with the AI detection score
```

*Scenario 2: Generate multiple platforms*
```
Given I have selected multiple platforms
When I click "Generate"
Then content is generated for each platform
And I see a tab for each platform's content
And each version is optimized for its platform
```

*Scenario 3: Generation failure*
```
Given I click "Generate"
When the generation fails (API error, timeout)
Then I see an error message
And I have the option to retry
And my input and configuration are preserved
```

*Rule-based Criteria*:
- [ ] Generation uses Voice DNA from selected clone
- [ ] Generation follows Anti-AI Guidelines from settings
- [ ] Generation follows Platform Best Practices for each platform
- [ ] Generation completes within 30 seconds per platform
- [ ] Progress indication shows which platform is being generated
- [ ] Generated content is automatically saved to library

**Technical Notes**:
- API Endpoint: `POST /api/content/generate`
- Request body: `{ voice_clone_id, input, properties, platforms[] }`
- Backend builds prompt using: DNA + Anti-AI Guidelines + Platform Best Practices + Properties
- Consider parallel generation for multiple platforms
- Use streaming for real-time content display
- Auto-save to Content table on completion

**Dependencies**: US-04-001, US-04-002, US-04-003, US-04-004, US-02-011, US-01-004, US-01-006

**Edge Cases**:
- Handle very long input (summarize or chunk)
- Handle AI provider rate limiting (retry with backoff)
- Handle concurrent generation requests (queue)
- Show estimated cost before generation for inputs > 5,000 tokens: "This generation will use approximately X tokens (~$Y)"
- Warn if input exceeds 5,000 tokens: "Large input detected. Consider breaking into smaller sections for better results."
- Display token count in real-time as user types input

---

#### US-04-006: View AI Detection Score

**Priority**: P0 | **Points**: 5 | **Sprint**: 3

**User Story**:
```
As a content creator,
I want to see an AI detection score for my generated content,
So that I know if the content reads naturally or needs improvement.
```

**Acceptance Criteria**:

*Scenario 1: View detection score*
```
Given content has been generated
When I view the results
Then I see an AI detection score (0-100) for each platform version
And I see a score interpretation:
  - 85-100: "Excellent - reads naturally, low detection risk" (green)
  - 70-84: "Good - minor AI tells, consider light editing" (yellow)
  - 50-69: "Fair - noticeable AI patterns, recommend regeneration" (orange)
  - 0-49: "Poor - strong AI signals, do not use without major editing" (red)
```

*Scenario 2: View score details*
```
Given I see the AI detection score
When I click "See Details"
Then I see a breakdown of score components:
  - Sentence Variety: X/20
  - Vocabulary Diversity: X/15
  - Specificity Score: X/15
  - Transition Naturalness: X/10
  - Opening/Closing Quality: X/10
  - Punctuation Authenticity: X/10
  - Personality Presence: X/10
  - Structural Naturalness: X/10
```

*Scenario 3: View specific feedback*
```
Given I see the score breakdown
Then I see specific feedback for improvement:
  - "4 of 6 paragraphs start with 'The' - vary your openings"
  - "Consider removing 'Furthermore' - it's an AI tell"
```

*Rule-based Criteria*:
- [ ] Score calculated using custom heuristics (not external API)
- [ ] Score breakdown shows all 8 components
- [ ] Specific actionable feedback provided
- [ ] Score calculation completes within 5 seconds

**Technical Notes**:
- Implement in `services/detection.py`
- Use spaCy for NLP analysis
- Use textstat for readability metrics
- Algorithm per PRD section 4.4.5
- Score stored in Content record

**Dependencies**: US-04-005

**Edge Cases**:
- Handle very short content (adjust scoring weights)
- Handle non-English content (limited support, warn user)

---

#### US-04-007: Edit Generated Content

**Priority**: P0 | **Points**: 3 | **Sprint**: 4

**User Story**:
```
As a content creator,
I want to edit the generated content directly,
So that I can make quick adjustments without regenerating.
```

**Acceptance Criteria**:

*Scenario 1: Edit content*
```
Given content has been generated
When I click in the content area
Then the content becomes editable
And I can modify the text directly
```

*Scenario 2: Save edits*
```
Given I have edited the content
When I click outside the editor or press Cmd/Ctrl+S
Then my edits are saved
And the AI detection score is recalculated
And the content record is updated with my changes
```

*Scenario 3: Discard edits*
```
Given I have unsaved edits
When I click "Discard" or press Escape
Then my edits are discarded
And the content reverts to the previous version
```

*Rule-based Criteria*:
- [ ] Edits are autosaved after 2 seconds of inactivity
- [ ] Original content preserved in `original_content` field
- [ ] Edit history maintained within session
- [ ] Character/word count updates in real-time

**Technical Notes**:
- API Endpoint: `PATCH /api/content/{id}`
- Frontend: Use contenteditable or dedicated editor
- Recalculate AI detection score on save
- Store both `content` and `original_content`

**Dependencies**: US-04-005, US-04-006

**Edge Cases**:
- Handle concurrent edits across tabs
- Handle editing while regenerating (block or queue)

---

#### US-04-008: Regenerate Content

**Priority**: P0 | **Points**: 3 | **Sprint**: 4

**User Story**:
```
As a content creator,
I want to regenerate the content to get a different version,
So that I can try multiple variations.
```

**Acceptance Criteria**:

*Scenario 1: Full regeneration*
```
Given content has been generated
When I click "Regenerate"
Then new content is generated using the same configuration
And the new content replaces the old content
And the AI detection score is recalculated
And the old version is preserved in history
```

*Scenario 2: Regenerate specific platform*
```
Given I have generated content for multiple platforms
When I click "Regenerate" on a specific platform tab
Then only that platform's content is regenerated
And other platforms are unchanged
```

*Rule-based Criteria*:
- [ ] Regeneration uses same voice clone, input, and properties
- [ ] Previous version saved (up to 5 versions in session)
- [ ] Can regenerate individual platforms independently

**Technical Notes**:
- API Endpoint: `POST /api/content/{id}/regenerate`
- Store version history in memory during session
- Consider adding "seed" or variation parameter for diversity

**Dependencies**: US-04-005

**Edge Cases**:
- Handle regeneration timing out (keep previous version)

---

#### US-04-009: Regenerate with Feedback

**Priority**: P1 | **Points**: 5 | **Sprint**: 4

**User Story**:
```
As a content creator,
I want to provide feedback when regenerating,
So that I can guide the AI toward the content I want.
```

**Acceptance Criteria**:

*Scenario 1: Provide regeneration feedback*
```
Given content has been generated
When I click "Regenerate with Feedback"
Then I see a text input for feedback
When I enter feedback (e.g., "Make it shorter and add more humor")
And I click "Regenerate"
Then new content is generated incorporating my feedback
```

*Scenario 2: Quick feedback options*
```
Given I am regenerating with feedback
Then I see quick feedback buttons:
  - "Make it shorter"
  - "Make it longer"
  - "More professional"
  - "More casual"
  - "More humor"
  - "Less humor"
  - "Stronger CTA"
And I can select multiple and/or type custom feedback
```

*Rule-based Criteria*:
- [ ] Custom feedback max 500 characters
- [ ] Quick options can be combined
- [ ] Feedback is added to generation prompt
- [ ] Original input is preserved

**Technical Notes**:
- API Endpoint: `POST /api/content/{id}/regenerate`
- Request body includes: `{ feedback?: string, quick_feedback?: string[] }`
- Backend appends feedback to generation prompt

**Dependencies**: US-04-008

**Edge Cases**:
- Handle contradictory feedback (e.g., shorter + longer)

---

#### US-04-010: Improve Based on Detection Score

**Priority**: P1 | **Points**: 5 | **Sprint**: 4

**User Story**:
```
As a content creator,
I want to automatically improve content based on AI detection feedback,
So that I can increase the naturalness score without manual editing.
```

**Acceptance Criteria**:

*Scenario 1: One-click improvement*
```
Given content has a detection score below 85
When I click "Improve"
Then the system analyzes the specific issues
And regenerates content addressing those issues
And the new content has a higher detection score
```

*Scenario 2: Targeted improvement*
```
Given I view the detection score breakdown
When I see that "Sentence Variety" scored low
And I click "Fix this issue"
Then content is regenerated specifically addressing sentence variety
```

*Rule-based Criteria*:
- [ ] Improvement uses detection feedback as generation guidance
- [ ] Shows before/after comparison
- [ ] Explains what was changed
- [ ] Does not change the core message/content

**Technical Notes**:
- API Endpoint: `POST /api/content/{id}/improve`
- Backend creates improvement prompt from detection feedback
- Target specific issues in generation prompt

**Dependencies**: US-04-006

**Edge Cases**:
- Handle content that cannot be easily improved
- Prevent infinite improvement loops

---

#### US-04-011: Copy Content to Clipboard

**Priority**: P0 | **Points**: 2 | **Sprint**: 3

**User Story**:
```
As a content creator,
I want to copy generated content to my clipboard with one click,
So that I can quickly paste it into the target platform.
```

**Acceptance Criteria**:

*Scenario 1: Copy content*
```
Given content has been generated
When I click the "Copy" button
Then the content is copied to my clipboard
And I see a success notification "Content copied!"
```

*Scenario 2: Copy formatted for platform*
```
Given I copy content from the LinkedIn tab
Then the content is formatted appropriately for LinkedIn (with line breaks)
Given I copy from Twitter tab and it's a thread
Then individual tweets are separated clearly
```

*Rule-based Criteria*:
- [ ] Copy includes appropriate formatting for platform
- [ ] Copy works in all major browsers
- [ ] Visual feedback confirms copy success
- [ ] Keyboard shortcut: Cmd/Ctrl+C when content is focused

**Technical Notes**:
- Use Clipboard API
- Format content based on platform
- Handle fallback for older browsers

**Dependencies**: US-04-005

**Edge Cases**:
- Handle browser permission denied
- Handle very long content (may truncate on some platforms)

---

#### US-04-012: Save Content to Library

**Priority**: P0 | **Points**: 2 | **Sprint**: 4

**User Story**:
```
As a content creator,
I want to explicitly save generated content to my library with metadata,
So that I can organize and find it later.
```

**Acceptance Criteria**:

*Scenario 1: Auto-save*
```
Given content has been generated
Then it is automatically saved to the library with status "draft"
```

*Scenario 2: Update metadata*
```
Given content is saved in the library
When I click "Edit Details"
Then I can update: topic, campaign, tags, status
When I save
Then the content record is updated
```

*Scenario 3: Mark as ready*
```
Given I am happy with the content
When I click "Mark as Ready"
Then the status changes from "draft" to "ready"
```

*Rule-based Criteria*:
- [ ] All generated content auto-saves to library
- [ ] Topic and campaign are optional, max 255 characters
- [ ] Tags max 20, each max 50 characters
- [ ] Status options: draft, ready, published, archived

**Technical Notes**:
- Content auto-saves via US-04-005
- API Endpoint: `PATCH /api/content/{id}`
- Frontend: Create `ContentMetadataEditor` component

**Dependencies**: US-04-005

**Edge Cases**:
- Handle save failure (retry, show error)

---

#### US-04-013: Generate Multiple Variations (A/B)

**Priority**: P1 | **Points**: 5 | **Sprint**: 4

**User Story**:
```
As a content creator,
I want to generate 3 variations of my content at once,
So that I can compare and choose the best version.
```

**Acceptance Criteria**:

*Scenario 1: Enable multiple variations*
```
Given I am configuring content generation
When I see the "Generate" button
Then I see an option "Generate 3 variations"
When I enable this option
Then the button changes to "Generate 3 Variations"
```

*Scenario 2: View variations*
```
Given I have enabled multiple variations
When I click "Generate 3 Variations"
Then 3 different versions are generated
And I see them displayed in a comparison view (tabs or cards)
And each variation has its own AI detection score
```

*Scenario 3: Compare and select*
```
Given I have 3 variations displayed
Then I can:
  - View each variation in full
  - See AI detection score for each
  - Click "Use This One" to select a variation
When I select a variation
Then it becomes the primary content
And other variations are discarded (or kept as drafts if I choose)
```

*Scenario 4: Variations are different*
```
Given I generate 3 variations
Then each variation should be meaningfully different
And variations may have different:
  - Opening hooks
  - Sentence structures
  - Word choices
  - CTA approaches
```

*Rule-based Criteria*:
- [ ] Default is single generation; variations are opt-in
- [ ] Always generates exactly 3 variations (not configurable for V1)
- [ ] Each variation uses the same voice clone and properties
- [ ] Variations generated in parallel for speed
- [ ] Each variation saved as draft until one is selected
- [ ] Total generation time < 45 seconds for all 3

**Technical Notes**:
- API Endpoint: `POST /api/content/generate` with `variations: 3`
- Use different temperature or seed for each variation
- Generate in parallel using asyncio.gather()
- Frontend: Create `VariationComparison` component with tabs/cards
- Store all 3 as drafts; mark selected as "ready"

**Dependencies**: US-04-005

**Edge Cases**:
- Handle one variation failing while others succeed
- Handle user navigating away mid-generation
- Handle very similar variations (retry with more diversity)

---

#### US-04-014: Content Templates

**Priority**: P1 | **Points**: 5 | **Sprint**: 5

**User Story**:
```
As a content creator,
I want to save and reuse content generation configurations as templates,
So that I can quickly generate similar content without reconfiguring.
```

**Acceptance Criteria**:

*Scenario 1: Save as template*
```
Given I have configured content properties
When I click "Save as Template"
Then I see a dialog asking for template name
When I enter a name and click "Save"
Then the current configuration is saved as a template
And I see a success message
```

*Scenario 2: Load template*
```
Given I am creating content
When I click "Load Template" dropdown
Then I see a list of my saved templates
When I select a template
Then all content properties are populated from the template
And the input area remains empty (template doesn't save input)
```

*Scenario 3: Template includes*
```
Given I save a template
Then it saves:
  - Selected platforms
  - Length setting
  - Tone, formality, humor overrides
  - Target audience
  - CTA style
  - Include/exclude phrases
And it does NOT save:
  - Voice clone selection
  - Input content
```

*Scenario 4: Manage templates*
```
Given I have saved templates
When I click "Manage Templates" in settings or dropdown
Then I see a list of all my templates
And I can: rename, edit, delete, duplicate templates
```

*Scenario 5: Templates are global*
```
Given I have saved a template
When I select a different voice clone
Then the template is still available
Because templates are independent of voice clones
```

*Rule-based Criteria*:
- [ ] Templates are global (not tied to specific voice clone)
- [ ] Template names must be unique
- [ ] Maximum 50 templates per user
- [ ] Templates can be updated (overwrite existing)
- [ ] Default template can be set (auto-loads on page)

**Technical Notes**:
- Database: New `content_templates` table
  - id, user_id, name, properties (JSONB), is_default, created_at, updated_at
- API Endpoint: `GET /api/content-templates`
- API Endpoint: `POST /api/content-templates`
- API Endpoint: `PATCH /api/content-templates/{id}`
- API Endpoint: `DELETE /api/content-templates/{id}`
- Frontend: Create `TemplateSelector` and `TemplateManager` components

**Dependencies**: US-04-003

**Edge Cases**:
- Handle template with platforms that have been deleted
- Handle loading template with invalid/outdated settings
- Handle duplicate template names

---

### 4.5 Epic: Content Library (EP-05)

**Epic Description**: Store, organize, and manage all generated content.

---

#### US-05-001: View Content Library

**Priority**: P0 | **Points**: 5 | **Sprint**: 5

**User Story**:
```
As a content creator,
I want to view all my saved content in a searchable library,
So that I can find and reuse content I've created.
```

**Acceptance Criteria**:

*Scenario 1: View library list*
```
Given I have saved content
When I navigate to the Library page
Then I see a list/table of all content
And each item shows: content preview (first 100 chars), voice clone name, platform icon, detection score, status badge, date created
And content is sorted by date (newest first) by default
```

*Scenario 2: Empty library*
```
Given I have no saved content
When I navigate to the Library page
Then I see a friendly empty state
And a link to "Create Content"
```

*Scenario 3: Search content*
```
Given I have content in the library
When I type in the search box
Then the list filters to content containing the search term
And search looks at: content text, topic, campaign, tags
```

*Rule-based Criteria*:
- [ ] Page loads within 2 seconds for up to 1000 items
- [ ] Search is debounced (300ms delay)
- [ ] Supports pagination (50 items per page)
- [ ] Keyboard navigation supported

**Technical Notes**:
- API Endpoint: `GET /api/content`
- Query params: `?search=&page=&limit=&sort=&order=`
- Full-text search on content field
- Frontend: Create `ContentLibrary` and `ContentListItem` components

**Dependencies**: US-04-012

**Edge Cases**:
- Handle very long content (truncate preview)
- Handle deleted voice clones (show "Deleted Clone")

---

#### US-05-002: Filter Content Library

**Priority**: P0 | **Points**: 3 | **Sprint**: 5

**User Story**:
```
As a content creator,
I want to filter my content library by various criteria,
So that I can quickly find specific content.
```

**Acceptance Criteria**:

*Scenario 1: Filter by voice clone*
```
Given I have content from multiple voice clones
When I select a voice clone filter
Then I see only content created with that clone
```

*Scenario 2: Filter by platform*
```
Given I have content for multiple platforms
When I select platform filters (multi-select)
Then I see only content for those platforms
```

*Scenario 3: Filter by status*
```
Given I have content with different statuses
When I select a status filter
Then I see only content with that status (draft, ready, published, archived)
```

*Scenario 4: Filter by date range*
```
Given I want to see recent content
When I set a date range filter
Then I see only content created within that range
```

*Scenario 5: Filter by tags*
```
Given I have tagged content
When I select tag filters
Then I see only content with those tags
```

*Scenario 6: Combine filters*
```
Given I apply multiple filters
Then all filters are applied (AND logic)
And I see the active filter count
```

*Rule-based Criteria*:
- [ ] Filter UI is collapsible
- [ ] Active filters shown as chips
- [ ] Clear all filters option
- [ ] Filters persist in URL params (shareable/bookmarkable)

**Technical Notes**:
- API Endpoint: `GET /api/content` with filter params
- `?voice_clone_id=&platform=&status=&date_from=&date_to=&tags=`
- Frontend: Create `ContentFilters` component
- Use URL search params for state

**Dependencies**: US-05-001

**Edge Cases**:
- Handle filter combination returning no results

---

#### US-05-003: View Content Details

**Priority**: P0 | **Points**: 3 | **Sprint**: 5

**User Story**:
```
As a content creator,
I want to view the full details of saved content,
So that I can review and use it.
```

**Acceptance Criteria**:

*Scenario 1: View content detail*
```
Given I click on a content item in the library
Then I see a detail view/modal with:
  - Full content text
  - Voice clone used (with link)
  - Platform
  - AI detection score with breakdown
  - Original input used
  - Properties used at generation
  - Created date, updated date
  - Topic, campaign, tags
  - Status
```

*Scenario 2: Quick actions*
```
Given I am viewing content details
Then I see action buttons:
  - Copy
  - Edit
  - Regenerate (returns to creator)
  - Delete
  - Change Status
```

*Rule-based Criteria*:
- [ ] Modal or slide-over panel for quick viewing
- [ ] Full-page option for detailed work
- [ ] Keyboard shortcut to close (Escape)

**Technical Notes**:
- API Endpoint: `GET /api/content/{id}`
- Frontend: Create `ContentDetail` component
- Reuse components from content creator

**Dependencies**: US-05-001

**Edge Cases**:
- Handle deleted voice clone reference

---

#### US-05-004: Edit Content in Library

**Priority**: P0 | **Points**: 2 | **Sprint**: 5

**User Story**:
```
As a content creator,
I want to edit content stored in my library,
So that I can refine it before publishing.
```

**Acceptance Criteria**:

*Scenario 1: Edit content text*
```
Given I am viewing content details
When I click "Edit"
Then the content becomes editable
When I make changes and save
Then the content is updated
And the AI detection score is recalculated
```

*Scenario 2: Edit metadata*
```
Given I am viewing content details
When I edit topic, campaign, or tags
Then the changes are saved
```

*Rule-based Criteria*:
- [ ] Original content preserved in original_content field
- [ ] updated_at timestamp updates
- [ ] Detection score recalculates on text changes

**Technical Notes**:
- API Endpoint: `PATCH /api/content/{id}`
- Reuse editing components from content creator

**Dependencies**: US-05-003

**Edge Cases**:
- Handle concurrent edits

---

#### US-05-005: Delete Content

**Priority**: P0 | **Points**: 2 | **Sprint**: 5

**User Story**:
```
As a content creator,
I want to delete content from my library,
So that I can remove content I no longer need.
```

**Acceptance Criteria**:

*Scenario 1: Delete single item*
```
Given I am viewing content details
When I click "Delete"
Then I see a confirmation dialog
When I confirm
Then the content is permanently deleted
And I see a success notification
```

*Scenario 2: Cancel deletion*
```
Given I see the delete confirmation
When I click "Cancel"
Then the content is not deleted
```

*Rule-based Criteria*:
- [ ] Deletion is permanent (no soft delete)
- [ ] Confirmation required
- [ ] Can undo within 10 seconds (toast notification)

**Technical Notes**:
- API Endpoint: `DELETE /api/content/{id}`
- Implement undo with delayed actual deletion

**Dependencies**: US-05-003

**Edge Cases**:
- Handle deletion during undo period

---

#### US-05-006: Bulk Actions on Content

**Priority**: P1 | **Points**: 5 | **Sprint**: 6

**User Story**:
```
As a content creator,
I want to perform actions on multiple content items at once,
So that I can manage my library efficiently.
```

**Acceptance Criteria**:

*Scenario 1: Bulk select*
```
Given I am viewing the content library
When I click checkboxes on multiple items
Then I see a bulk action bar appear
And I see the count of selected items
```

*Scenario 2: Bulk status change*
```
Given I have selected multiple items
When I click "Change Status" and select "Published"
Then all selected items are updated to "Published"
```

*Scenario 3: Bulk delete*
```
Given I have selected multiple items
When I click "Delete"
Then I see a confirmation dialog with count
When I confirm
Then all selected items are deleted
```

*Scenario 4: Bulk tag add*
```
Given I have selected multiple items
When I click "Add Tag" and enter a tag
Then the tag is added to all selected items
```

*Rule-based Criteria*:
- [ ] Select all on current page option
- [ ] Clear selection option
- [ ] Bulk operations are atomic (all succeed or all fail)
- [ ] Progress indication for large selections

**Technical Notes**:
- API Endpoint: `POST /api/content/bulk`
- Request body: `{ ids: string[], action: string, data: any }`
- Frontend: Track selection in Zustand store

**Dependencies**: US-05-001

**Edge Cases**:
- Handle partial failure (report which items failed)
- Handle selecting items across pages

---

#### US-05-007: Archive Content

**Priority**: P1 | **Points**: 2 | **Sprint**: 5

**User Story**:
```
As a content creator,
I want to archive content instead of deleting it,
So that I can hide old content while keeping it accessible.
```

**Acceptance Criteria**:

*Scenario 1: Archive content*
```
Given I am viewing content details
When I click "Archive"
Then the content status changes to "archived"
And it is hidden from the default library view
```

*Scenario 2: View archived content*
```
Given I have archived content
When I filter by status "archived"
Then I see all archived content
```

*Scenario 3: Unarchive content*
```
Given I am viewing archived content
When I click "Unarchive"
Then the content status changes to "draft"
And it appears in the default library view
```

*Rule-based Criteria*:
- [ ] Archived content not shown by default
- [ ] Archive is reversible
- [ ] Archived content counts shown separately

**Technical Notes**:
- Status change via `PATCH /api/content/{id}`
- Default filter excludes archived

**Dependencies**: US-05-003

**Edge Cases**:
- Handle archiving content that's marked as published

---

#### US-05-008: Duplicate Content

**Priority**: P1 | **Points**: 2 | **Sprint**: 5

**User Story**:
```
As a content creator,
I want to duplicate existing content,
So that I can create variations based on previous work.
```

**Acceptance Criteria**:

*Scenario 1: Duplicate content*
```
Given I am viewing content details
When I click "Duplicate"
Then a new content item is created with the same text
And the new item has status "draft"
And the new item has title/topic appended with "(Copy)"
And I am taken to the new item's detail view
```

*Rule-based Criteria*:
- [ ] Duplicate copies: content, voice_clone_id, platform, properties_used
- [ ] Duplicate does NOT copy: original_content, ai_detection_score, tags
- [ ] Duplicate has new ID and timestamps

**Technical Notes**:
- API Endpoint: `POST /api/content/{id}/duplicate`
- Create new record with copied fields

**Dependencies**: US-05-003

**Edge Cases**:
- Handle duplicating when voice clone no longer exists

---

### 4.6 Epic: Platform Output Manager (EP-06)

**Epic Description**: Format and prepare content for each platform.

---

#### US-06-001: View Platform-Specific Preview

**Priority**: P0 | **Points**: 5 | **Sprint**: 4

**User Story**:
```
As a content creator,
I want to see how my content will appear on each platform,
So that I can ensure it's properly formatted before copying.
```

**Acceptance Criteria**:

*Scenario 1: View LinkedIn preview*
```
Given I have generated LinkedIn content
When I view the preview
Then I see the content formatted as it would appear on LinkedIn
And I see line breaks and spacing preserved
And I see character count (X/3000)
```

*Scenario 2: View Twitter preview*
```
Given I have generated Twitter content
When the content is a thread (exceeds 280 chars)
Then I see each tweet separated
And each tweet shows its character count (X/280)
And tweets are numbered
```

*Scenario 3: Character limit warning*
```
Given content exceeds the platform limit
When I view the preview
Then I see a warning with the overage amount
And the excess characters are highlighted
```

*Rule-based Criteria*:
- [ ] Preview matches platform constraints per PRD 4.6.1
- [ ] Character counts are accurate (including emoji as 2 chars for Twitter)
- [ ] Visual styling approximates platform appearance

**Technical Notes**:
- Frontend: Create `PlatformPreview` component for each platform
- Platform constraints from PRD section 4.6.1
- Consider using platform's actual font/colors for realism

**Dependencies**: US-04-005

**Edge Cases**:
- Handle content with special characters affecting count
- Handle emoji character counting (varies by platform)

---

#### US-06-002: Format Twitter Threads

**Priority**: P0 | **Points**: 5 | **Sprint**: 4

**User Story**:
```
As a content creator,
I want my long Twitter content automatically formatted as threads,
So that I can post multi-tweet content easily.
```

**Acceptance Criteria**:

*Scenario 1: Auto-thread detection*
```
Given I generate Twitter content
When the content exceeds 280 characters
Then the system automatically formats it as a thread
And breaks are made at sentence boundaries
And each tweet is under 280 characters
```

*Scenario 2: Thread numbering*
```
Given content is formatted as a thread
Then I see tweet numbers (1/5, 2/5, etc.)
And I can toggle numbering on/off
```

*Scenario 3: Edit thread tweets*
```
Given I have a thread
When I edit an individual tweet
Then the edit only affects that tweet
And character count updates accordingly
```

*Scenario 4: Reorder thread tweets*
```
Given I have a thread
When I drag to reorder tweets
Then the thread order changes
And numbers update accordingly
```

*Rule-based Criteria*:
- [ ] Threads break at natural sentence/paragraph boundaries
- [ ] No tweet exceeds 280 characters
- [ ] First tweet can stand alone (hooks into thread)
- [ ] 5-15 tweets recommended, warn if more

**Technical Notes**:
- Thread formatting done server-side during generation
- Frontend: Create `TwitterThreadEditor` component
- Implement drag-and-drop reordering

**Dependencies**: US-04-005

**Edge Cases**:
- Handle content that can't be broken naturally
- Handle edits that push tweet over limit

---

#### US-06-003: Copy with Platform Formatting

**Priority**: P0 | **Points**: 3 | **Sprint**: 4

**User Story**:
```
As a content creator,
I want the copy function to preserve platform-specific formatting,
So that content pastes correctly into each platform.
```

**Acceptance Criteria**:

*Scenario 1: Copy LinkedIn content*
```
Given I copy LinkedIn content
Then line breaks are preserved
And any bullet points are preserved
```

*Scenario 2: Copy Twitter thread*
```
Given I copy a Twitter thread
Then I can choose to copy:
  - Single tweet
  - All tweets (separated by blank lines)
  - All tweets with numbers
```

*Scenario 3: Copy blog content*
```
Given I copy blog content
Then markdown formatting is preserved
Or I can copy as plain text (stripped)
```

*Rule-based Criteria*:
- [ ] Copy format matches platform requirements
- [ ] Option to copy plain text without formatting
- [ ] Visual feedback on successful copy

**Technical Notes**:
- Clipboard API with formatted text
- Frontend: Create `CopyOptions` dropdown

**Dependencies**: US-04-011

**Edge Cases**:
- Handle special characters in copy
- Handle copy in different browsers

---

#### US-06-004: Export Content as File

**Priority**: P1 | **Points**: 3 | **Sprint**: 5

**User Story**:
```
As a content creator,
I want to export my content as a file,
So that I can share it or archive it outside the application.
```

**Acceptance Criteria**:

*Scenario 1: Export as plain text*
```
Given I am viewing content
When I click "Export" and select "Plain Text"
Then a .txt file downloads with the content
```

*Scenario 2: Export as PDF*
```
Given I am viewing content
When I click "Export" and select "PDF"
Then a formatted PDF downloads
And the PDF includes: content, voice clone name, platform, date
```

*Scenario 3: Export from library*
```
Given I am in the content library
When I select multiple items
And I click "Export"
Then a single file downloads with all selected content
```

*Rule-based Criteria*:
- [ ] Export includes metadata (voice clone, platform, date)
- [ ] PDF is well-formatted and readable
- [ ] Bulk export creates organized document

**Technical Notes**:
- API Endpoint: `GET /api/content/{id}/export?format=txt|pdf`
- API Endpoint: `POST /api/content/export` for bulk
- Use a PDF library (e.g., reportlab on backend)

**Dependencies**: US-05-003

**Edge Cases**:
- Handle very large bulk exports (limit or async)

---

#### US-06-005: View Platform Character Limits

**Priority**: P1 | **Points**: 2 | **Sprint**: 4

**User Story**:
```
As a content creator,
I want to see character limits for each platform while creating content,
So that I can adjust my input accordingly.
```

**Acceptance Criteria**:

*Scenario 1: Show limits during creation*
```
Given I am creating content
When I select platforms
Then I see the character limit for each platform displayed
And the limit updates the generation target
```

*Scenario 2: Limit reference*
```
Given I hover over a platform's character indicator
Then I see a tooltip with the platform's limits:
  - Twitter: 280 chars per tweet
  - LinkedIn: 3,000 chars
  - Instagram: 2,200 chars
  - etc.
```

*Rule-based Criteria*:
- [ ] Limits per PRD section 4.6.1
- [ ] Limits shown during and after generation
- [ ] Warnings shown when approaching/exceeding limits

**Technical Notes**:
- Platform limits stored in configuration
- Frontend: Display limits in platform selector and preview

**Dependencies**: US-04-004

**Edge Cases**:
- Handle custom platforms with no set limits

---

### 4.7 Epic: System & Infrastructure (EP-07)

**Epic Description**: Authentication, settings, and system features.

---

#### US-07-001: Application Navigation

**Priority**: P0 | **Points**: 3 | **Sprint**: 1

**User Story**:
```
As a user,
I want to navigate easily between different sections of the application,
So that I can access all features efficiently.
```

**Acceptance Criteria**:

*Scenario 1: Main navigation*
```
Given I am using the application
Then I see a navigation bar with links to:
  - Voice Clones
  - Create Content
  - Library
  - Settings
And the current section is highlighted
```

*Scenario 2: Responsive navigation*
```
Given I am on a smaller screen
Then the navigation collapses to a hamburger menu
And all links are accessible from the menu
```

*Scenario 3: Breadcrumbs*
```
Given I am in a nested view (e.g., Voice Clone > Edit)
Then I see breadcrumbs showing my location
And I can click breadcrumbs to navigate back
```

*Rule-based Criteria*:
- [ ] Navigation is consistent across all pages
- [ ] Current location is always clear
- [ ] Keyboard navigation supported (Tab, Enter)
- [ ] Quick keyboard shortcuts for main sections

**Technical Notes**:
- Frontend: Create `Navigation` component
- Use Next.js App Router for routing
- Implement breadcrumbs based on route path

**Dependencies**: None (foundational)

**Edge Cases**:
- Handle deep linking to specific content

---

#### US-07-002: Settings Dashboard

**Priority**: P0 | **Points**: 3 | **Sprint**: 2

**User Story**:
```
As a user,
I want a central settings page to manage all configuration,
So that I can control how the application behaves.
```

**Acceptance Criteria**:

*Scenario 1: View settings dashboard*
```
Given I navigate to Settings
Then I see a tabbed interface with:
  - Voice Cloning Instructions
  - Anti-AI Guidelines
  - Platform Best Practices
```

*Scenario 2: Tab navigation*
```
Given I am on the Settings page
When I click a tab
Then the content changes to that settings section
And the URL updates to reflect the tab
```

*Rule-based Criteria*:
- [ ] Tabs are accessible (keyboard navigable)
- [ ] Tab state persists in URL
- [ ] Each tab loads independently

**Technical Notes**:
- Frontend: Create `SettingsPage` with tab navigation
- Use URL params for tab state
- Lazy load tab content for performance

**Dependencies**: None

**Edge Cases**:
- Handle direct link to specific settings tab

---

#### US-07-003: Error Handling and Notifications

**Priority**: P0 | **Points**: 3 | **Sprint**: 2

**User Story**:
```
As a user,
I want to see clear feedback when actions succeed or fail,
So that I know the status of my operations.
```

**Acceptance Criteria**:

*Scenario 1: Success notification*
```
Given I complete an action successfully
Then I see a toast notification with a success message
And the notification auto-dismisses after 5 seconds
And I can manually dismiss it earlier
```

*Scenario 2: Error notification*
```
Given an action fails
Then I see a toast notification with an error message
And the message explains what went wrong
And the notification persists until dismissed
And I have an option to retry if applicable
```

*Scenario 3: Loading states*
```
Given an action is in progress
Then I see a loading indicator
And relevant buttons are disabled
And I can see progress when available
```

*Rule-based Criteria*:
- [ ] Notifications don't stack excessively (max 3 visible)
- [ ] Error messages are user-friendly (not technical jargon)
- [ ] Loading states are consistent across the app
- [ ] Screen readers announce notifications

**Technical Notes**:
- Frontend: Implement toast notification system
- Use Zustand for notification state
- Consistent loading spinner component

**Dependencies**: None

**Edge Cases**:
- Handle multiple rapid notifications
- Handle errors during other errors

---

#### US-07-004: API Error Responses

**Priority**: P0 | **Points**: 3 | **Sprint**: 1

**User Story**:
```
As a developer (AI or human),
I want consistent and informative API error responses,
So that I can handle errors appropriately in the frontend.
```

**Acceptance Criteria**:

*Scenario 1: Validation error*
```
Given I submit invalid data to an API endpoint
Then I receive a 422 response
And the response body includes:
  - error: "Validation Error"
  - details: [{ field: "name", message: "Name is required" }]
```

*Scenario 2: Not found error*
```
Given I request a resource that doesn't exist
Then I receive a 404 response
And the response body includes:
  - error: "Not Found"
  - message: "Voice clone with ID xxx not found"
```

*Scenario 3: Server error*
```
Given an unexpected error occurs
Then I receive a 500 response
And the response body includes:
  - error: "Internal Server Error"
  - message: "An unexpected error occurred"
  - request_id: "xxx" (for debugging)
```

*Rule-based Criteria*:
- [ ] All errors follow consistent format
- [ ] Error codes are appropriate HTTP status codes
- [ ] Validation errors list all issues (not just first)
- [ ] Sensitive information is never exposed in errors

**Technical Notes**:
- FastAPI exception handlers
- Pydantic validation error formatting
- Request ID middleware for tracing

**Dependencies**: None

**Edge Cases**:
- Handle database connection errors
- Handle AI provider errors

---

#### US-07-005: Database Migrations

**Priority**: P0 | **Points**: 3 | **Sprint**: 1

**User Story**:
```
As a developer (AI or human),
I want database migrations to be managed systematically,
So that schema changes are tracked and reversible.
```

**Acceptance Criteria**:

*Scenario 1: Create migration*
```
Given I make changes to SQLAlchemy models
When I run the migration generation command
Then a new migration file is created
And it includes the schema changes
```

*Scenario 2: Apply migrations*
```
Given there are pending migrations
When I run the migrate command
Then all pending migrations are applied
And the database schema is updated
```

*Scenario 3: Rollback migration*
```
Given I need to undo a migration
When I run the rollback command
Then the last migration is reversed
And the database schema returns to previous state
```

*Rule-based Criteria*:
- [ ] Migrations are version controlled
- [ ] Migrations can be applied automatically on deploy
- [ ] Migration files are human-readable
- [ ] Rollback is possible for any migration

**Technical Notes**:
- Alembic for migrations
- `alembic revision --autogenerate` for generation
- `alembic upgrade head` for applying
- `alembic downgrade -1` for rollback

**Dependencies**: None

**Edge Cases**:
- Handle failed migrations (transaction rollback)
- Handle divergent migration histories

---

#### US-07-006: Health Check Endpoint

**Priority**: P0 | **Points**: 1 | **Sprint**: 1

**User Story**:
```
As a system administrator,
I want a health check endpoint,
So that I can monitor if the application is running correctly.
```

**Acceptance Criteria**:

*Scenario 1: Basic health check*
```
Given the application is running
When I make a GET request to /health
Then I receive a 200 response
And the response includes:
  - status: "healthy"
  - timestamp: current time
```

*Scenario 2: Database check*
```
Given the database connection is working
When I make a GET request to /health?detailed=true
Then I receive a response including:
  - database: "connected"
```

*Scenario 3: Unhealthy state*
```
Given the database connection fails
When I make a GET request to /health?detailed=true
Then I receive a 503 response
And the response includes:
  - status: "unhealthy"
  - database: "disconnected"
```

*Rule-based Criteria*:
- [ ] Basic health check is fast (<100ms)
- [ ] Detailed check tests actual dependencies
- [ ] Endpoint is unauthenticated (for load balancers)

**Technical Notes**:
- API Endpoint: `GET /health`
- Test database connection on detailed check
- Don't expose sensitive information

**Dependencies**: None

**Edge Cases**:
- Handle partial health (some services up, some down)

---

#### US-07-007: OAuth Authentication

**Priority**: P0 | **Points**: 5 | **Sprint**: 1

**User Story**:
```
As a user,
I want to sign in with Google or GitHub,
So that I can securely access my voice clones without managing another password.
```

**Acceptance Criteria**:

*Scenario 1: Unauthenticated access*
```
Given I visit the application without being authenticated
When I try to access any protected page
Then I am redirected to the login page
And I see "Sign in with Google" and "Sign in with GitHub" buttons
```

*Scenario 2: OAuth sign in*
```
Given I am on the login page
When I click "Sign in with Google" or "Sign in with GitHub"
Then I am redirected to the OAuth provider
When I complete authentication
Then I am redirected back to the application
And I see my name/avatar in the navigation
And I am taken to my originally requested page (or dashboard)
```

*Scenario 3: Sign out*
```
Given I am authenticated
When I click "Sign out"
Then my session is ended
And I am redirected to the login page
```

*Scenario 4: Session persistence*
```
Given I have signed in
When I close and reopen the browser
Then I remain signed in (session persists)
Until my session expires (30 days)
```

*Rule-based Criteria*:
- [ ] Support Google OAuth 2.0 provider
- [ ] Support GitHub OAuth provider
- [ ] Sessions stored in database (not just cookies)
- [ ] All API routes except /health and /auth/* are protected
- [ ] CSRF protection enabled
- [ ] Session expires after 30 days of inactivity

**Technical Notes**:
- Use Auth.js (NextAuth.js) for OAuth implementation
- Configure Google and GitHub OAuth apps
- Store sessions in PostgreSQL via Auth.js adapter
- Middleware to protect API routes
- Frontend: Create `AuthProvider` context and `LoginPage` component

**Dependencies**: None (foundational for deployed application)

**Edge Cases**:
- Handle OAuth provider errors gracefully
- Handle user revoking OAuth access
- Handle email conflicts (same email from different providers)

---

#### US-07-008: Configure AI Provider Settings

**Priority**: P0 | **Points**: 5 | **Sprint**: 1

**User Story**:
```
As a content creator,
I want to configure my AI provider and API key,
So that I can use my preferred AI service for voice analysis and generation.
```

**Acceptance Criteria**:

*Scenario 1: View AI provider settings*
```
Given I navigate to Settings
When I click the "AI Provider" tab
Then I see options for OpenAI and Anthropic
And I see the current configuration status
```

*Scenario 2: Configure API key*
```
Given I am on the AI Provider settings
When I select a provider (OpenAI or Anthropic)
And I enter my API key
And I click "Validate & Save"
Then the key is validated against the provider API
And if valid, the key is encrypted and saved
And I see a success message "API key saved successfully"
```

*Scenario 3: Invalid API key*
```
Given I enter an invalid API key
When I click "Validate & Save"
Then I see an error message explaining why validation failed
And the key is not saved
```

*Scenario 4: Environment variable takes precedence*
```
Given an API key is set via environment variable
When I view the AI Provider settings
Then I see "Using environment variable" displayed
And the key input is disabled with a note explaining this
```

*Scenario 5: Separate provider preferences*
```
Given I have both OpenAI and Anthropic keys configured
When I configure provider preferences
Then I can select which provider to use for:
  - Voice DNA Analysis (default: OpenAI)
  - Content Generation (default: OpenAI)
```

*Rule-based Criteria*:
- [ ] API keys are encrypted at rest in database
- [ ] API keys are never exposed to frontend after saving (masked display)
- [ ] Environment variables take precedence over database values
- [ ] Validation makes actual API call to verify key works
- [ ] Support both OpenAI and Anthropic providers
- [ ] Clear error messages for validation failures

**Technical Notes**:
- API Endpoint: `GET /api/settings/ai-provider`
- API Endpoint: `PUT /api/settings/ai-provider`
- Database: `user_api_keys` table with encrypted `api_key` field
- Use Fernet encryption for API keys at rest
- Validate by making minimal API call (e.g., list models)
- Frontend: Create `AIProviderSettings` component

**Dependencies**: US-07-007 (requires authentication)

**Edge Cases**:
- Handle key validation timeout
- Handle provider API outages during validation
- Handle rotation of encryption keys
- Handle concurrent key updates

---

#### US-07-009: View AI Usage and Costs

**Priority**: P1 | **Points**: 5 | **Sprint**: 2

**User Story**:
```
As a content creator,
I want to see my AI API usage and estimated costs,
So that I can monitor spending and stay within budget.
```

**Acceptance Criteria**:

*Scenario 1: View usage summary*
```
Given I navigate to Settings
When I click the "Usage" tab
Then I see a usage summary showing:
  - Total tokens used this month
  - Estimated cost this month
  - Usage breakdown by operation (analysis vs generation)
  - Daily usage chart for the month
```

*Scenario 2: View usage by provider*
```
Given I have used multiple AI providers
When I view the usage page
Then I see usage and costs broken down by provider
And each provider shows its own token count and cost estimate
```

*Scenario 3: Set usage warning threshold*
```
Given I am on the usage page
When I set a monthly cost warning threshold (e.g., $10)
And I click "Save"
Then the threshold is saved
And I see a warning notification when approaching the limit (80%)
And I see a critical warning when exceeding the limit
```

*Scenario 4: View usage history*
```
Given I want to see historical usage
When I select a previous month
Then I see the usage summary for that month
And I can compare to current month
```

*Rule-based Criteria*:
- [ ] Track tokens per API call (input and output)
- [ ] Calculate costs using current published pricing per provider
- [ ] Usage resets on the 1st of each month
- [ ] Historical data retained for 12 months
- [ ] Warning thresholds are optional
- [ ] Cost estimates are clearly labeled as estimates

**Technical Notes**:
- Database: `api_usage_logs` table tracking each API call
- Store: timestamp, provider, operation, input_tokens, output_tokens, model
- Calculate cost using pricing table (updated periodically)
- API Endpoint: `GET /api/settings/usage?month=YYYY-MM`
- API Endpoint: `PUT /api/settings/usage/threshold`
- Frontend: Create `UsageTracker` component with charts

**Dependencies**: US-07-008

**Edge Cases**:
- Handle pricing changes mid-month
- Handle failed API calls (still track attempted usage)
- Handle usage from merged/deleted voice clones

---

#### US-07-010: Export Voice Clone Data

**Priority**: P1 | **Points**: 3 | **Sprint**: 5

**User Story**:
```
As a content creator,
I want to export my voice clone data including samples and DNA,
So that I can back it up or transfer to another instance.
```

**Acceptance Criteria**:

*Scenario 1: Export single voice clone*
```
Given I am viewing a voice clone's detail page
When I click "Export"
Then a JSON file downloads
And the file contains: metadata, all writing samples, current Voice DNA, settings used
And the filename is "voice-clone-{name}-{date}.json"
```

*Scenario 2: Bulk export all clones*
```
Given I am on the Voice Clones list page
When I click "Export All"
Then a single JSON file downloads containing all my voice clones
And each clone includes its full data as in single export
```

*Scenario 3: Export file structure*
```
Given I have exported a voice clone
Then the JSON file is human-readable with proper formatting
And it includes:
  - export_version: "1.0"
  - exported_at: timestamp
  - voice_clone: { full voice clone data }
  - samples: [ array of all samples with content ]
  - voice_dna: { current Voice DNA }
  - settings_snapshot: { methodology settings at export time }
```

*Rule-based Criteria*:
- [ ] Export includes all data needed to recreate the clone
- [ ] Export is human-readable JSON with pretty printing
- [ ] Include version number for future import compatibility
- [ ] Samples include full content text
- [ ] Exclude sensitive data (user IDs, internal IDs become UUIDs)

**Technical Notes**:
- API Endpoint: `GET /api/voice-clones/{id}/export`
- API Endpoint: `GET /api/voice-clones/export` (bulk)
- Return JSON with `Content-Disposition: attachment` header
- Include schema version for future compatibility
- Consider import functionality for V2

**Dependencies**: US-02-003

**Edge Cases**:
- Handle very large exports (many samples)
- Handle export of merged clones (include merge config)
- Handle voice clone with no DNA yet

---

#### US-07-011: First-Run Onboarding

**Priority**: P2 | **Points**: 3 | **Sprint**: 6

**User Story**:
```
As a new user,
I want a guided introduction when I first use the app,
So that I understand how to create my first voice clone.
```

**Acceptance Criteria**:

*Scenario 1: First-time user sees onboarding*
```
Given I sign in for the first time
When I am redirected to the dashboard
Then I see an onboarding modal/wizard
And the wizard has steps explaining the key features
```

*Scenario 2: Onboarding flow*
```
Given I am viewing the onboarding wizard
Then I see steps explaining:
  1. Create a Voice Clone - capture your unique writing style
  2. Add Writing Samples - the more, the better
  3. Analyze Your Voice - generate your Voice DNA
  4. Generate Content - create content in your voice
And each step has a brief description and visual
And I can navigate between steps with Previous/Next
```

*Scenario 3: Dismiss onboarding*
```
Given I am viewing the onboarding wizard
When I click "Skip" or "Get Started"
Then the wizard closes
And I am taken to the dashboard
And the wizard doesn't show again on future logins
```

*Scenario 4: Re-access onboarding*
```
Given I have completed/dismissed onboarding
When I click "Help" in the navigation
Then I see an option "View Getting Started Guide"
When I click it
Then the onboarding wizard opens again
```

*Rule-based Criteria*:
- [ ] Track `onboarding_completed` flag in user profile
- [ ] Onboarding only shows once automatically
- [ ] Can be re-accessed from Help menu
- [ ] Mobile-friendly design
- [ ] Accessible (keyboard navigable, screen reader compatible)

**Technical Notes**:
- Database: Add `onboarding_completed` boolean to user table
- Frontend: Create `OnboardingWizard` component
- Use modal with step indicators
- Store completion via `PATCH /api/user/profile`
- Link "Get Started" to Create Voice Clone page

**Dependencies**: US-07-007, US-07-001

**Edge Cases**:
- Handle user clearing browser data (check server-side flag)
- Handle onboarding interruption (resume or restart)

---

## 5. Story Dependencies Diagram

```
EP-01: Methodology Settings
  US-01-001 → US-01-002 → US-01-003
  US-01-004 → US-01-005
  US-01-006 (independent)

EP-02: Voice Clone Generator
  US-02-001 → US-02-002 → US-02-003 → US-02-004, US-02-005
                                    ↓
  US-02-006, US-02-007, US-02-008 → US-02-009 → US-02-010
                                              ↓
  US-01-001 ────────────────────────────────→ US-02-011 → US-02-012 → US-02-013, US-02-014
                                                        ↓
  US-02-012, US-02-003 ──────────────────────────────→ US-02-016 (Compare Clones)

EP-03: Voice Clone Merger
  US-02-011 → US-03-001 → US-03-002 → US-03-003 → US-03-004, US-03-005

EP-04: Content Creator
  US-02-011, US-01-004, US-01-006 → US-04-001 → US-04-002 → US-04-003 → US-04-004 → US-04-005
                                                          ↓                         ↓
                                                US-04-003 → US-04-014 (Templates)   US-04-013 (A/B Variations)
  US-04-006 ← US-04-005 → US-04-007, US-04-008 → US-04-009
  US-04-010 ← US-04-006
  US-04-011, US-04-012 ← US-04-005

EP-05: Content Library
  US-04-012 → US-05-001 → US-05-002, US-05-003 → US-05-004, US-05-005, US-05-007, US-05-008
                                               → US-05-006

EP-06: Platform Output
  US-04-005 → US-06-001, US-06-002
  US-04-011 → US-06-003
  US-05-003 → US-06-004
  US-04-004 → US-06-005

EP-07: System & Infrastructure
  US-07-001, US-07-004, US-07-005, US-07-006 (foundational)
  US-07-007 (OAuth) → US-07-008 (AI Provider) → US-07-009 (Usage Tracking)
  US-02-003 → US-07-010 (Export Voice Clone)
  US-07-007, US-07-001 → US-07-011 (Onboarding)
```

---

## 6. Sprint Planning Recommendation

### Sprint 1: Foundation
- US-07-001: Application Navigation
- US-07-004: API Error Responses
- US-07-005: Database Migrations
- US-07-006: Health Check Endpoint
- US-07-007: OAuth Authentication *(NEW)*
- US-07-008: Configure AI Provider Settings *(NEW)*
- US-02-001: View Voice Clone List
- US-02-002: Create New Voice Clone
- US-02-003: View Voice Clone Details
- US-02-004: Edit Voice Clone Metadata
- US-02-005: Delete Voice Clone
- US-01-001: View Voice Cloning Instructions
- US-01-002: Edit Voice Cloning Instructions
- US-01-004: View Anti-AI Guidelines
- US-01-005: Edit Anti-AI Guidelines

### Sprint 2: Sample Management & Settings
- US-07-002: Settings Dashboard
- US-07-003: Error Handling and Notifications
- US-07-009: View AI Usage and Costs *(NEW)*
- US-01-003: View and Revert Instruction History
- US-01-006: Manage Platform Best Practices
- US-02-006: Add Writing Sample via Paste
- US-02-007: Add Writing Sample via File Upload
- US-02-008: Add Writing Sample via URL
- US-02-009: View and Manage Writing Samples
- US-02-010: Calculate Confidence Score

### Sprint 3: Voice DNA & Content Creation
- US-02-011: Trigger Voice DNA Analysis
- US-02-012: View Voice DNA
- US-04-001: Select Voice Clone for Content Creation
- US-04-002: Enter Content Input
- US-04-003: Configure Content Properties
- US-04-004: Select Target Platforms
- US-04-005: Generate Content
- US-04-006: View AI Detection Score
- US-04-011: Copy Content to Clipboard

### Sprint 4: Content Refinement & Merging
- US-02-013: Edit Voice DNA Manually
- US-02-014: View and Revert DNA History
- US-02-016: Compare Voice Clones Side-by-Side *(NEW)*
- US-03-001: Select Clones to Merge
- US-03-002: Configure Element Weights
- US-03-003: Create Merged Voice Clone
- US-04-007: Edit Generated Content
- US-04-008: Regenerate Content
- US-04-009: Regenerate with Feedback
- US-04-010: Improve Based on Detection Score
- US-04-013: Generate Multiple Variations A/B *(NEW)*
- US-06-001: View Platform-Specific Preview
- US-06-002: Format Twitter Threads
- US-06-003: Copy with Platform Formatting
- US-06-005: View Platform Character Limits
- US-04-012: Save Content to Library

### Sprint 5: Library & Polish
- US-03-004: View Merged Clone Sources
- US-03-005: Regenerate Merged DNA
- US-02-015: Upload Voice Clone Avatar
- US-04-014: Content Templates *(NEW)*
- US-07-010: Export Voice Clone Data *(NEW)*
- US-05-001: View Content Library
- US-05-002: Filter Content Library
- US-05-003: View Content Details
- US-05-004: Edit Content in Library
- US-05-005: Delete Content
- US-05-007: Archive Content
- US-05-008: Duplicate Content
- US-06-004: Export Content as File

### Sprint 6: Final Features
- US-05-006: Bulk Actions on Content
- US-07-011: First-Run Onboarding *(NEW - Optional)*

---

## 7. Document References

### Related Documents
- [Product Requirements Document (PRD)](./plan.md) - Full product specifications
- [Tech Stack Document](./tech-stack.md) - Technical architecture and implementation details
- [Git Workflow](./git-workflow.md) - Development workflow guidelines

### Best Practices Sources
- [Atlassian User Stories Guide](https://www.atlassian.com/agile/project-management/user-stories)
- [Easy Agile User Story Guide](https://www.easyagile.com/blog/how-to-write-good-user-stories-in-agile-software-development)
- [Smartsheet User Story Examples](https://www.smartsheet.com/content/user-story-with-acceptance-criteria-examples)
- [ProductPlan Acceptance Criteria](https://www.productplan.com/glossary/acceptance-criteria/)

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-02-04 | Claude + Ken | Initial user stories document |
| 1.1 | 2026-02-04 | Claude + Ken | Added 8 new user stories: OAuth Auth (US-07-007), AI Provider Settings (US-07-008), Usage Tracking (US-07-009), Export Data (US-07-010), Onboarding (US-07-011), Clone Comparison (US-02-016), A/B Variations (US-04-013), Content Templates (US-04-014). Added edge cases to US-02-008, US-04-005, US-02-011. Updated sprint planning. Total stories: 57 → 65. |

---

*End of Document*
