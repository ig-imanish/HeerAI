require("dotenv").config();
const { Groq } = require("groq-sdk");

exports.handleGroq = async (req, res) => {
  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const payload =
      req.body.messages && req.body.model
        ? req.body
        : {
            messages: [{ role: "user", content: req.body.message || "" }],
            model: "openai/gpt-oss-120b",
            temperature: 1,
            max_completion_tokens: 8192,
            top_p: 1,
            stream: false, // Set to false for HTTP response, true for advanced streaming
            reasoning_effort: "medium",
            stop: null,
          };
    const chatCompletion = await groq.chat.completions.create(payload);
    // If streaming, handle differently (not implemented here)
    res.json({
      model: "groq",
      message: payload.messages,
      response: chatCompletion,
    });
  } catch (error) {
    res.status(500).json({
      error: "Groq API error",
      details: error.response ? error.response.data : error.message,
    });
  }
};
