const express = require("express");
const bodyParser = require("body-parser");
const app = express();

require("dotenv").config();

// Define your verify token here
// const VERIFY_TOKEN = "my_verify_token";
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

// Define your webhook endpoint URL here
const WEBHOOK_URL = `/webhook?verify_token=${VERIFY_TOKEN}`;

console.log(WEBHOOK_URL);

// Configure your server to listen for incoming requests on the webhook endpoint URL
app.get(WEBHOOK_URL, (req, res) => {
  console.log("get");
  // Extract the verify token from the request query parameters
  const queryToken = req.query.verify_token;

  // Check that the verify token matches the one you defined
  if (queryToken === VERIFY_TOKEN) {
    // If the verify token matches, respond with the challenge token
    const challenge = req.query.challenge;
    res.send(challenge);
  } else {
    // If the verify token doesn't match, respond with an error
    res.status(403).send("Invalid verify token");
  }
});

// Configure your server to process incoming event notifications
app.post(WEBHOOK_URL, (req, res) => {
  console.log("post");

  // Extract the event data from the request body
  const eventData = req.body;

  // Process the event data here
  console.log("Received event:", eventData);

  // Respond with a 200 OK status code to acknowledge receipt of the event
  res.sendStatus(200);
});

// Start your server
app.listen(3000, () => {
  console.log("Server listening on port 3000");
});
