import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI ;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is missing from .env");
}

// Use a global variable to prevent multiple connections in development
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn) {
    console.log("Using existing MongoDB connection");
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI).then((m) => m.connection);
  }

  try {
    cached.conn = await cached.promise;
    console.log("MongoDB connected");
    return cached.conn;
  } catch (error) {
    cached.promise = null;
    console.error("MongoDB connection failed:", error);
    throw error;
  }
};
connectDB();
// Export the function to be used in Next.js server components
export default connectDB;
