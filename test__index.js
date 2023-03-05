const express = require("express");
const bodyParser = require("body-parser");

require("dotenv").config();

const app = express();
const port = 3000;
const token = process.env.VERIFY_TOKEN;

app.use(bodyParser.json());

console.log(process.env);

// app.get("/", (req, res) => {
//   res.send("Hello World!");
// });

// const accountSid = process.env.TWILIO_ACCOUNT_SID;
// const authToken = process.env.TWILIO_AUTH_TOKEN;
// const client = require("twilio")(accountSid, authToken);

// client.messages
//   .create({
//     from: "whatsapp:+14155238886",
//     body: "Hello there!",
//     to: "whatsapp:+8801789136559",
//   })
//   .then((message) => console.log(message.sid));

app.get("/webhooks", (req, res) => {
  if (
    req.query["hub.mode"] == "subscribe" &&
    req.query["hub.verify_token"] == token
  ) {
    res.send(req.query["hub.challenge"]);
  } else {
    res.sendStatus(400);
  }
});

app.post("/webhook", (req, res) => {
  // Extract relevant data from incoming message
  const message = req.body.messages[0];
  const from = message.from;
  const text = message.text;

  // Process incoming message
  console.log(`Received message from ${from}: ${text}`);
  // Send automated response
  const response = {
    to: from,
    type: "text",
    text: "Thank you for your message!",
  };
  // TODO: Send response using the WhatsApp Business API

  // Send response back to client
  res.send("Received a webhook event!");
});

app.listen(port, () => {
  console.log(`Webhook server listening at http://localhost:${port}`);
});
