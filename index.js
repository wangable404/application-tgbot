require("dotenv").config();
const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

const {
  TELEGRAM_BOT_TOKEN,
  RELAY_SECRET,
  TG_BACKEND_URL,
  MAX_BACKEND_URL,
  PORT = 3000,
} = process.env;

const TG_API = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;
const MAX_API = "https://platform-api2.max.ru";

app.post("/tg/webhook", async (req, res) => {
  try {
    const response = await axios.post(TG_BACKEND_URL, req.body, {
      headers: { "x-relay-secret": RELAY_SECRET },
      timeout: 8000,
    });
  } catch (err) {
    console.log("forward to main backend failed:", err.message);
  }
  res.sendStatus(200);
});

app.post("/tg/send", async (req, res) => {
  const { secret, chatId, text } = req.body;

  if (secret !== RELAY_SECRET) {
    return res.status(403).json({ error: "forbidden" });
  }

  try {
    const response = await axios.post(`${TG_API}/sendMessage`, {
      chat_id: chatId,
      text,
      parse_mode: "HTML",
    });
    res.json(response.data);
  } catch (err) {
    console.log(
      "telegram sendMessage error:",
      err.response?.data || err.message,
    );
    res.status(500).json({ error: err.message });
  }
});

app.post("/max/webhook", async (req, res) => {
  try {
    console.log(MAX_BACKEND_URL,'asdasa');
    console.log(RELAY_SECRET,'asdasa222');
    console.log(req.body);
    
    
    const response = await axios.post(MAX_BACKEND_URL, req.body, {
      headers: { "x-max-bot-api-secret": RELAY_SECRET },
      timeout: 8000,
    });
  } catch (err) {
    console.log("forward to main backend failed:", err.message);
  }
  res.sendStatus(200);
});

app.post("/max/send", async (req, res) => {
  const { secret, text, chatId } = req.body;

  if (secret !== RELAY_SECRET) {
    return res.status(403).json({ error: "forbidden" });
  }
  await axios.post(
    `${MAX_API}/messages`,
    { text },
    {
      params: { chat_id },
      headers: { Authorization: TOKEN, "Content-Type": "application/json" },
    },
  );
});

app.get("/", (req, res) => res.send("relay is alive"));

app.listen(PORT, () => console.log(`relay started on port ${PORT}`));
