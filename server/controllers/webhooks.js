import { Webhook } from "svix";
import { buffer } from "micro";
import mongoose from "mongoose";
import User from "../models/User.js";

// API Controller function to manage Clerk user with database

export const clerkWebhooks = async (req, res) => {
  try {
    const rawBody = (await buffer(req)).toString();
    const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);
    // Verify the headers
    // await whook.verify(JSON.stringify(req.body), {
    //   "svix-id": req.headers["svix-id"],
    //   "svix-timestamp": req.headers["svix-timestamp"],
    //   "svix-signature": req.headers["svix-signature"],
    // });
    // const { data, type } = req.body;

    const evt = whook.verify(rawBody, {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"],
    });

    const { data, type } = evt;

    // Connect to MongoDB
    if (!mongoose.connection.readyState) {
      await mongoose.connect(process.env.MONGODB_URI);
    }

    switch (type) {
      case "user.created": {
        const userData = {
          _id: data.id,
          email: data.email_addresses[0].email_address,
          name: data.first_name + " " + data.last_name,
          imageUrl: data.image_url,
        };
        await User.create(userData);
        res.status(200).json({ success: true });
        // res.json({});
        break;
      }
      case "user.updated": {
        const userData = {
          email: data.email_addresses[0].email_address,
          name: data.first_name + " " + data.last_name,
          imageUrl: data.image_url,
        };
        await User.findByIdAndUpdate(data.id, userData);
        res.json({});
        break;
      }
      case "user.deleted": {
        await User.findByIdAndDelete(data.id);
        res.json({});
        break;
      }
      default:
        res.status(200).json({ received: true });
        break;
    }
  } catch (error) {
    // res.json({ success: false, message: error.message });
    console.error("Webhook error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
