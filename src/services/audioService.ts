import { FileToTextConverter } from "../common/types";
import { AssemblyAI, TranscribeParams, Transcript } from "assemblyai";

const AssemblyAi = new AssemblyAI({
  apiKey: process.env.ASSEMBLYAI_API_KEY,
});

class AudioService implements FileToTextConverter {
  
  async convertToText(file: Express.Multer.File): Promise<string> {
    const options: TranscribeParams = {
      audio_url: file.path,
      language_detection: true,
    };
    try {
      const result: Transcript = await AssemblyAi.transcripts.create(options);
      const text = result.text;
      return text;
    } catch (error) {
      throw error;
    }
  }
}

export default new AudioService();
