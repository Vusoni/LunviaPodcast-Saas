// OpenAi and zod helper
import type { step as InngestStep } from "inngest";
import type OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { openai } from "../../lib/openai-client";
import { type Hashtags, hashtagsSchema } from "../../schemas/ai-outputs";
import type { TranscriptWithExtras } from "../../types/assemblyai";

// System prompt establishes GPT's knowledge of hashtag strategies
const HASHTAGS_SYSTEM_PROMPT = `
You are a leading social media growth strategist for podcasts, fully current as of November 28, 2025, with deep expertise in platform algorithms, trending hashtags, and audience engagement. 
Your objective is to generate hashtag strategies that **maximize episode reach, engagement, and follower growth**. 

For each podcast episode topic I provide:
1. Generate 3–5 distinct hashtag sets, each with 10–15 hashtags.
2. Each set must include a **balanced mix of trending, niche-specific, and evergreen hashtags** optimized for maximum algorithmic visibility.
3. Format output in a **copy-ready, structured list**, labeled numerically for easy implementation.
4. Include a **1–2 sentence rationale per set**, explaining why it is expected to perform best.
5. Suggest **variations or combinations** to test performance across platforms where relevant.

Focus entirely on **high-impact, measurable results** and practical implementation. Avoid generic or vague hashtags; every suggestion must be tailored specifically to podcast topics and target audience growth.
`;

// Build Hashtag Prompt
function buildHashtagsPrompt(transcript: TranscriptWithExtras): string {
  return `You are a top social media growth strategist for podcasts, fully up-to-date as of November 28, 2025, with deep expertise in platform algorithms, trending hashtags, and audience engagement. 
Your mission is to create **high-performing hashtag strategies** that maximize reach, engagement, discoverability, and follower growth for each podcast episode.

TOPICS COVERED:
${
  transcript.chapters
    ?.map((ch, idx) => `${idx + 1}. ${ch.headline}`)
    .join("\n") || "General discussion"
}

For each platform below, generate **3–5 distinct hashtag sets**, each with the specified number of hashtags. Format the output in **copy-ready, structured lists labeled numerically**. Include a **1–2 sentence rationale per set**, explaining why it is expected to perform best. Where possible, suggest **variations or combinations** to test engagement.

PLATFORM-SPECIFIC GUIDELINES:

1. INSTAGRAM (6–8 hashtags per set):
   - Mix highly popular (100k+ posts) and niche (10k–50k posts)
   - Community-building and content discovery tags
   - Trending but relevant to the podcast niche

2. TWITTER (5 hashtags per set):
   - Concise, trending, and topic-specific
   - Conversation-starting tags
   - Mix broad and niche for discoverability

3. YOUTUBE (5 hashtags per set):
   - Broad reach and discovery-focused
   - Mix general and niche
   - Trending in podcast/content space
   - Optimized for recommendations algorithm

4. TIKTOK (5–6 hashtags per set):
   - Currently trending tags
   - Gen Z relevance
   - FYP optimization
   - Mix viral and niche

5. LINKEDIN (5 hashtags per set):
   - Professional, B2B-focused
   - Industry-relevant
   - Thought leadership and business-oriented

REQUIREMENTS:
- Include the # symbol for all hashtags
- Ensure all hashtags are **directly relevant to the episode content**
- Output must be structured, actionable, and ready to copy
- Focus entirely on **high-impact, measurable results**; avoid generic or vague hashtags
`;
}

export async function generateHashtags(
  step: typeof InngestStep,
  transcript: TranscriptWithExtras
): Promise<Hashtags> {
  console.log("Generating hashtags with GPT");

  try {
    // Bind OpenAI method to preserve `this` context for step.ai.wrap
    const createCompletion = openai.chat.completions.create.bind(
      openai.chat.completions
    );

    // Call OpenAI with Structured Outputs for validated response
    const response = (await step.ai.wrap(
      "generate-hashtags-with-gpt",
      createCompletion,
      {
        model: "gpt-5-mini",
        messages: [
          { role: "system", content: HASHTAGS_SYSTEM_PROMPT },
          { role: "user", content: buildHashtagsPrompt(transcript) },
        ],
        response_format: zodResponseFormat(hashtagsSchema, "hashtags"),
      }
    )) as OpenAI.Chat.Completions.ChatCompletion;

    const content = response.choices[0]?.message?.content;
    // Parse and validate against schema
    const hashtags = content
      ? hashtagsSchema.parse(JSON.parse(content))
      : {
          // Fallback hashtags if parsing fails
          youtube: ["#Podcast"],
          instagram: ["#Podcast", "#Content"],
          tiktok: ["#Podcast"],
          linkedin: ["#Podcast"],
          twitter: ["#Podcast"],
        };

    return hashtags;
  } catch (error) {
    console.error("GPT hashtags error:", error);

    // Graceful degradation: Return error indicators
    return {
      youtube: ["Hashtag generation failed"],
      instagram: ["Hashtag generation failed"],
      tiktok: ["Hashtag generation failed"],
      linkedin: ["Hashtag generation failed"],
      twitter: ["Hashtag generation failed"],
    };
  }
}
