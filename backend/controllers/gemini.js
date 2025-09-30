require("dotenv").config();
const axios = require("axios");

exports.handleGemini = async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    // Ensure payload matches Gemini API requirements
    const payload = req.body.contents
      ? req.body
      : {
          contents: [
            {
              parts: [{ text: req.body.message || "Hello from Gemini!" }],
            },
          ],
        };
    const response = await axios.post(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": apiKey,
        },
      }
    );
    // Extract main text answer from Gemini response
    const mainText =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text || null;
    res.json({
      model: "gemini",
      message: payload.contents,
      answer: mainText,
      raw: response.data,
    });
  } catch (error) {
    res.status(500).json({
      error: "Gemini API error",
      details: error.response ? error.response.data : error.message,
    });
  }
};
