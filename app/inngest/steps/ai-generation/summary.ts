/**
 * AI Summary Generation Step
 *
 * Generates multi-format podcast summaries using OpenAI GPT.
 *
 * Summary Formats:
 * - Full: 200-300 word comprehensive overview for show notes
 * - Bullets: 5-7 scannable key points for quick reference
 * - Insights: 3-5 actionable takeaways for the audience
 * - TL;DR: One-sentence hook for social media
 *
 * Integration:
 * - Uses OpenAI Structured Outputs (zodResponseFormat) for type safety
 * - Wrapped in step.ai.wrap() for Inngest observability and automatic retries
 * - Leverages AssemblyAI chapters for better context understanding
 *
 * Design Decision: Why multiple summary formats?
 * - Different use cases: blog, email, social, show notes
 * - Saves manual editing time for content creators
 * - Each format optimized for its specific purpose
 */
import type { step as InngestStep } from "inngest";
import type OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { openai } from "../../lib/openai-client";
import { type Summary, summarySchema } from "../../schemas/ai-outputs";
import type { TranscriptWithExtras } from "../../types/assemblyai";

// System prompt defines GPT's role and expertise
const SUMMARY_SYSTEM_PROMPT = `
You are a top-tier podcast content analyst and marketing strategist. For any podcast episode I provide, generate **engaging, insightful, and highly shareable summaries** that highlight the most valuable takeaways for listeners. Each summary should:
  • Be concise, clear, and easy to read
  • Extract actionable insights, key lessons, or compelling stories
  • Capture the tone, style, and personality of the podcast
  • Be suitable for repurposing across social media, newsletters, and show notes

For every episode, create **3–5 distinct summary variations**, each offering a unique angle or perspective. Include a short 1–2 sentence rationale for each variation, explaining why it will resonate with the target audience, boost engagement, and increase listener retention. Focus on producing summaries that are **copy-ready, strategic, and audience-focused**.
`;

/**
 * Builds the user prompt with transcript context and detailed instructions
 *
 * Prompt Engineering Techniques:
 * - Provides first 3000 chars of transcript (balance context vs. token cost)
 * - Includes AssemblyAI chapters for topic structure
 * - Specific formatting requirements for each summary type
 * - Examples and constraints to guide GPT output
 */
function buildSummaryPrompt(transcript: TranscriptWithExtras): string {
  return `You are a top-tier podcast content analyst and marketing strategist. Analyze this podcast transcript in detail and create a comprehensive, engaging, and highly shareable summary package.

TRANSCRIPT (first 3000 characters):
${transcript.text.substring(0, 3000)}...

${
  transcript.chapters?.length > 0
    ? `AUTO-DETECTED CHAPTERS:\n${transcript.chapters
        .map((ch, idx) => `${idx + 1}. ${ch.headline} - ${ch.summary}`)
        .join("\n")}`
    : ""
}

Create a summary package including the following:

1. FULL OVERVIEW (200–300 words):
   - Describe what this podcast episode is about
   - Identify speakers and their perspectives
   - Highlight main themes, arguments, and narrative flow
   - Explain why listeners should care and tune in

2. KEY BULLET POINTS (5–7 items):
   - Main topics covered in order
   - Important facts, statistics, or notable quotes
   - Key arguments or positions presented
   - Memorable or discussion-worthy moments

3. ACTIONABLE INSIGHTS (3–5 items):
   - Practical lessons or strategies listeners can apply
   - Unique perspectives that challenge conventional thinking
   - Advice, tips, or recommendations with clear value

4. TL;DR (one compelling sentence):
   - Capture the essence of the episode
   - Hook the reader and create curiosity to listen

Requirements:
- Be **specific, engaging, and audience-focused**
- Highlight what makes this episode **unique and valuable**
- Ensure output is **clear, structured, and ready to repurpose** for social media, newsletters, or show notes
- Provide **3–5 variations** of each section if possible, each with a slightly different angle or emphasis
- Include a **1–2 sentence rationale** per variation explaining why it will resonate and drive engagement
`;
}

/**
 * Generates summary using OpenAI GPT with structured outputs
 *
 * Error Handling:
 * - Returns fallback summary on API failure (graceful degradation)
 * - Logs errors for debugging
 * - Doesn't throw (allows other parallel jobs to continue)
 *
 * Inngest Integration:
 * - step.ai.wrap() tracks token usage and performance
 * - Provides automatic retry on transient failures
 * - Shows AI call details in Inngest dashboard
 */
export async function generateSummary(
  step: typeof InngestStep,
  transcript: TranscriptWithExtras
): Promise<Summary> {
  console.log("Generating podcast summary with GPT-4");

  try {
    // Bind OpenAI method to preserve `this` context (required for step.ai.wrap)
    const createCompletion = openai.chat.completions.create.bind(
      openai.chat.completions
    );

    // Call OpenAI with Structured Outputs for type-safe response
    const response = (await step.ai.wrap(
      "generate-summary-with-gpt",
      createCompletion,
      {
        model: "gpt-5-mini", // Fast and cost-effective model
        messages: [
          { role: "system", content: SUMMARY_SYSTEM_PROMPT },
          { role: "user", content: buildSummaryPrompt(transcript) },
        ],
        // zodResponseFormat ensures response matches summarySchema
        response_format: zodResponseFormat(summarySchema, "summary"),
      }
    )) as OpenAI.Chat.Completions.ChatCompletion;

    const content = response.choices[0]?.message?.content;
    // Parse and validate response against schema
    const summary = content
      ? summarySchema.parse(JSON.parse(content))
      : {
          // Fallback: use raw transcript if parsing fails
          full: transcript.text.substring(0, 500),
          bullets: ["Full transcript available"],
          insights: ["See transcript"],
          tldr: transcript.text.substring(0, 200),
        };

    return summary;
  } catch (error) {
    console.error("GPT summary generation error:", error);

    // Graceful degradation: return error message but allow workflow to continue
    return {
      full: "Error generating summary with GPT-4. Please check logs or try again.",
      bullets: ["Summary generation failed - see full transcript"],
      insights: ["Error occurred during AI generation"],
      tldr: "Summary generation failed",
    };
  }
}
