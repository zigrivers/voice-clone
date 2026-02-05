/**
 * Tests for Zod validation schemas
 */

import { ContentStatus, SourceType } from "@/types";
import {
  voiceCloneSchema,
  writingSampleSchema,
  writingSamplePasteSchema,
  writingSampleUrlSchema,
  writingSampleFileSchema,
  contentGenerationSchema,
  contentUpdateSchema,
  settingsInstructionsSchema,
  settingsGuidelinesSchema,
  platformSettingsSchema,
  apiKeySchema,
  mergeCloneSchema,
} from "@/lib/validations";

describe("voiceCloneSchema", () => {
  it("accepts valid data with required fields", () => {
    const data = { name: "My Voice Clone" };
    const result = voiceCloneSchema.safeParse(data);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("My Voice Clone");
      expect(result.data.tags).toEqual([]);
    }
  });

  it("accepts valid data with all fields", () => {
    const data = {
      name: "Professional Voice",
      description: "A professional writing voice for business.",
      tags: ["professional", "formal"],
    };
    const result = voiceCloneSchema.safeParse(data);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.description).toBe("A professional writing voice for business.");
      expect(result.data.tags).toEqual(["professional", "formal"]);
    }
  });

  it("rejects empty name", () => {
    const data = { name: "" };
    const result = voiceCloneSchema.safeParse(data);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("name");
      expect(result.error.issues[0].message).toContain("required");
    }
  });

  it("rejects name over 255 characters", () => {
    const data = { name: "x".repeat(256) };
    const result = voiceCloneSchema.safeParse(data);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("name");
      expect(result.error.issues[0].message).toContain("255");
    }
  });

  it("rejects description over 2000 characters", () => {
    const data = { name: "Valid Name", description: "x".repeat(2001) };
    const result = voiceCloneSchema.safeParse(data);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("description");
    }
  });
});

describe("writingSampleSchema", () => {
  describe("PASTE type", () => {
    it("accepts valid PASTE data", () => {
      const data = {
        source_type: SourceType.PASTE,
        content: "x".repeat(100),
      };
      const result = writingSampleSchema.safeParse(data);

      expect(result.success).toBe(true);
    });

    it("rejects content under 100 characters", () => {
      const data = {
        source_type: SourceType.PASTE,
        content: "Too short",
      };
      const result = writingSampleSchema.safeParse(data);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("100");
      }
    });

    it("rejects content over 100,000 characters", () => {
      const data = {
        source_type: SourceType.PASTE,
        content: "x".repeat(100001),
      };
      const result = writingSampleSchema.safeParse(data);

      expect(result.success).toBe(false);
    });
  });

  describe("URL type", () => {
    it("accepts valid URL data", () => {
      const data = {
        source_type: SourceType.URL,
        source_url: "https://example.com/article",
      };
      const result = writingSampleSchema.safeParse(data);

      expect(result.success).toBe(true);
    });

    it("rejects invalid URL format", () => {
      const data = {
        source_type: SourceType.URL,
        source_url: "not-a-valid-url",
      };
      const result = writingSampleSchema.safeParse(data);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("URL");
      }
    });
  });

  describe("FILE type", () => {
    it("accepts valid FILE data with File object", () => {
      const mockFile = new File(["content"], "test.txt", { type: "text/plain" });
      const data = {
        source_type: SourceType.FILE,
        file: mockFile,
      };
      const result = writingSampleSchema.safeParse(data);

      expect(result.success).toBe(true);
    });

    it("rejects FILE type without File object", () => {
      const data = {
        source_type: SourceType.FILE,
        file: "not a file",
      };
      const result = writingSampleSchema.safeParse(data);

      expect(result.success).toBe(false);
    });
  });
});

