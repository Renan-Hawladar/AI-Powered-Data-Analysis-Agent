import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

export class LLMClient {
  private provider: 'openai' | 'gemini';
  private apiKey: string;
  private model: string;
  private openaiClient?: OpenAI;
  private geminiClient?: GoogleGenerativeAI;

  constructor(provider: 'openai' | 'gemini', apiKey: string, model: string) {
    this.provider = provider;
    this.apiKey = apiKey;
    this.model = model;

    if (provider === 'openai') {
      this.openaiClient = new OpenAI({
        apiKey,
        dangerouslyAllowBrowser: true,
      });
    } else {
      this.geminiClient = new GoogleGenerativeAI(apiKey);
    }
  }

  async generateText(prompt: string): Promise<string> {
    if (this.provider === 'openai' && this.openaiClient) {
      const response = await this.openaiClient.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
      });

      return response.choices[0]?.message?.content || '';
    } else if (this.provider === 'gemini' && this.geminiClient) {
      const model = this.geminiClient.getGenerativeModel({
        model: this.model,
      });

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      return text;
    }

    throw new Error('LLM client not initialized');
  }

  async generateJSON<T>(prompt: string): Promise<T> {
    const jsonPrompt = `${prompt}

IMPORTANT: Return only valid JSON, no markdown formatting or code blocks. Start directly with { or [`;

    const text = await this.generateText(jsonPrompt);

    const jsonMatch = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.error('Raw response:', text);
      throw new Error('Failed to extract JSON from response');
    }

    return JSON.parse(jsonMatch[0]);
  }
}
