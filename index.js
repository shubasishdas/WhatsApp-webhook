const express = require("express");
const bodyParser = require("body-parser");

const app = express();
const port = 3000;

app.use(bodyParser.json());

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
