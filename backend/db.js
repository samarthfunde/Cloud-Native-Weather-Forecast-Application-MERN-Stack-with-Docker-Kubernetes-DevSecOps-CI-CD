// backend/db.js
//for the running mongodb start the mongodb win + r "services.msc" and find the mongodb and start it
import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/weatherApp");
    console.log("MongoDB Connected ✅");
  } catch (error) {
    console.error("MongoDB Error ❌", error);
    process.exit(1);
  }
};

export default connectDB;
