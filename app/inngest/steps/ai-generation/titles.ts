/**
 * Title Suggestions Generation
 *
 * Generates 4 types of title variations for different contexts:
 * 1. YouTube Short Titles: Hook-focused, curiosity-driven (40-60 chars)
 * 2. YouTube Long Titles: SEO-optimized with keywords (70-100 chars)
 * 3. Podcast Episode Titles: Creative and memorable for RSS feeds
 * 4. SEO Keywords: Discovery optimization across platforms
 *
 * Use Cases:
 * - Content creators need multiple title options to A/B test
 * - Different platforms favor different title styles
 * - SEO keywords improve discoverability across search engines
 *
 * Design Decision: Multiple title formats
 * - Saves manual brainstorming time
 * - Each format optimized for specific distribution channel
 * - Keywords help with content strategy beyond just titles
 */
import type { step as InngestStep } from "inngest";
import type OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { openai } from "../../lib/openai-client";
import { type Titles, titlesSchema } from "../../schemas/ai-outputs";
import type { TranscriptWithExtras } from "../../types/assemblyai";

// System prompt defines GPT's expertise in SEO and viral content
const TITLES_SYSTEM_PROMPT =
  "You are an expert in SEO, content marketing, and viral content creation. For any topic or content I provide, generate multiple clickable, high-converting titles that maintain credibility, align with SEO best practices, and maximize search rankings and engagement. For each title, provide 3–5 variations with slightly different angles, and include a brief rationale explaining why it is likely to attract clicks and perform well in search engines. Focus on clarity, relevance, and viral potential.";

/**
 * Builds prompt with transcript preview and title-specific guidelines
 *
 * Context Provided:
 * - First 2000 chars of transcript (enough for topic understanding)
 * - Chapter headlines (topic structure)
 * - Specific requirements for each title type
 *
 * Prompt Engineering:
 * - Character limits explicitly stated
 * - Examples of formatting conventions
 * - Balance between clickability and credibility
 */
function buildTitlesPrompt(transcript: TranscriptWithExtras): string {
  return `You are an expert in SEO, content marketing, and viral content creation. Analyze this podcast transcript and generate **high-performing, clickable, and discovery-optimized titles** for the episode.

TRANSCRIPT PREVIEW:
${transcript.text.substring(0, 2000)}...

${
  transcript.chapters?.length > 0
    ? `MAIN TOPICS COVERED:\n${transcript.chapters
        .map((ch, idx) => `${idx + 1}. ${ch.headline}`)
        .join("\n")}`
    : ""
}

Generate the following:

1. YOUTUBE SHORT TITLES (3 titles):
   - 40–60 characters each
   - Hook-focused, curiosity-driven
   - Clickable but not misleading
   - Use power words, numbers, or emotional triggers

2. YOUTUBE LONG TITLES (3 titles):
   - 70–100 characters each
   - Include SEO keywords naturally
   - Descriptive and informative
   - Format: "Main Topic: Subtitle | Context or Value Prop"

3. PODCAST EPISODE TITLES (3 titles):
   - Creative, memorable, and brand-aligned
   - Balance intrigue with clarity
   - Suitable for RSS feeds, directories, and social sharing
   - Can use "Episode #" format or standalone

4. SEO KEYWORDS (5–10 keywords):
   - High-traffic, relevant search terms
   - Mix of broad and niche keywords
   - Reflect what listeners actually search for

INSTRUCTIONS:
- For each type, provide **3–5 variations if possible**
- Include a brief 1–2 sentence **rationale for each title or keyword set**, explaining why it will drive clicks and improve search visibility
- Ensure all output is **accurate, engaging, and ready to use** for social media, YouTube, and podcast distribution
- Focus on **maximizing reach, discoverability, and audience engagement**
`;
}

/**
 * Generates title suggestions using OpenAI with structured outputs
 *
 * Error Handling:
 * - Returns placeholder titles on failure
 * - Logs errors for debugging
 * - Graceful degradation (workflow continues)
 *
 * Validation:
 * - Zod schema enforces exact array lengths (3 short, 3 long, 3 podcast)
 * - SEO keywords validated for 5-10 range
 */
export async function generateTitles(
  step: typeof InngestStep,
  transcript: TranscriptWithExtras
): Promise<Titles> {
  console.log("Generating title suggestions with GPT-4");

  try {
    // Bind OpenAI method to preserve `this` context for step.ai.wrap
    const createCompletion = openai.chat.completions.create.bind(
      openai.chat.completions
    );

    // Call OpenAI with Structured Outputs for validated response
    const response = (await step.ai.wrap(
      "generate-titles-with-gpt",
      createCompletion,
      {
        model: "gpt-5-mini",
        messages: [
          { role: "system", content: TITLES_SYSTEM_PROMPT },
          { role: "user", content: buildTitlesPrompt(transcript) },
        ],
        response_format: zodResponseFormat(titlesSchema, "titles"),
      }
    )) as OpenAI.Chat.Completions.ChatCompletion;

    const titlesContent = response.choices[0]?.message?.content;
    // Parse and validate against schema
    const titles = titlesContent
      ? titlesSchema.parse(JSON.parse(titlesContent))
      : {
          // Fallback titles if parsing fails
          youtubeShort: ["Podcast Episode"],
          youtubeLong: ["Podcast Episode - Full Discussion"],
          podcastTitles: ["New Episode"],
          seoKeywords: ["podcast"],
        };

    return titles;
  } catch (error) {
    console.error("GPT titles error:", error);

    // Graceful degradation: Return error indicators
    return {
      youtubeShort: ["Title generation failed"],
      youtubeLong: ["Title generation failed - check logs"],
      podcastTitles: ["Title generation failed"],
      seoKeywords: ["error"],
    };
  }
}
