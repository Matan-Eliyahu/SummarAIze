import { GoogleGenerativeAI } from "@google/generative-ai";
import { Language } from "../common/types";
import { IFolder } from "../models/FolderModel";
import { IFile } from "../models/FileModel";

const apiKey = process.env.GEMINI_API_KEY;
const aiModel = process.env.GEMINI_MODEL;
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export interface ISummaryOptions {
  length: "short" | "medium" | "long";
  language: Language;
  tone: "formal" | "informal" | "neutral";
  detailLevel: "high" | "medium" | "low";
  keywords: string[];
}

class TextService {
  async summarize(text: string, options: ISummaryOptions): Promise<string> {
    const prompt = this.generateSummarizePrompt(text, options);
    try {
      const result = await model.generateContent(prompt);
      const textResponse = result.response.text();
      return textResponse.trim();
    } catch (error) {
      console.log("~~~~ GoogleAI Error: ", error);
      throw error;
    }
  }

  private generateSummarizePrompt(text: string, options: ISummaryOptions): string {
    const { length, language, tone, detailLevel, keywords } = options;

    let prompt = `Could you summarize this please? `;

    prompt += `Summary length should be ${length}. `;

    if (language !== "auto") {
      prompt += `The summary must be in ${language}. `;
    } else {
      prompt += `The summary must be in the same language as the text.`;
    }

    prompt += `The tone should be ${tone}. `;

    prompt += `Detail level should be ${detailLevel}. `;

    if (keywords.length > 0) {
      prompt += `Focus on the following keywords: ${keywords.join(", ")}. `;
    }

    prompt += `Here is the text: ${text}`;

    return prompt;
  }

  async extractKeywordsAndTitle(transcribe: string): Promise<{ keywords: string[]; title: string }> {
    const prompt = `
      Extract a title and a list of *maximum 10* keywords from the following text. Please provide the output in the exact format specified below:
  
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

  async searchInFolder(folderFiles: IFile[], query: string): Promise<IFile[]> {
    const files = folderFiles.map((file) => ({
      _id: file._id,
      summary: file.summary,
    }));

    const filesJson = JSON.stringify(files);

    let prompt = `Could you find any matches for this query: "${query}"?\n`;
    prompt += `Here are the files as JSON objects: ${filesJson}\n`;
    prompt += `Please provide the answer as a JSON array of "_id" values or an empty array if there are no matches.`;

    try {
      const result = await model.generateContent(prompt);
      const textResponse = result.response.text();

      const matchedIds: string[] = JSON.parse(textResponse.trim().replace(/`|json|JSON/g, ""));

      const matchedFiles = folderFiles.filter((file) => matchedIds.includes(file._id.toString()));

      return matchedFiles;
    } catch (error) {
      console.error("~~~~ GoogleAI Error: ", error);
      throw error;
    }
  }
}

export default new TextService();
