import express from "express";
import cors from "cors";
import "dotenv/config";

import connectDB from "./configs/db.js";

import { clerkMiddleware } from "@clerk/express";

import { serve } from "inngest/express";
import { inngest, functions } from "./inngest/index.js";

import showRouter from "./routes/showRoutes.js";
import bookingRouter from "./routes/bookingRoutes.js";
import adminRouter from "./routes/adminRoutes.js";
import userRouter from "./routes/userRoutes.js";

import { stripeWebhooks } from "./controllers/stripeWebhooks.js";

const app = express();

const port = process.env.PORT || 3000;

// ===============================
// Database Connection
// ===============================
await connectDB();

// ===============================
// Stripe Webhook
// IMPORTANT: Must come before express.json()
// ===============================
app.use(
    "/api/stripe",
    express.raw({ type: "application/json" }),
    stripeWebhooks
);

// ===============================
// Middleware
// ===============================
app.use(express.json());

app.use(
    cors({
        origin: true,
        credentials: true,
    })
);

app.use(clerkMiddleware());

// ===============================
// Health Check
// ===============================
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "GenZ Show Server is Live!",
    });
});

// ===============================
// API Routes
// ===============================
app.use(
    "/api/inngest",
    serve({
        client: inngest,
        functions,
    })
);

app.use("/api/show", showRouter);

app.use("/api/booking", bookingRouter);

app.use("/api/admin", adminRouter);

app.use("/api/user", userRouter);

// ===============================
// 404 Handler
// ===============================
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "API route not found",
    });
});

// ===============================
// Error Handler
// ===============================
app.use((err, req, res, next) => {
    console.error("SERVER ERROR:", err);

    res.status(err.status || 500).json({
        success: false,
        message: err.message || "Internal Server Error",
    });
});

// ===============================
// Local Development
// ===============================
if (process.env.NODE_ENV !== "production") {
    app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
    });
}

// ===============================
// Vercel
// ===============================
export default app;