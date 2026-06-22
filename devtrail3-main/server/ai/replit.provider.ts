// @ts-nocheck

import type { AIClient, ChatMessage } from "./aiClient";
import { openai } from "../replit_integrations/image"; 
// 👆 same instance jo abhi use ho raha hai

export class ReplitAIClient implements AIClient {
  async chat(messages: ChatMessage[]): Promise<string> {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages,
    });

    return completion.choices[0].message.content ?? "";
  }
}
