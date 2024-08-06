import { GoogleGenerativeAI } from "@google/generative-ai";
import { Language } from "../common/types";

const apiKey = process.env.GEMINI_API_KEY;
const aiModel = process.env.GEMINI_MODEL;
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: aiModel });

export interface ISummaryOptions {
  length: "short" | "medium" | "long";
  language: Language;
  tone: "formal" | "informal" | "neutral";
  detailLevel: "high" | "medium" | "low";
  keywords: string[];
}

class SummarizeService {
  async summarize(text: string, options: ISummaryOptions): Promise<string> {
    const prompt = this.generateSummarizePrompt(text,options);
    const result = await model.generateContent(prompt);
    const textResponse = result.response.text();

    return textResponse.trim();
  }

  private generateSummarizePrompt(text: string, options: ISummaryOptions): string {
    const { length, language, tone, detailLevel, keywords } = options;

    let prompt = `Could you summarize this text with paragraphs and no titles, text only. `;

    // Add length to the prompt
    prompt += `Summary length should be ${length}. `;

    // Add language to the prompt
    if (language !== "auto") {
      prompt += `The summary should be in ${language}. `;
    }

    // Add tone to the prompt
    prompt += `The tone should be ${tone}. `;

    // Add detail level to the prompt
    prompt += `Detail level should be ${detailLevel}. `;

    // Add keywords to the prompt if there are any
    if (keywords.length > 0) {
      prompt += `Focus on the following keywords: ${keywords.join(", ")}. `;
    }

    // Append the actual text
    prompt += `Here is the text: ${text}`;

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
