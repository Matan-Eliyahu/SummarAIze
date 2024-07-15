import path from "path";
import fs from "fs";
import { AssemblyAI, Transcript } from "assemblyai";

const client = new AssemblyAI({
  apiKey: process.env.API_KEY_ASSEMBLYAI,
});

interface TranscriptionData {
  audio_url: string;
  language_detection: boolean;
}

async function transcribeAudio(audioFilePath: string, userId: string, fileName: string) {
  const data: TranscriptionData = {
    audio_url: audioFilePath,
    language_detection: true,
  };

  try {
    const transcript: Transcript = await client.transcripts.create(data);
    const name = `${fileName}.txt`;
    const outputPath = path.join(__dirname, "..", "..", "transcribe", userId, "audio", name);

    // Ensure directory exists
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(outputPath, transcript.text);
    console.log(`Transcription saved to ${outputPath}`);
    return transcript.text;
  } catch (error) {
    console.error("Error:", error);
  }
}

export default transcribeAudio;
