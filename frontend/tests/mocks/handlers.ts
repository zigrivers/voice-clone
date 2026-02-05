/**
 * MSW handlers for API mocking
 */

import { http, HttpResponse } from "msw";
import { ContentStatus, SourceType } from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

// Mock data factories
export const mockUser = (overrides = {}) => ({
  id: "user-123",
  email: "test@example.com",
  name: "Test User",
  avatar_url: "https://example.com/avatar.jpg",
  oauth_provider: "google",
  created_at: "2024-01-15T10:30:00Z",
  updated_at: null,
  ...overrides,
});

export const mockVoiceClone = (overrides = {}) => ({
  id: "clone-123",
  user_id: "user-123",
  name: "Test Voice Clone",
  description: "A test voice clone for testing.",
  tags: ["test", "example"],
  is_merged: false,
  confidence_score: 75,
  current_dna_id: "dna-123",
  created_at: "2024-01-15T10:30:00Z",
  updated_at: "2024-01-20T14:00:00Z",
  ...overrides,
});

export const mockWritingSample = (overrides = {}) => ({
  id: "sample-123",
  voice_clone_id: "clone-123",
  source_type: SourceType.PASTE,
  content: "This is sample writing content for testing purposes.",
  source_url: null,
  original_filename: null,
  word_count: 9,
  created_at: "2024-01-15T10:30:00Z",
  ...overrides,
});

export const mockVoiceDna = (overrides = {}) => ({
  id: "dna-123",
  voice_clone_id: "clone-123",
  version: 1,
  dna_data: {
    vocabulary_patterns: { complexity: "advanced" },
    sentence_structure: { average_length: 15 },
    paragraph_structure: { average_sentences: 4 },
    tone_markers: { formal: 0.7, casual: 0.3 },
    rhetorical_devices: {},
    punctuation_habits: {},
    opening_patterns: {},
    closing_patterns: {},
    humor_and_personality: {},
    distinctive_signatures: {},
  },
  analysis_metadata: { provider: "openai" },
  created_at: "2024-01-15T10:30:00Z",
  ...overrides,
});

export const mockContent = (overrides = {}) => ({
  id: "content-123",
  user_id: "user-123",
  voice_clone_id: "clone-123",
  platform: "linkedin",
  content_text: "Generated content for testing.",
  input_text: "Write a test post.",
  properties_used: { tone: "professional" },
  detection_score: 85,
  detection_breakdown: {
    sentence_variety: 80,
    vocabulary_diversity: 85,
    specificity: 90,
    transition_naturalness: 80,
    opening_closing: 85,
    punctuation: 90,
    personality: 80,
    structure: 85,
  },
  status: ContentStatus.DRAFT,
  tags: ["test"],
  created_at: "2024-01-15T10:30:00Z",
  updated_at: null,
  voice_clone_name: "Test Voice Clone",
  ...overrides,
});

export const mockSettings = (overrides = {}) => ({
  id: "settings-123",
  user_id: "user-123",
  voice_cloning_instructions: "Default voice cloning instructions.",
  anti_ai_guidelines: "Default anti-AI detection guidelines.",
  created_at: "2024-01-15T10:30:00Z",
  updated_at: null,
  ...overrides,
});

export const mockPlatformSettings = (overrides = {}) => ({
  id: "platform-123",
  user_id: "user-123",
  platform: "linkedin",
  display_name: "LinkedIn",
  best_practices: "Use professional tone on LinkedIn.",
  is_default: true,
  created_at: "2024-01-15T10:30:00Z",
  updated_at: null,
  ...overrides,
});

export const mockApiKey = (overrides = {}) => ({
  id: "key-123",
  provider: "openai",
  masked_key: "sk-...abc123",
  is_valid: true,
  created_at: "2024-01-15T10:30:00Z",
  ...overrides,
});

