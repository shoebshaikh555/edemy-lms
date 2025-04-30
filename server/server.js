import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./configs/mongodb.js";
import { clerkWebhooks } from "./controllers/webhooks.js";
import { verifyWebhook } from "@clerk/express/webhooks";

// Initialize Express
const app = express();

// Connect to database
await connectDB();

// Middlewares
app.use(cors());

// Routes
app.get("/", (req, res) => res.send("API Working"));
app.post(
  "/clerk",
  // express.json(),
  express.raw({ type: "application/json" }),
  clerkWebhooks
);
// app.post(
//   "/clerk",
//   express.raw({ type: "application/json" }),
//   async (req, res) => {
//     try {
//       const evt = await verifyWebhook(req);

//       // Do something with payload
//       // For this guide, log payload to console
//       const { id } = evt.data;
//       const eventType = evt.type;
//       console.log(
//         `Received webhook with ID ${id} and event type of ${eventType}`
//       );
//       console.log("Webhook payload:", evt.data);

//       return res.send("Webhook received");
//     } catch (err) {
//       console.error("Error verifying webhook:", err);
//       return res.status(400).send("Error verifying webhook");
//     }
//   }
// );

// Port
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
