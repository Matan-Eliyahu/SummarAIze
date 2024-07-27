import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;
const aiModel = process.env.GEMINI_MODEL;
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: aiModel });

export interface ISummaryOptions {
  length: "short" | "medium" | "long";
  language: "auto";
}

class SummarizeService {
  async summarize(text: string, options?: ISummaryOptions): Promise<string> {
    const prompt = this.generateSummarizePrompt(text);
    const result = await model.generateContent(prompt);
    const textResponse = result.response.text();

    return textResponse.trim();
  }

  private generateSummarizePrompt(text: string): string {
    const prompt = `Could you summarize this text with paragraphs and no titles, text only - ${text}`;
    return prompt;
  }

  async extractKeywordsAndTitle(transcribe: string): Promise<{ keywords: string[]; title: string }> {
    const prompt = `
      Extract a title and a list of keywords from the following text. Please provide the output in the exact format specified below:
  
      Title: [title]
      Keywords: [keyword1], [keyword2], [keyword3], ...
  
      Text:
      ${transcribe}
    `;

    try {
      const result = await model.generateContent(prompt);
      const textResponse = result.response.text();

      // console.log(textResponse);

      // Extract title and keywords from the response text
      const titleMatch = textResponse.match(/^Title:\s*(.+?)\s*$/m);
      const keywordsMatch = textResponse.match(/^Keywords:\s*(.+?)\s*$/m);

      const title = titleMatch ? titleMatch[1].trim() : "Untitled";
      const keywords = keywordsMatch
        ? keywordsMatch[1]
            .split(/,\s*/)
            .map((keyword) => keyword.trim())
            .filter(Boolean)
        : [];

      // Ensure consistent and reliable output
      if (!title) {
        console.error("Title extraction failed");
      }

      if (keywords.length === 0) {
        console.error("Keywords extraction failed");
      }

      return { keywords, title };
    } catch (error) {
      console.error("Error extracting keywords and title:", error);
      return { keywords: [], title: "Untitled" }; // Return fallback values in case of error
    }
  }
}

export default new SummarizeService();
