import Groq from 'groq-sdk';
import { Message, UserProgress, Skill } from "../types";

export class GeminiService {
  private groq: Groq;

  constructor() {
    this.groq = new Groq({ 
      apiKey: import.meta.env.VITE_API_KEY || "",
      dangerouslyAllowBrowser: true 
    });
  }

  async generateResponse(
    messages: Message[],
    progress: UserProgress,
    skill: Skill | undefined
  ) {
    const history = messages.map(m => ({
      role: m.role === 'model' ? 'assistant' as const : 'user' as const,
      content: m.text || m.content || ""
    }));

    const systemInstruction = `
      You are Skill Bridge AI, an advanced, world-class intelligent assistant.
      You behave like ChatGPT: conversational, insightful, and highly capable of answering any question.
      
      Your specialization is technical education and programming.
      
      CURRENT CONTEXT:
      - Active Track: ${skill?.name || 'General Chat (No track active)'}
      - Completed Topics: ${progress.completedTopicIds.length}
      
      RULES:
      1. Provide comprehensive, accurate, and helpful answers to ANY prompt.
      2. If asked about programming, provide clean, modern code examples in Markdown blocks.
      3. Use Markdown (bold, lists, headers) to make responses readable.
      4. Be encouraging and proactive. If a user asks something related to ${skill?.name || 'programming'}, mention how it fits into their learning journey.
      5. If the user mentions they finished a task, congratulate them warmly.
      6. If they ask a non-technical question, answer it gracefully while pivoting slightly back to how it might relate to their skills if possible.
    `;

    try {
      const response = await this.groq.chat.completions.create({
        messages: [
          { role: 'system', content: systemInstruction },
          ...history
        ],
        model: "llama-3.1-8b-instant",
        temperature: 0.8,
        top_p: 0.95,
      });

      return response.choices[0]?.message?.content || "I'm sorry, I encountered an issue generating a response.";
    } catch (error) {
      console.error("API Error:", error);
      return "API Error details: " + (error instanceof Error ? error.message : JSON.stringify(error));
    }
  }
}

export const gemini = new GeminiService();
