

import "dotenv/config"; // loads .env before anything else runs

import { app } from "../settings/app.config.js";
import { userRouter } from "../routers/user.controller.js";
import express from "express"

// Mount the user/auth routes under the versioned API prefix
// All routes inside userRouter will be accessible at /api/v1/...
// e.g. POST /api/v1/auth/register

app.use(express.json())
app.use("/api/v1", userRouter);

// ── Start the HTTP server ────────────────────────────────────
const PORT = Number(process.env.PORT) || 3000;

const start = () => {
    app.listen(PORT, () => {
        console.log(`[server] Running on http://localhost:${PORT}`);
    });
};

start();
