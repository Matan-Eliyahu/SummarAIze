import { ImageAnnotatorClient } from "@google-cloud/vision";
import { FileToTextConverter } from "../common/types";

const clientOptions = {
  apiEndpoint: "eu-vision.googleapis.com",
  credentials: {
    type: process.env.GOOGLE_VISION_TYPE,
    project_id: process.env.GOOGLE_VISION_PROJECT_ID,
    private_key_id: process.env.GOOGLE_VISION_PRIVATE_KEY_ID,
    private_key: process.env.GOOGLE_VISION_PRIVATE_KEY.replace(/\\n/g, "\n"),
    client_email: process.env.GOOGLE_VISION_CLIENT_EMAIL,
    client_id: process.env.GOOGLE_VISION_CLIENT_ID,
    auth_uri: process.env.GOOGLE_VISION_AUTH_URI,
    token_uri: process.env.GOOGLE_VISION_TOKEN_URI,
    auth_provider_x509_cert_url: process.env.GOOGLE_VISION_AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: process.env.GOOGLE_VISION_CLIENT_X509_CERT_URL,
    universe_domain: process.env.GOOGLE_VISION_UNIVERSE_DOMAIN,
  },
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
