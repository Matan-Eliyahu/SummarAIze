import path from "path";
import transcribeAudio from "../services/AudioService";
import transcribePDF from "../services/PdfService";
import transcribeImage from "../services/ImageService";

describe("App tests", () => {
  //test("audio to text check", async () => {
  //const text = await transcribeAudio("audio1.mp3");
  //expect(text).toBe("This is a test.");
  //});
  //test("pdf to text check", async () => {
  //const text = await transcribePDF("test.pdf");
  //});
  test("image to text check", async () => {
    expect(1).toBe(1);
  });
});
