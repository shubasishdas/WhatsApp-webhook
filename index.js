import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const app = express().use(bodyParser.json());
app.listen(process.env.PORT || 3007, () =>
  console.log("webhook is listening at port : ", process.env.PORT)
);

const sendMessage = async ({ phone_number_id, from, msg_body }) => {
  try {
    const response1 = await axios.post(
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
    const value = response1.data.response.value;

    await axios.post(
      "https://graph.facebook.com/v15.0/113349255023563/messages",
      {
        messaging_product: "whatsapp",
        to: "8801789136559",
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
  let body = req.body;
  console.log(JSON.stringify(req.body, null, 2), "log_001");
  if (req.body.object) {
    if (
      req.body.entry &&
      req.body.entry[0].changes &&
      req.body.entry[0].changes[0] &&
      req.body.entry[0].changes[0].value.messages &&
      req.body.entry[0].changes[0].value.messages[0]
    ) {
      let phone_number_id =
        req.body.entry[0].changes[0].value.metadata.phone_number_id;
      let from = req.body.entry[0].changes[0].value.messages[0].from;
      let msg_body = req.body.entry[0].changes[0].value.messages[0].text.body;

      await sendMessage({ phone_number_id, from, msg_body });
    }

    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
});

app.get("/webhook", (req, res) => {
  const verify_token = process.env.VERIFY_TOKEN;
  let mode = req.query["hub.mode"];
  let token = req.query["hub.verify_token"];
  let challenge = req.query["hub.challenge"];

  if (mode && token) {
    if (mode === "subscribe" && token === verify_token) {
      console.log("WEBHOOK_VERIFIED");
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  }
});
