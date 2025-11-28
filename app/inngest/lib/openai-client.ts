import OpenAI from "openai";

// Create openai Model
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
