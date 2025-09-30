const express = require("express");
const router = express.Router();
const groqController = require("../controllers/groq");

router.post("/", groqController.handleGroq);

module.exports = router;
