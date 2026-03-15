import { SchemaType, type FunctionDeclaration, type Schema } from "@google/generative-ai";

/**
 * Blog agent tool declarations for Gemini function calling.
 * These define what actions the blog AI agent can take during a conversation.
 */

export const BLOG_AGENT_TOOL_DECLARATIONS: FunctionDeclaration[] = [
  {
    name: "generate_blog",
    description:
      "Generate a new blog post draft. Use this when the user asks to create, write, or generate a new blog post. Returns a complete blog post with title, content, excerpt, tags, and SEO metadata.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        topic: {
          type: SchemaType.STRING,
          description:
            "The topic or subject for the blog post. Include any specific angles, keywords, or requirements from the user.",
        },
        style: {
          type: SchemaType.STRING,
          format: "enum",
          description:
            "Writing style: 'informative' (educational/how-to), 'persuasive' (marketing/sales), 'storytelling' (narrative), 'listicle' (numbered tips/lists), 'technical' (in-depth/detailed). Default 'informative'.",
          enum: ["informative", "persuasive", "storytelling", "listicle", "technical"],
        } as Schema,
        wordCount: {
          type: SchemaType.NUMBER,
          description: "Target word count (500-3000). Default 1000.",
        },
      },
      required: ["topic"],
    },
  },
  {
    name: "edit_content",
    description:
      "Edit or rewrite specific sections of the current blog post. Use this when the user wants to change, improve, or modify part of the blog content.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        instructions: {
          type: SchemaType.STRING,
          description:
            "What to change about the blog content. Be specific about which section to edit and how.",
        },
        section: {
          type: SchemaType.STRING,
          description:
            "Optional: which section to focus on (e.g., 'introduction', 'conclusion', a specific heading). If omitted, applies to the full content.",
        },
      },
      required: ["instructions"],
    },
  },
  {
    name: "suggest_titles",
    description:
      "Generate alternative title suggestions for the blog post. Use this when the user wants different title options or is not happy with the current title.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        count: {
          type: SchemaType.NUMBER,
          description: "Number of title suggestions to generate (1-10). Default 5.",
        },
        style: {
          type: SchemaType.STRING,
          description:
            "Style preference for titles: 'seo' (keyword-optimized), 'clickbait' (attention-grabbing), 'professional' (formal/authoritative), 'creative' (unique/catchy). Default 'seo'.",
        },
      },
    },
  },
  {
    name: "suggest_tags",
    description:
      "Generate tag and keyword suggestions for the blog post. Use this for SEO optimization or categorization.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        count: {
          type: SchemaType.NUMBER,
          description: "Number of tag suggestions to generate (1-20). Default 8.",
        },
        focus: {
          type: SchemaType.STRING,
          description:
            "Focus area: 'seo' (search keywords), 'social' (social media hashtags), 'category' (topic categories). Default 'seo'.",
        },
      },
    },
  },
  {
    name: "generate_outline",
    description:
      "Generate a structured outline for a blog post. Use this when the user wants to plan content before writing, or wants to see the structure first.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        topic: {
          type: SchemaType.STRING,
          description: "The topic to create an outline for.",
        },
        depth: {
          type: SchemaType.STRING,
          format: "enum",
          description:
            "Outline detail level: 'brief' (main headings only), 'detailed' (headings + key points), 'comprehensive' (headings + points + notes). Default 'detailed'.",
          enum: ["brief", "detailed", "comprehensive"],
        } as Schema,
      },
      required: ["topic"],
    },
  },
  {
    name: "read_blog",
    description:
      "Read the current blog post content. Use this to understand the current state of the blog before making edits.",
  },
  {
    name: "list_all_blogs",
    description:
      "List all blog posts in the workspace. Returns titles, statuses, excerpts, and tags. Use this to understand what content already exists before creating new posts, or when the user asks about their existing blogs. Default 6 results, max 12.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        limit: {
          type: SchemaType.NUMBER,
          description: "Max blog posts to return (1-12). Default 6.",
        },
      },
    },
  },
  {
    name: "update_blog",
    description:
      "Update the blog post fields directly. Use this to set or change the title, content, excerpt, tags, or SEO metadata.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        title: {
          type: SchemaType.STRING,
          description: "New blog post title.",
        },
        content: {
          type: SchemaType.STRING,
          description: "New blog post content in markdown format.",
        },
        excerpt: {
          type: SchemaType.STRING,
          description: "New blog post excerpt/summary (2-3 sentences).",
        },
        tags: {
          type: SchemaType.ARRAY,
          description: "New tags for the blog post.",
          items: { type: SchemaType.STRING },
        },
        seoTitle: {
          type: SchemaType.STRING,
          description: "SEO-optimized title (max 60 characters).",
        },
        seoDescription: {
          type: SchemaType.STRING,
          description: "SEO meta description (max 160 characters).",
        },
      },
    },
  },
  {
    name: "generate_multiple_blogs",
    description:
      "Generate multiple blog post drafts at once. Use this when the user asks to create several blog posts, a content calendar, or batch content. Each blog is saved as a separate post in the workspace.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        topics: {
          type: SchemaType.ARRAY,
          description:
            "Array of topics to write about. Each becomes a separate blog post.",
          items: { type: SchemaType.STRING },
        },
        style: {
          type: SchemaType.STRING,
          format: "enum",
          description:
            "Writing style for all posts: 'informative', 'persuasive', 'storytelling', 'listicle', 'technical'. Default 'informative'.",
          enum: ["informative", "persuasive", "storytelling", "listicle", "technical"],
        } as Schema,
        wordCount: {
          type: SchemaType.NUMBER,
          description: "Target word count per post (500-3000). Default 800.",
        },
      },
      required: ["topics"],
    },
  },
];
