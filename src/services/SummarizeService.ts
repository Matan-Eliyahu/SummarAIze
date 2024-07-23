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
    const prompt = `summarize this text with paragraphs no titles, text only${text}`;
    return prompt;
  }

  async extractKeywordsAndTitle(transcribe: string): Promise<{ keywords: string[]; title: string }> {
    const prompt = `Extract keywords and generate a title from the following text. Provide the title and keywords in the following format:\n\nTitle: [title]\nKeywords: [keyword1], [keyword2], [keyword3], ...\n\nText:\n\n${transcribe}\n\nTitle:`;

    const result = await model.generateContent(prompt);
    const textResponse = result.response.text();

    // Extract title and keywords from the response text
    const titleMatch = textResponse.match(/Title: (.+)/);
    const keywordsMatch = textResponse.match(/Keywords: (.+)/);

    const title = titleMatch ? titleMatch[1].trim() : "";
    const keywords = keywordsMatch ? keywordsMatch[1].split(",").map((keyword) => keyword.trim()) : [];

    return { keywords, title };
  }
}

export default new SummarizeService();
