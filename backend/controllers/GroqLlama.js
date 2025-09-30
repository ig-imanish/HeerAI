require("dotenv").config();
const { Groq } = require("groq-sdk");

exports.handleGroqLlama = async (req, res) => {
  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const payload = {
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      messages: req.body.messages || [
        { role: "user", content: req.body.message || "" },
      ],
      temperature: 1,
      max_completion_tokens: 1024,
      top_p: 1,
      stream: true,
      stop: null,
    };
    let result = "";
    const chatCompletion = await groq.chat.completions.create(payload);
    for await (const chunk of chatCompletion) {
      result += chunk.choices[0]?.delta?.content || "";
    }
    res.json({
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      message: payload.messages,
      answer: result,
    });
  } catch (error) {
    res.status(500).json({
      error: "Groq Llama API error",
      details: error.response ? error.response.data : error.message,
    });
  }
};
