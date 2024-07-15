import http from "https";

const RAPID_API_KEY = process.env.RAPID_API_KEY;

class SummarizeService {

  async summarize(text: string, adjustment?: string): Promise<string> {
    return new Promise((resolve, reject) => {
      // HTTP request options
      const options = {
        method: "POST",
        hostname: "open-ai21.p.rapidapi.com",
        port: null,
        path: "/chatgpt",
        headers: {
          "content-type": "application/json",
          "X-RapidAPI-Key": RAPID_API_KEY,
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
              content: `Only the summarize of this text in your response: ${adjustment ? `${text}\n\nsummaryAdjustment: ${adjustment}` : text}`,
            },
          ],
          web_access: false,
        })
      );

      req.end(); // End the request
    });
  }
}

export default new SummarizeService();
