
import "dotenv/config"; // loads .env before anything else runs

import { app } from "../settings/app.config.js";
import express from "express";
import { router } from "../settings/router.config.js";
import { userRouter } from "../routers/auth.controller.js";
import { trial } from "../routers/events/wallet.events.js";
import { tran_route } from "../routers/transaction.controller.js";
import "../routers/user.controller.js"; // Side-effect import to register user routes

// ── QStash Event Handlers ──────────────────────────────────────
// These routes are called by QStash (not directly by clients).
// Each is protected by the verifyQStash signature middleware.
import "../routers/events/deposit.event.js";
import "../routers/events/transfere.event.js";
import "../routers/events/withdrawer.event.js";

// ── QStash Event Routes (MUST be mounted BEFORE express.json()) ──
// QStash signature verification requires the raw body.
// express.json() would consume it, so event routes go first.

// ── Middleware ────────────────────────────────────────────────
app.use(express.json());
app.use("/api/v1", router);

// ── Routes ────────────────────────────────────────────────────
// All routes inside userRouter are accessible at /api/v1/...
// e.g. POST /api/v1/auth/register
app.use("/api/v1", trial);
app.use("/api/v1", tran_route);
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
// const shutdown = async (signal: string): Promise<void> => {
//     console.log(`[server] ${signal} received — shutting down gracefully...`);
//     process.exit(0);
// };

// process.on("SIGTERM", () => shutdown("SIGTERM"));
// process.on("SIGINT",  () => shutdown("SIGINT"));

start();
