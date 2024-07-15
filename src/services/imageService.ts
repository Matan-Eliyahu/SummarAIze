import path from "path";
import fs from "fs";
import { ImageAnnotatorClient } from "@google-cloud/vision";
import { transOutputPath } from "./audioService";

async function transcribeImage(imagePath: string, userId: string, fileName: string): Promise<string> {
  // Specify the location of the api endpoint and the API key
  const clientOptions = {
    apiEndpoint: "eu-vision.googleapis.com",
    keyFilename: path.join(__dirname, "..", "..", "src", "assets", "cred.json"), // Replace with the actual path to your service account JSON file
  };

  // Creates a client with specified options
  const client = new ImageAnnotatorClient(clientOptions);

  try {
    // Performs text detection on the image file
    const [result] = await client.textDetection(imagePath);
    const labels = result.textAnnotations;
    const text = labels[0].description;

    // Generate a unique filename for the transcript text file
    const name = `${fileName}.txt`;

    // Specify the output path for the transcript text file
    const outputPath = path.join(transOutputPath, userId, "image", name);

    // Create the directory if it doesn't exist
    if (!fs.existsSync(path.dirname(outputPath))) {
      fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    }

    // Write the recognized text to the transcript text file
    await fs.promises.writeFile(outputPath, text);
    console.log("Recognized text saved to", outputPath);

    // Return the extracted text
    return text;
  } catch (err) {
    console.error("Error:", err);
    throw err;
  }
}

export default transcribeImage;
