import path from "path";
import fs from "fs";
import http from "https";

export const summOutputPath: string = path.join(__dirname, "..", "..", "public","summary");

async function summarize(textToSummarize: string, summaryAdjustment?: string): Promise<string> {
  return new Promise((resolve, reject) => {
    // HTTP request options
    const options = {
      method: "POST",
      hostname: "open-ai21.p.rapidapi.com",
      port: null,
      path: "/chatgpt",
      headers: {
        "content-type": "application/json",
        "X-RapidAPI-Key": process.env.API_KEY_RAPID,
        "X-RapidAPI-Host": "open-ai21.p.rapidapi.com",
      },
    };

    // HTTP request
    const req = http.request(options, function (res) {
      const chunks = [];

      res.on("data", function (chunk) {
        chunks.push(chunk);
      });

      res.on("end", function () {
        const body = Buffer.concat(chunks);
        const jsonObject = JSON.parse(body.toString());
        const resultText = jsonObject.result;
        resolve(resultText); // Resolve with the response text
      });
    });

    // Handle request error
    req.on("error", function (err) {
      reject(err);
    });

    // Write data to request body
    req.write(
      JSON.stringify({
        messages: [
          {
            role: "user",
            content: `Only the summarize of this text in your response: ${summaryAdjustment ? `${textToSummarize}\n\nsummaryAdjustment: ${summaryAdjustment}` : textToSummarize}`,
          },
        ],
        web_access: false,
      })
    );

    req.end(); // End the request
  });
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

async function transcribeSummary(textToSummarize: string, userId: string, fileName: string, fileType: string, summaryAdjustment?: string): Promise<string> {
  const name = `${fileName}.txt`;
  const outputPath: string = path.join(summOutputPath, userId, fileType, name);

  try {
    const summarizedText = await summarize(textToSummarize, summaryAdjustment);
    await saveTextToFile(summarizedText, outputPath);
    console.log("Text has been summarized and saved successfully.");
    return summarizedText; // Return the extracted text
  } catch (error) {
    console.error("Error:", error);
    throw error; // Rethrow the error
  }
}

export default transcribeSummary;
