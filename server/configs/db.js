import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

// Reuse the connection across Vercel serverless invocations.
let cached = globalThis.mongoose;

if (!cached) {
    cached = globalThis.mongoose = {
        conn: null,
        promise: null,
    };
}

const connectDB = async () => {
    if (cached.conn && mongoose.connection.readyState === 1) {
        return cached.conn;
    }

    if (!MONGODB_URI) {
        throw new Error("MONGODB_URI is not configured");
    }

    if (!cached.promise) {
        cached.promise = mongoose.connect(MONGODB_URI, {
            serverSelectionTimeoutMS: 15000,
            connectTimeoutMS: 15000,
        });
    }

    try {
        cached.conn = await cached.promise;

        console.log("✅ MongoDB connected successfully");

        return cached.conn;
    } catch (error) {
        cached.promise = null;
        cached.conn = null;

        console.error("❌ MongoDB connection failed:", error.message);

        throw error;
    }
};

export default connectDB;