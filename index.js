import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const app = express().use(bodyParser.json());
app.listen(process.env.PORT || 3007, () => console.log("webhook is listening"));

const sendMessage = async ({ phone_number_id, from, msg_body }) => {
  try {
    const responseFromRetune = await axios.post(
      `https://retune.so/api/chat/${process.env.CHAT_ID}/response`,
      {
        threadId: "11edbb38-23fb-ca60-815a-29bf52a422ea",
        input: msg_body,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "X-Retune-API-Key": process.env.RETUNE_API_KEY,
        },
      }
    );
    const value = responseFromRetune.data.response.value;

    await axios.post(
      `https://graph.facebook.com/v15.0/${phone_number_id}/messages`,
      {
        messaging_product: "whatsapp",
        to: from,
        text: { body: value },
      },
      {
        headers: {
          Authorization: "Bearer " + process.env.WHATSAPP_TOKEN,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error(error);
  }
};

app.post("/webhook", async (req, res) => {
  const changes = req.body.entry[0].changes[0];
  const messages = changes.value.messages[0];
  if (req.body.object) {
    if (messages) {
      const phone_number_id = changes.value.metadata.phone_number_id;
      const from = messages.from;
      const msg_body = messages.text.body;

      await sendMessage({ phone_number_id, from, msg_body });
    }
    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
});

app.get("/webhook", (req, res) => {
  const verify_token = process.env.VERIFY_TOKEN;
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token) {
    if (mode === "subscribe" && token === verify_token) {
      console.log("WEBHOOK_VERIFIED");
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  }
});
