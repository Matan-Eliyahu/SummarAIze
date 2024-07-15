import path from "path";
import fs from "fs";
import pdf from "pdf-parse";
import { detect } from "langdetect";
import { transOutputPath } from "./audioService";

async function convertPDFToText(pdfPath: string): Promise<string> {
  try {
    const data = fs.readFileSync(pdfPath);
    const pdfText = await pdf(data);

    // Detect the language of the text
    const detections = detect(pdfText.text);
    // Check if there are any language detections
    if (detections.length > 0) {
      // Get the language code of the first detection
      const lang = detections[0].lang;
      // Check if the language is English (en)
      if (lang === "he") {
        // Reverse the order of words in each line
        const reversedText = pdfText.text
          .split("\n")
          .map((line) => line.split(" ").reverse().join(" "))
          .join("\n");

        return reversedText;
      }
    }

    // If no language was detected or the language is not English, return the text as is
    return pdfText.text;
  } catch (error) {
    throw new Error(`Error converting PDF to text: ${error}`);
  }
}

async function saveTextToFile(text: string, outputPath: string): Promise<void> {
  try {
    // Extract directory path from the outputPath
    const directoryPath = path.dirname(outputPath);

    // Create directory if it doesn't exist
    if (!fs.existsSync(directoryPath)) {
      fs.mkdirSync(directoryPath, { recursive: true });
    }

    // Save text to file
    fs.writeFileSync(outputPath, text);
    console.log(`Text saved to '${outputPath}' successfully.`);
  } catch (error) {
    throw new Error(`Error saving text to file: ${error}`);
  }
}

async function transcribePDF(pdfPath: string, userId: string, fileName: string): Promise<string> {
  const name = `${fileName}.txt`;
  console.log(name);
  const outputPath: string = path.join(transOutputPath, userId, "pdf", name);
  try {
    const text = await convertPDFToText(pdfPath);
    await saveTextToFile(text, outputPath);
    console.log("PDF converted to text and saved successfully.");
    return text; // Return the extracted text
  } catch (error) {
    console.error("Error:", error);
    throw error; // Rethrow the error
  }
}

export default transcribePDF;
