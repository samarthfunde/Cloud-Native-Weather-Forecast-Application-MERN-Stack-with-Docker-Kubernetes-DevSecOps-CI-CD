import mongoose from "mongoose";

const connectDB = async () => {
  while (true) {
    try {
      await mongoose.connect(process.env.MONGO_URI);
      console.log("MongoDB connected");
      break;
    } catch (err) {
      console.log("Mongo not ready, retrying in 5 seconds...");
      await new Promise((res) => setTimeout(res, 5000));
    }
  }
};

export default connectDB;
