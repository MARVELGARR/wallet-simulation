
import "dotenv/config"; // loads .env before anything else runs

import { app } from "../settings/app.config.js";
import { userRouter } from "../routers/user.controller.js";
import express from "express";
import { router } from "../settings/router.config.js";

// ── Middleware ────────────────────────────────────────────────
app.use(express.json());

// ── Routes ────────────────────────────────────────────────────
// All routes inside userRouter are accessible at /api/v1/...
// e.g. POST /api/v1/auth/register
app.use("/api/v1", userRouter);

router.get("/", (req, res)=>{
    res.send("wahala")
})

// ── HTTP Port ─────────────────────────────────────────────────
const PORT = Number(process.env.PORT) || 3000;

// ─────────────────────────────────────────────────────────────
// SERVER BOOT
// ─────────────────────────────────────────────────────────────
const start = async (): Promise<void> => {
    app.listen(PORT, () => {
        console.log(`[server] Running on http://localhost:${PORT}`);
    });
};

// ─────────────────────────────────────────────────────────────
// GRACEFUL SHUTDOWN
// ─────────────────────────────────────────────────────────────
const shutdown = async (signal: string): Promise<void> => {
    console.log(`[server] ${signal} received — shutting down gracefully...`);
    process.exit(0);
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT",  () => shutdown("SIGINT"));

start();
