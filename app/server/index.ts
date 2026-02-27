
import "dotenv/config"; // loads .env before anything else runs

import { app } from "../settings/app.config.js";
import { userRouter } from "../routers/user.controller.js";
import express from "express";

import {
    connectRabbitMQ,
    disconnectRabbitMQ,
    startAuthConsumer,
    startPaymentConsumer,
    startWalletConsumer,
} from "../events/index.js";

// ── Middleware ────────────────────────────────────────────────
app.use(express.json());

// ── Routes ────────────────────────────────────────────────────
// All routes inside userRouter are accessible at /api/v1/...
// e.g. POST /api/v1/auth/register
app.use("/api/v1", userRouter);

// ── HTTP Port ─────────────────────────────────────────────────
const PORT = Number(process.env.PORT) || 3000;

// ─────────────────────────────────────────────────────────────
// SERVER BOOT
//
// Start order:
//   1. Connect to RabbitMQ (declares exchange + queues)
//   2. Register all domain consumers
//   3. Start the HTTP server
//
// If RabbitMQ is unavailable the server still boots — events will
// not be published/consumed, but HTTP traffic will be served.
// Change the catch block to `throw err` if you want hard failure.
// ─────────────────────────────────────────────────────────────
const start = async (): Promise<void> => {
    // ── Step 1: Connect to RabbitMQ ───────────────────────────
    try {
        await connectRabbitMQ();

        // ── Step 2: Start domain consumers ────────────────────
        await startAuthConsumer();
        await startPaymentConsumer();
        await startWalletConsumer();

    } catch (err) {
        // Log but do NOT crash — HTTP server still works without the broker.
        // Swap for `process.exit(1)` if events are mission-critical.
        console.error("[server] RabbitMQ unavailable — running WITHOUT event bus:", err);
    }

    // ── Step 3: Start the HTTP server ─────────────────────────
    app.listen(PORT, () => {
        console.log(`[server] Running on http://localhost:${PORT}`);
    });
};

// ─────────────────────────────────────────────────────────────
// GRACEFUL SHUTDOWN
//
// On SIGTERM / SIGINT we close the RabbitMQ channel/connection
// cleanly so in-flight messages are not lost.
// ─────────────────────────────────────────────────────────────
const shutdown = async (signal: string): Promise<void> => {
    console.log(`[server] ${signal} received — shutting down gracefully...`);
    await disconnectRabbitMQ();
    process.exit(0);
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT",  () => shutdown("SIGINT"));

start();
