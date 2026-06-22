import OpenAI from "openai";

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

class OpenRouterClient {
  private client: OpenAI;

  constructor() {
    const httpReferer =
      process.env.OPENROUTER_HTTP_REFERER ||
      (process.env.NODE_ENV === "production"
        ? "https://example.com"
        : "http://localhost:5000");
    const appTitle = process.env.OPENROUTER_APP_TITLE || "DevTrail";

    this.client = new OpenAI({
      apiKey: process.env.OPENROUTER_API_KEY!,
      baseURL: "https://openrouter.ai/api/v1",
      defaultHeaders: {
        "HTTP-Referer": httpReferer,
        "X-Title": appTitle,
      },
    });
  }

  async chat(messages: ChatMessage[]): Promise<string> {
    const completion = await this.client.chat.completions.create({
      // ✅ FREE MODEL (no billing)
      model: "meta-llama/llama-3-8b-instruct",
      messages,
      temperature: 0.7,
    });

    return completion.choices[0].message.content ?? "";
  }
}

export const aiClient = new OpenRouterClient();
