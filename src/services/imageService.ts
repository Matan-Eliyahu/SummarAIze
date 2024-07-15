import path from "path";
import { ImageAnnotatorClient } from "@google-cloud/vision";
import { FileToTextConverter } from "../common/types";

const clientOptions = {
  apiEndpoint: "eu-vision.googleapis.com",
  keyFilename: path.join(__dirname, "..", "config", "visionConfig.json"),
};
const ImageAnnotator = new ImageAnnotatorClient(clientOptions);

class ImageService implements FileToTextConverter {

  async convertToText(file: Express.Multer.File): Promise<string> {
    try {
      const [result] = await ImageAnnotator.textDetection(file.path);
      const text = result.textAnnotations[0].description;
      return text;
    } catch (error) {
      throw error;
    }
  }
}

export default new ImageService();
