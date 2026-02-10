const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const EMAIL = "omjee1364.be23@chitkarauniversity.edu.in";

function fibonacci(n) {
  if (n <= 0) return [];
  if (n === 1) return [0];

  const series = [0, 1];
  while (series.length < n) {
    series.push(series[series.length - 1] + series[series.length - 2]);
  }
  return series;
}
function isPrime(num) {
  if (num < 2) return false;
  for (let i = 2; i * i <= num; i++) {
    if (num % i === 0) return false;
  }
  return true;
}
function hcf(a, b) {
  while (b !== 0) {
    [a, b] = [b, a % b];
  }
  return a;
}

function lcm(a, b) {
  return (a * b) / hcf(a, b);
}

async function askAI(question) {
  try {
    const apiKey = process.env.MY_SPECIAL_KEY;
    
    if (!apiKey) {
      throw new Error("MY_SPECIAL_KEY is missing in .env");
    }

    const url = "https://api.groq.com/openai/v1/chat/completions";

    const config = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey.trim()}`
      }
    };

    const data = {
      model: "openai/gpt-oss-120b", 
      messages: [
        { 
          role: "user", 
          content: question + " Answer in one single word." 
        }
      ]
    };

    const response = await axios.post(url, data, config);
        const text = response.data.choices[0].message.content;
        return text.trim().split(/\s+/)[0].replace(/[^\w]/g, "");

  } catch (error) {
    console.error("AI Error (Groq):", error.response?.data || error.message);
    
    
  }
}
app.get("/health", (req, res) => {
  res.status(200).json({
    is_success: true,
    official_email: EMAIL
  });
});

app.post("/bfhl", async (req, res) => {
  try {
    const body = req.body;

    if (!body || typeof body !== "object") {
      return res.status(400).json({
        is_success: false,
        message: "Invalid request body"
      });
    }

    const keys = Object.keys(body);

    if (keys.length !== 1) {
      return res.status(400).json({
        is_success: false,
        message: "Exactly one key is required"
      });
    }

    const key = keys[0];
    let result;

    switch (key) {
      case "fibonacci": {
        const n = body[key];
        if (!Number.isInteger(n) || n < 0) {
          return res.status(400).json({
            is_success: false,
            message: "Fibonacci input must be a non-negative integer"
          });
        }
        result = fibonacci(n);
        break;
      }

      case "prime": {
        const arr = body[key];
        if (!Array.isArray(arr)) {
          return res.status(400).json({
            is_success: false,
            message: "Prime input must be an array"
          });
        }
        result = arr.filter(
          (num) => Number.isInteger(num) && isPrime(num)
        );
        break;
      }

      case "hcf": {
        const arr = body[key];
        if (!Array.isArray(arr) || arr.length === 0) {
          return res.status(400).json({
            is_success: false,
            message: "HCF input must be a non-empty array"
          });
        }
        result = arr.reduce((a, b) => hcf(a, b));
        break;
      }

      case "lcm": {
        const arr = body[key];
        if (!Array.isArray(arr) || arr.length === 0) {
          return res.status(400).json({
            is_success: false,
            message: "LCM input must be a non-empty array"
          });
        }
        result = arr.reduce((a, b) => lcm(a, b));
        break;
      }

      case "AI": {
        const question = body[key];
        if (typeof question !== "string" || question.trim() === "") {
          return res.status(400).json({
            is_success: false,
            message: "AI input must be a string"
          });
        }
        result = await askAI(question);
        break;
      }

      default:
        return res.status(400).json({
          is_success: false,
          message: "Invalid key"
        });
    }

    res.status(200).json({
      is_success: true,
      official_email: EMAIL,
      data: result
    });
  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({
      is_success: false,
      message: "Internal server error"
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});