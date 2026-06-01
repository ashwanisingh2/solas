import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";

export type AiProvider = "openai" | "anthropic" | "gemini";

type GenerateInput = {
  provider?: AiProvider;
  system: string;
  prompt: string;
};

export async function generateAiText({ provider = "openai", system, prompt }: GenerateInput) {
  if (provider === "anthropic" && process.env.ANTHROPIC_API_KEY) {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const res = await client.messages.create({
      model: process.env.ANTHROPIC_MODEL || "claude-3-5-sonnet-latest",
      max_tokens: 600,
      system,
      messages: [{ role: "user", content: prompt }],
    });
    return res.content.map((item) => (item.type === "text" ? item.text : "")).join("");
  }

  if (provider === "gemini" && process.env.GEMINI_API_KEY) {
    const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = client.getGenerativeModel({ model: process.env.GEMINI_MODEL || "gemini-1.5-pro" });
    const res = await model.generateContent(`${system}\n\n${prompt}`);
    return res.response.text();
  }

  if (process.env.OPENAI_API_KEY) {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const res = await client.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
      input: [
        { role: "system", content: system },
        { role: "user", content: prompt },
      ],
    });
    return res.output_text;
  }

  return "Engineer response: isolate the layer, collect proof, apply the smallest safe fix, then document the result.";
}
