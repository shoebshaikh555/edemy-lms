import { Webhook } from "svix";
import mongoose from "mongoose";
import User from "../models/User.js";

// API Controller function to manage Clerk user with database

export const clerkWebhooks = async (req, res) => {
  try {
    // console.log("Headers:", req.headers);
    // console.log("Body:", req.body.toString());
    const payload = req.body.toString("utf8"); // Convert raw buffer to string
    const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);
    // Verify the headers
    const evt = await whook.verify(payload, {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"],
    });

    // console.log("✅ Verified Clerk Webhook");
    // console.log("Event Type:", evt.type);
    // console.log("Event Data:", evt.data);

    // const { data, type } = req.body;
    const { data, type } = evt;
    // console.log("🚀 ~ clerkWebhooks ~ type:", type);
    switch (type) {
      case "user.created": {
        // console.log("IN CASE CREATED");
        const userData = {
          _id: data.id,
          email: data.email_addresses[0].email_address,
          name: data.first_name + " " + data.last_name,
          imageUrl: data.image_url,
        };
        // console.log("Creating user with data:", userData);
        try {
          if (mongoose.connection.readyState === 0) {
            await mongoose.connect(process.env.MONGODB_URI);
          }
          await User.create(userData);
          console.log("✅ User created successfully");
        } catch (err) {
          console.error("❌ Error creating user:", err.message);
        }
        // await User.create(userData);
        res.json({});
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
        break;
    }
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
