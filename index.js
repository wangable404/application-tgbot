import express from "express";
import axios from "axios";

const app = express();
app.use(express.json());

const {
  TELEGRAM_BOT_TOKEN,
  RELAY_SECRET,
  MAIN_BACKEND_URL,
  PORT = 3000,
} = process.env;

const TG_API = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

app.post("/webhook", async (req, res) => {
  try {
    await axios.post(MAIN_BACKEND_URL, req.body, {
      headers: { "x-relay-secret": RELAY_SECRET },
      timeout: 8000,
    });
  } catch (err) {
    console.log("forward to main backend failed:", err.message);
  }
  res.sendStatus(200);
});

app.post("/send", async (req, res) => {
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

app.get("/", (req, res) => res.send("relay is alive"));

app.listen(PORT, () => console.log(`relay started on port ${PORT}`));
