import mongoose from "mongoose";

const connectDB = async () => {
  const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/socialmedia";
  try {
    const conn = await mongoose.connect(uri);
    console.log("MongoDB connected", conn.connection.host);
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
};

export default connectDB;