describe("contentGenerationSchema", () => {
  it("accepts valid data with required fields", () => {
    const data = {
      voice_clone_id: "clone-123",
      platform: "linkedin",
      input_text: "Write a post about AI technology.",
    };
    const result = contentGenerationSchema.safeParse(data);

    expect(result.success).toBe(true);
  });

  it("accepts valid data with all optional fields", () => {
    const data = {
      voice_clone_id: "clone-123",
      platform: "twitter",
      input_text: "Write a tweet about coding.",
      length: "short" as const,
      tone_override: "casual",
      target_audience: "developers",
      cta_style: "question",
    };
    const result = contentGenerationSchema.safeParse(data);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.length).toBe("short");
      expect(result.data.tone_override).toBe("casual");
    }
  });

  it("rejects empty voice_clone_id", () => {
    const data = {
      voice_clone_id: "",
      platform: "linkedin",
      input_text: "Write a post.",
    };
    const result = contentGenerationSchema.safeParse(data);

    expect(result.success).toBe(false);
  });

  it("rejects empty platform", () => {
    const data = {
      voice_clone_id: "clone-123",
      platform: "",
      input_text: "Write a post.",
    };
    const result = contentGenerationSchema.safeParse(data);

    expect(result.success).toBe(false);
  });

  it("rejects input_text under 10 characters", () => {
    const data = {
      voice_clone_id: "clone-123",
      platform: "linkedin",
      input_text: "Short",
    };
    const result = contentGenerationSchema.safeParse(data);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("10");
    }
  });

  it("rejects invalid length value", () => {
    const data = {
      voice_clone_id: "clone-123",
      platform: "linkedin",
      input_text: "Write a post about technology.",
      length: "extra-long",
    };
    const result = contentGenerationSchema.safeParse(data);

    expect(result.success).toBe(false);
  });

  it("accepts valid length values", () => {
    for (const length of ["short", "medium", "long"] as const) {
      const data = {
        voice_clone_id: "clone-123",
        platform: "linkedin",
        input_text: "Write a post about technology.",
        length,
      };
      const result = contentGenerationSchema.safeParse(data);
      expect(result.success).toBe(true);
    }
  });
});

describe("contentUpdateSchema", () => {
  it("accepts partial update with content_text", () => {
    const data = { content_text: "Updated content." };
    const result = contentUpdateSchema.safeParse(data);

    expect(result.success).toBe(true);
  });

  it("accepts partial update with status", () => {
    const data = { status: ContentStatus.READY };
    const result = contentUpdateSchema.safeParse(data);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe(ContentStatus.READY);
    }
  });

  it("accepts partial update with tags", () => {
    const data = { tags: ["marketing", "social"] };
    const result = contentUpdateSchema.safeParse(data);

    expect(result.success).toBe(true);
  });

  it("accepts all valid status values", () => {
    for (const status of Object.values(ContentStatus)) {
      const data = { status };
      const result = contentUpdateSchema.safeParse(data);
      expect(result.success).toBe(true);
    }
  });

  it("accepts empty update object", () => {
    const data = {};
    const result = contentUpdateSchema.safeParse(data);

    expect(result.success).toBe(true);
  });

  it("rejects content_text over 100,000 characters", () => {
    const data = { content_text: "x".repeat(100001) };
    const result = contentUpdateSchema.safeParse(data);

    expect(result.success).toBe(false);
  });
});

describe("settingsInstructionsSchema", () => {
  it("accepts valid content", () => {
    const data = { content: "x".repeat(100) };
    const result = settingsInstructionsSchema.safeParse(data);

    expect(result.success).toBe(true);
  });

  it("rejects content under 100 characters", () => {
    const data = { content: "Too short" };
    const result = settingsInstructionsSchema.safeParse(data);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("100");
    }
  });

  it("rejects content over 50,000 characters", () => {
    const data = { content: "x".repeat(50001) };
    const result = settingsInstructionsSchema.safeParse(data);

    expect(result.success).toBe(false);
  });
});

