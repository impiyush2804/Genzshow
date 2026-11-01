
import "dotenv/config";

import express from "express";
import cors from "cors";
import { clerkMiddleware } from "@clerk/express";
import { serve } from "inngest/express";

import connectDB from "./configs/db.js";

import showRouter from "./routes/showRoutes.js";
import userRouter from "./routes/userRoutes.js";
import adminRouter from "./routes/adminRoutes.js";
import bookingRouter from "./routes/bookingRoutes.js";
import theatreRouter from "./routes/theatreRoutes.js";
import recommendationRouter from "./routes/recommendationRoutes.js";
import movieDNARouter from "./routes/movieDNARoutes.js";

import { stripeWebhooks } from "./controllers/stripeWebhookController.js";
import { inngest, functions } from "./inngest/index.js";

const app = express();

const PORT = process.env.PORT || 3000;

// ============================================================
// CORS
// ============================================================

app.use(
    cors({
        origin: [
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            process.env.FRONTEND_URL,
        ].filter(Boolean),

        credentials: true,

        methods: [
            "GET",
            "POST",
            "PUT",
            "PATCH",
            "DELETE",
            "OPTIONS",
        ],

        allowedHeaders: [
            "Content-Type",
            "Authorization",
            "stripe-signature",
        ],
    })
);

// ============================================================
// DATABASE CONNECTION MIDDLEWARE
// Connect to MongoDB before accessing database operations.
// Uses the cached connection from configs/db.js.
// ============================================================

app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (error) {
        console.error(
            "❌ MongoDB request connection error:",
            error.message
        );

        return res.status(503).json({
            success: false,
            message: "Database temporarily unavailable",
        });
    }
});

// ============================================================
// STRIPE WEBHOOK
// IMPORTANT: Must be before express.json().
// Stripe requires the original raw request body.
// ============================================================

app.post(
    "/api/stripe/webhook",
    express.raw({
        type: "application/json",
    }),
    stripeWebhooks
);

// ============================================================
// BODY PARSERS
// ============================================================

app.use(express.json());

app.use(
    express.urlencoded({
        extended: true,
    })
);

// ============================================================
// INNGEST ENDPOINT
// ============================================================

app.use(
    "/api/inngest",
    serve({
        client: inngest,
        functions,
    })
);

// ============================================================
// CLERK MIDDLEWARE
// ============================================================

app.use(clerkMiddleware());

// ============================================================
// HEALTH CHECK
// ============================================================

app.get("/", (req, res) => {
    return res.status(200).json({
        success: true,
        message: "GenZShow server is running",
        database:
            "MongoDB connection middleware executed",
    });
});

// ============================================================
// API ROUTES
// ============================================================

app.use("/api/show", showRouter);

app.use("/api/user", userRouter);

app.use("/api/admin", adminRouter);

app.use("/api/booking", bookingRouter);

app.use("/api/theatre", theatreRouter);

app.use("/api/recommendation", recommendationRouter);

app.use("/api/movie-dna", movieDNARouter);

// ============================================================
// 404 HANDLER
// ============================================================

app.use((req, res) => {
    return res.status(404).json({
        success: false,
        message: `Route not found: ${req.method} ${req.originalUrl}`,
    });
});

// ============================================================
// GLOBAL ERROR HANDLER
// ============================================================

app.use((error, req, res, next) => {
    console.error("❌ SERVER ERROR:", error);

    if (res.headersSent) {
        return next(error);
    }

    return res.status(error?.status || 500).json({
        success: false,
        message:
            error?.message || "Internal server error",
    });
});

// ============================================================
// VERCEL SERVERLESS EXPORT
// ============================================================

export default app;

// ============================================================
// LOCAL DEVELOPMENT SERVER
// Vercel handles the exported Express application.
// Locally, start Express normally.
// ============================================================

if (!process.env.VERCEL) {
    const startServer = async () => {
        try {
            await connectDB();

            app.listen(PORT, () => {
                console.log(
                    `🚀 GenZShow server running on http://localhost:${PORT}`
                );
            });
        } catch (error) {
            console.error(
                "❌ Failed to start GenZShow:",
                error
            );

            process.exitCode = 1;
        }
    };

    startServer();
}
