import keywords from "./keywords";

const textarea = document.getElementById("prompt");
const sendButton = document.getElementById("sendButton");

textarea.addEventListener("input", function () {
  this.style.height = "auto";
  this.style.height = Math.min(this.scrollHeight, 200) + "px";

  if (this.value.trim()) {
    sendButton.classList.add("active");
  } else {
    sendButton.classList.remove("active");
  }
});

textarea.addEventListener("keydown", function (e) {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    fetchResponses();
  }
});

async function fetchResponses() {
  const prompt = document.getElementById("prompt").value.trim();
  if (!prompt) {
    textarea.style.animation = "shake 0.3s ease-in-out";
    setTimeout(() => (textarea.style.animation = ""), 300);
    return;
  }

  const loading = document.getElementById("loading");
  const error = document.getElementById("error");
  const responses = document.getElementById("responses");

  sendButton.disabled = true;
  sendButton.style.opacity = "0.5";

  loading.style.display = "block";
  error.style.display = "none";
  responses.style.display = "none";

  try {
    const [geminiRes, llamaRes, chatgptRes] = await Promise.all([
      fetch("http://localhost:3000/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: prompt }),
      }),
      fetch("http://localhost:3000/api/llama", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: prompt }),
      }),
      fetch("http://localhost:3000/api/openai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: prompt }),
      }),
    ]);

    const [geminiData, llamaData, chatgptData] = await Promise.all([
      geminiRes.json(),
      llamaRes.json(),
      chatgptRes.json(),
    ]);

    displayResponse(
      "gemini",
      geminiData.answer ||
        geminiData.response?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "No response"
    );
    displayResponse(
      "llama",
      llamaData.answer ||
        llamaData.response?.choices?.[0]?.message?.content ||
        "No response"
    );
    displayResponse(
      "chatgpt",
      chatgptData.answer ||
        chatgptData.response?.choices?.[0]?.message?.content ||
        "No response"
    );
  } catch (err) {
    error.textContent = "Error fetching responses: " + err.message;
    error.style.display = "block";
  } finally {
    loading.style.display = "none";
    responses.style.display = "grid";

    sendButton.disabled = false;
    sendButton.style.opacity = "";
  }
}

function displayResponse(elementId, content) {
  const element = document.querySelector(`#${elementId} .response-content`);

  const processedContent = highlightCodeBlocks(content);
  element.innerHTML = processedContent;
}

function highlightCodeBlocks(text) {
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;

  return text.replace(codeBlockRegex, (match, language, code) => {
    const lang = language || "text";
    const highlightedCode = highlightSyntax(code.trim(), lang);
    return `<div class="code-block ${lang}" data-language="${lang}">${highlightedCode}</div>`;
  });
}

function highlightSyntax(code, language) {
  const langKeywords = keywords[language] || [];

  code = code.replace(
    /(["'`])((?:(?!\1)[^\\]|\\.)*)(\1)/g,
    '<span class="string">$1$2$3</span>'
  );

  code = code.replace(
    /(\/\/.*$|\/\*[\s\S]*?\*\/|#.*$)/gm,
    '<span class="comment">$1</span>'
  );

  code = code.replace(/\b(\d+(?:\.\d+)?)\b/g, '<span class="number">$1</span>');

  langKeywords.forEach((keyword) => {
    const regex = new RegExp(`\\b${keyword}\\b`, "g");
    code = code.replace(regex, `<span class="keyword">${keyword}</span>`);
  });

  code = code.replace(
    /\b(true|false|True|False|TRUE|FALSE)\b/g,
    '<span class="boolean">$1</span>'
  );

  code = code.replace(
    /\b(null|undefined|NULL|nil|None)\b/g,
    '<span class="null">$1</span>'
  );

  code = code.replace(
    /([+\-*/%=<>!&|^~])/g,
    '<span class="operator">$1</span>'
  );

  code = code.replace(/([(){}[\]])/g, '<span class="bracket">$1</span>');

  return code;
}

const style = document.createElement("style");
style.textContent = `
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
      `;
document.head.appendChild(style);
