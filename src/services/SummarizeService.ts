import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;
const aiModel = process.env.GEMINI_MODEL;
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: aiModel });

class SummarizeService {
  async summarize(text: string, adjustment?: string): Promise<string> {
    const prompt = this.generateSummarizePrompt(text);
    const result = await model.generateContent(prompt);
    const textResponse = result.response.text();

    return textResponse.trim();
  }

  private generateSummarizePrompt(text: string): string {
    const prompt = `Could you please summarize this text? ${text}`;
    return prompt;
  }
}

export default new SummarizeService();
