const express = require("express");
const router = express.Router();
const handleGroqLlama = require("../controllers/GroqLlama");

router.post("/", handleGroqLlama.handleGroqLlama);

module.exports = router;
