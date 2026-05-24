import "dotenv/config"; // loads .env before anything else runs

import { app } from "../settings/app.config.js";
import express from "express";
import { router } from "../settings/router.config.js";
import { userRouter } from "../routers/auth.controller.js";
import { tran_route } from "../routers/transaction.controller.js";
import "../routers/user.controller.js"; // Side-effect import to register user routes
import "../routers/wallet.controller.js"; // Side-effect import to register wallet routes
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { db } from "../settings/db.config.js";

import { eventRouter } from "../settings/qstash.router.js";
import { serverLogger } from "../settings/logger.js";

// ── QStash Event Handlers ──────────────────────────────────────
// These routes are called by QStash (not directly by clients).
// IMPORTANT: These MUST be mounted BEFORE express.json() so 
// the signature verification can access the raw body.
import "../routers/events/deposit.event.js";
import "../routers/events/transfere.event.js";
import "../routers/events/withdrawer.event.js";
import "../routers/events/wallet.events.js";
import { walletRouter } from "../routers/wallet.controller.js";

app.use("/api/v1", eventRouter);

// ── Standard Middleware ───────────────────────────────────────
app.use(express.json());

// ── Standard API Routes ───────────────────────────────────────
app.use("/api/v1", router);
app.use("/api/v1", tran_route);
app.use("/api/v1", userRouter);
app.use("/api/v1", walletRouter);

router.get("/", (req, res)=>{
    res.send("wahala")
})

// ── HTTP Port ─────────────────────────────────────────────────
const PORT = Number(process.env.PORT) || 3000;

// ─────────────────────────────────────────────────────────────
// SERVER BOOT
// ─────────────────────────────────────────────────────────────
const start = async (): Promise<void> => {
    // Run pending Drizzle migrations (creates tables on first deploy)
    try {
        serverLogger.info("Running database migrations...");
        await migrate(db, { migrationsFolder: "./app/database/migrations" });
        serverLogger.info("✅ Migrations complete");
    } catch (err) {
        serverLogger.fatal({ err }, "❌ Migration failed");
        process.exit(1);
    }

    app.listen(PORT, () => {
        serverLogger.info(`🚀 Running on http://localhost:${PORT}`);
    });
};

// ─────────────────────────────────────────────────────────────
// GRACEFUL SHUTDOWN
// ─────────────────────────────────────────────────────────────
const shutdown = async (signal: string): Promise<void> => {
    serverLogger.warn(`${signal} received — shutting down gracefully...`);
    process.exit(0);
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT",  () => shutdown("SIGINT"));

start();
