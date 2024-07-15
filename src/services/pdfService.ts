import parsePdf from "pdf-parse";
import { detect } from "langdetect";
import fs from "fs";
import { FileToTextConverter } from "../common/types";
import { reverseText } from "../utils/text";

class PdfService implements FileToTextConverter {
  async convertToText(pdfFile: Express.Multer.File): Promise<string> {
    try {
      // Parse PDF to text
      const data = fs.readFileSync(pdfFile.path);
      const res = await parsePdf(data);
      const text = res.text;

      // Detect the language of the text
      const language = detect(text)[0].lang;

      if (language && language == "he") {
        // Reverse the order of words in each line
        const reversedText = reverseText(text);
        return reversedText;
      }
      return text;
    } catch (error) {
      throw error;
    }
  }
}

export default new PdfService();