describe("settingsGuidelinesSchema", () => {
  it("accepts valid content", () => {
    const data = { content: "x".repeat(100) };
    const result = settingsGuidelinesSchema.safeParse(data);

    expect(result.success).toBe(true);
  });

  it("rejects content under 100 characters", () => {
    const data = { content: "Too short" };
    const result = settingsGuidelinesSchema.safeParse(data);

    expect(result.success).toBe(false);
  });
});

describe("platformSettingsSchema", () => {
  it("accepts valid data", () => {
    const data = {
      platform: "slack",
      display_name: "Slack",
      best_practices: "x".repeat(50),
    };
    const result = platformSettingsSchema.safeParse(data);

    expect(result.success).toBe(true);
  });

  it("rejects empty platform", () => {
    const data = {
      platform: "",
      display_name: "Slack",
      best_practices: "x".repeat(50),
    };
    const result = platformSettingsSchema.safeParse(data);

    expect(result.success).toBe(false);
  });

  it("rejects platform over 50 characters", () => {
    const data = {
      platform: "x".repeat(51),
      display_name: "Long Platform",
      best_practices: "x".repeat(50),
    };
    const result = platformSettingsSchema.safeParse(data);

    expect(result.success).toBe(false);
  });

  it("rejects invalid platform format", () => {
    const data = {
      platform: "Invalid Platform!",
      display_name: "Invalid",
      best_practices: "x".repeat(50),
    };
    const result = platformSettingsSchema.safeParse(data);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("lowercase");
    }
  });

  it("accepts valid platform formats", () => {
    for (const platform of ["slack", "my-platform", "platform_1"]) {
      const data = {
        platform,
        display_name: "Test",
        best_practices: "x".repeat(50),
      };
      const result = platformSettingsSchema.safeParse(data);
      expect(result.success).toBe(true);
    }
  });

  it("rejects empty display_name", () => {
    const data = {
      platform: "slack",
      display_name: "",
      best_practices: "x".repeat(50),
    };
    const result = platformSettingsSchema.safeParse(data);

    expect(result.success).toBe(false);
  });

  it("rejects display_name over 100 characters", () => {
    const data = {
      platform: "slack",
      display_name: "x".repeat(101),
      best_practices: "x".repeat(50),
    };
    const result = platformSettingsSchema.safeParse(data);

    expect(result.success).toBe(false);
  });

  it("rejects best_practices under 50 characters", () => {
    const data = {
      platform: "slack",
      display_name: "Slack",
      best_practices: "Too short",
    };
    const result = platformSettingsSchema.safeParse(data);

    expect(result.success).toBe(false);
  });
});

describe("apiKeySchema", () => {
  it("accepts valid OpenAI key", () => {
    const data = {
      provider: "openai" as const,
      api_key: "sk-test1234567890123456",
    };
    const result = apiKeySchema.safeParse(data);

    expect(result.success).toBe(true);
  });

  it("accepts valid Anthropic key", () => {
    const data = {
      provider: "anthropic" as const,
      api_key: "sk-ant-test12345678901234",
    };
    const result = apiKeySchema.safeParse(data);

    expect(result.success).toBe(true);
  });

  it("rejects invalid provider", () => {
    const data = {
      provider: "invalid-provider",
      api_key: "sk-test1234567890123456",
    };
    const result = apiKeySchema.safeParse(data);

    expect(result.success).toBe(false);
  });

  it("rejects key shorter than 20 characters", () => {
    const data = {
      provider: "openai" as const,
      api_key: "short",
    };
    const result = apiKeySchema.safeParse(data);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("short");
    }
  });

  it("rejects key longer than 200 characters", () => {
    const data = {
      provider: "openai" as const,
      api_key: "x".repeat(201),
    };
    const result = apiKeySchema.safeParse(data);

    expect(result.success).toBe(false);
  });
});

