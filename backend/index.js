const express = require("express");
const cors = require("cors");

const geminiRoutes = require("./routes/gemini");
const GroqLlama = require("./routes/GroqLlama");
const groqRoutes = require("./routes/groq");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/gemini", geminiRoutes);
app.use("/api/llama", GroqLlama);
app.use("/api/openai", groqRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
