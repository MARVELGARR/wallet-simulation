import { Router } from "express";

// ─────────────────────────────────────────────────────────────
// QSTASH EVENT ROUTER
//
// This router is dedicated to routes triggered by QStash.
// CRITICAL: This router MUST be mounted BEFORE express.json()
// in the main server (index.ts) so that the signature verification
// middleware can read the raw request body.
// ─────────────────────────────────────────────────────────────
const eventRouter = Router();

export { eventRouter };