describe("mergeCloneSchema", () => {
  it("accepts valid merge with 2 sources", () => {
    const data = {
      name: "Merged Voice",
      sources: [
        { voice_clone_id: "clone-1", element_weights: { vocabulary: 60, tone: 40 } },
        { voice_clone_id: "clone-2", element_weights: { vocabulary: 40, tone: 60 } },
      ],
    };
    const result = mergeCloneSchema.safeParse(data);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.sources.length).toBe(2);
      expect(result.data.tags).toEqual([]);
    }
  });

  it("accepts valid merge with 5 sources", () => {
    const data = {
      name: "Merged Voice",
      sources: Array.from({ length: 5 }, (_, i) => ({
        voice_clone_id: `clone-${i}`,
        element_weights: { vocabulary: 20 },
      })),
    };
    const result = mergeCloneSchema.safeParse(data);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.sources.length).toBe(5);
    }
  });

  it("accepts merge with all optional fields", () => {
    const data = {
      name: "Merged Voice",
      description: "A merged voice clone.",
      tags: ["merged", "custom"],
      sources: [
        { voice_clone_id: "clone-1", element_weights: { vocabulary: 50 } },
        { voice_clone_id: "clone-2", element_weights: { vocabulary: 50 } },
      ],
    };
    const result = mergeCloneSchema.safeParse(data);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.description).toBe("A merged voice clone.");
      expect(result.data.tags).toEqual(["merged", "custom"]);
    }
  });

  it("rejects merge with less than 2 sources", () => {
    const data = {
      name: "Merged Voice",
      sources: [{ voice_clone_id: "clone-1", element_weights: { vocabulary: 100 } }],
    };
    const result = mergeCloneSchema.safeParse(data);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("2");
    }
  });

  it("rejects merge with more than 5 sources", () => {
    const data = {
      name: "Merged Voice",
      sources: Array.from({ length: 6 }, (_, i) => ({
        voice_clone_id: `clone-${i}`,
        element_weights: { vocabulary: 16 },
      })),
    };
    const result = mergeCloneSchema.safeParse(data);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("5");
    }
  });

  it("rejects source with empty voice_clone_id", () => {
    const data = {
      name: "Merged Voice",
      sources: [
        { voice_clone_id: "", element_weights: { vocabulary: 50 } },
        { voice_clone_id: "clone-2", element_weights: { vocabulary: 50 } },
      ],
    };
    const result = mergeCloneSchema.safeParse(data);

    expect(result.success).toBe(false);
  });

  it("rejects weights outside 0-100 range", () => {
    const data = {
      name: "Merged Voice",
      sources: [
        { voice_clone_id: "clone-1", element_weights: { vocabulary: 150 } },
        { voice_clone_id: "clone-2", element_weights: { vocabulary: 50 } },
      ],
    };
    const result = mergeCloneSchema.safeParse(data);

    expect(result.success).toBe(false);
  });

  it("rejects negative weights", () => {
    const data = {
      name: "Merged Voice",
      sources: [
        { voice_clone_id: "clone-1", element_weights: { vocabulary: -10 } },
        { voice_clone_id: "clone-2", element_weights: { vocabulary: 50 } },
      ],
    };
    const result = mergeCloneSchema.safeParse(data);

    expect(result.success).toBe(false);
  });

  it("rejects empty name", () => {
    const data = {
      name: "",
      sources: [
        { voice_clone_id: "clone-1", element_weights: { vocabulary: 50 } },
        { voice_clone_id: "clone-2", element_weights: { vocabulary: 50 } },
      ],
    };
    const result = mergeCloneSchema.safeParse(data);

    expect(result.success).toBe(false);
  });

  it("rejects name over 255 characters", () => {
    const data = {
      name: "x".repeat(256),
      sources: [
        { voice_clone_id: "clone-1", element_weights: { vocabulary: 50 } },
        { voice_clone_id: "clone-2", element_weights: { vocabulary: 50 } },
      ],
    };
    const result = mergeCloneSchema.safeParse(data);

    expect(result.success).toBe(false);
  });
});