// Handlers
export const handlers = [
  // Health check
  http.get(`${API_BASE}/health`, () => {
    return HttpResponse.json({ status: "ok" });
  }),

  // Auth - current user
  http.get(`${API_BASE}/users/me`, () => {
    return HttpResponse.json(mockUser());
  }),

  // Voice Clones
  http.get(`${API_BASE}/voice-clones`, () => {
    return HttpResponse.json({
      items: [mockVoiceClone()],
      total: 1,
      page: 1,
      per_page: 20,
      pages: 1,
    });
  }),

  http.get(`${API_BASE}/voice-clones/:id`, ({ params }) => {
    const { id } = params;
    return HttpResponse.json({
      ...mockVoiceClone({ id }),
      samples: [mockWritingSample()],
      current_dna: mockVoiceDna(),
      sample_count: 1,
      total_word_count: 500,
    });
  }),

  http.post(`${API_BASE}/voice-clones`, async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    return HttpResponse.json(mockVoiceClone({ ...body, id: "new-clone-123" }), {
      status: 201,
    });
  }),

  http.put(`${API_BASE}/voice-clones/:id`, async ({ params, request }) => {
    const { id } = params;
    const body = await request.json() as Record<string, unknown>;
    return HttpResponse.json(mockVoiceClone({ ...body, id }));
  }),

  http.delete(`${API_BASE}/voice-clones/:id`, () => {
    return new HttpResponse(null, { status: 204 });
  }),

  // Voice Clone samples
  http.post(`${API_BASE}/voice-clones/:id/samples`, async ({ params }) => {
    const { id } = params;
    return HttpResponse.json(mockWritingSample({ voice_clone_id: id }), {
      status: 201,
    });
  }),

  http.delete(`${API_BASE}/voice-clones/:cloneId/samples/:sampleId`, () => {
    return new HttpResponse(null, { status: 204 });
  }),

  // Voice Clone analysis
  http.post(`${API_BASE}/voice-clones/:id/analyze`, ({ params }) => {
    const { id } = params;
    return HttpResponse.json(mockVoiceDna({ voice_clone_id: id }));
  }),

  http.get(`${API_BASE}/voice-clones/:id/dna`, ({ params }) => {
    const { id } = params;
    return HttpResponse.json(mockVoiceDna({ voice_clone_id: id }));
  }),

  http.get(`${API_BASE}/voice-clones/:id/confidence`, () => {
    return HttpResponse.json({
      score: 75,
      breakdown: {
        word_count_score: 30,
        sample_count_score: 20,
        content_variety_score: 10,
        length_distribution_score: 10,
        consistency_score: 5,
      },
    });
  }),

  // Content
  http.get(`${API_BASE}/content`, () => {
    return HttpResponse.json({
      items: [mockContent()],
      total: 1,
      page: 1,
      per_page: 20,
      pages: 1,
    });
  }),

  http.get(`${API_BASE}/content/:id`, ({ params }) => {
    const { id } = params;
    return HttpResponse.json(mockContent({ id }));
  }),

  http.post(`${API_BASE}/content/generate`, async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    return HttpResponse.json({
      id: "new-content-123",
      content_text: "Generated content based on your input.",
      platform: body.platform,
      detection_score: 85,
      detection_breakdown: mockContent().detection_breakdown,
      properties_used: { tone: "professional" },
    });
  }),

  http.put(`${API_BASE}/content/:id`, async ({ params, request }) => {
    const { id } = params;
    const body = await request.json() as Record<string, unknown>;
    return HttpResponse.json(mockContent({ ...body, id }));
  }),

  http.delete(`${API_BASE}/content/:id`, () => {
    return new HttpResponse(null, { status: 204 });
  }),

  // Settings
  http.get(`${API_BASE}/settings`, () => {
    return HttpResponse.json(mockSettings());
  }),

  http.put(`${API_BASE}/settings/voice-cloning-instructions`, async ({ request }) => {
    const body = await request.json() as { content: string };
    return HttpResponse.json(
      mockSettings({ voice_cloning_instructions: body.content })
    );
  }),

  http.put(`${API_BASE}/settings/anti-ai-guidelines`, async ({ request }) => {
    const body = await request.json() as { content: string };
    return HttpResponse.json(mockSettings({ anti_ai_guidelines: body.content }));
  }),

  http.get(`${API_BASE}/settings/history/:type`, () => {
    return HttpResponse.json([
      {
        id: "history-1",
        settings_id: "settings-123",
        setting_type: "voice_cloning_instructions",
        content: "Previous version content.",
        version: 1,
        created_at: "2024-01-15T10:30:00Z",
      },
    ]);
  }),

  // Platform Settings
  http.get(`${API_BASE}/settings/platforms`, () => {
    return HttpResponse.json({
      items: [mockPlatformSettings()],
    });
  }),

  http.get(`${API_BASE}/settings/platforms/:platform`, ({ params }) => {
    const { platform } = params;
    return HttpResponse.json(mockPlatformSettings({ platform }));
  }),

  http.post(`${API_BASE}/settings/platforms`, async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    return HttpResponse.json(mockPlatformSettings({ ...body, is_default: false }), {
      status: 201,
    });
  }),

  http.put(`${API_BASE}/settings/platforms/:platform`, async ({ params, request }) => {
    const { platform } = params;
    const body = await request.json() as Record<string, unknown>;
    return HttpResponse.json(mockPlatformSettings({ ...body, platform }));
  }),

  http.delete(`${API_BASE}/settings/platforms/:platform`, () => {
    return new HttpResponse(null, { status: 204 });
  }),

  // API Keys
  http.get(`${API_BASE}/users/me/api-keys`, () => {
    return HttpResponse.json([mockApiKey()]);
  }),

  http.post(`${API_BASE}/users/me/api-keys`, async ({ request }) => {
    const body = await request.json() as { provider: string };
    return HttpResponse.json(mockApiKey({ provider: body.provider }), {
      status: 201,
    });
  }),

  http.delete(`${API_BASE}/users/me/api-keys/:provider`, () => {
    return new HttpResponse(null, { status: 204 });
  }),
];

// Error handlers for testing error scenarios
export const errorHandlers = {
  notFound: http.get(`${API_BASE}/voice-clones/:id`, () => {
    return HttpResponse.json(
      { error: { code: "NOT_FOUND", message: "Voice clone not found" } },
      { status: 404 }
    );
  }),

  serverError: http.get(`${API_BASE}/voice-clones`, () => {
    return HttpResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Internal server error" } },
      { status: 500 }
    );
  }),

  validationError: http.post(`${API_BASE}/voice-clones`, () => {
    return HttpResponse.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "Validation failed",
          details: { name: ["Name is required"] },
        },
      },
      { status: 422 }
    );
  }),

  unauthorized: http.get(`${API_BASE}/users/me`, () => {
    return HttpResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Not authenticated" } },
      { status: 401 }
    );
  }),
};
