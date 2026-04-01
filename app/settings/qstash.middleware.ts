import { Request, Response, NextFunction } from "express";
import { Receiver } from "@upstash/qstash";
import express from "express";

// ─────────────────────────────────────────────────────────────
// QStash Receiver — verifies the upstash-signature header
// using the signing keys from your Upstash dashboard.
// ─────────────────────────────────────────────────────────────
const receiver = new Receiver({
    currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY!,
    nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY!,
});


// ─────────────────────────────────────────────────────────────
// RAW BODY PARSER
// Must be applied BEFORE verifyQStash on each event route.
// QStash signature verification requires the raw body string,
// NOT the already-parsed object that express.json() produces.
// Using express.raw() captures the body as a Buffer so we can:
//   1. Verify the signature against the original raw bytes
//   2. Manually parse + re-attach to req.body for downstream handlers
// ─────────────────────────────────────────────────────────────
export const rawBodyParser = express.raw({ type: "application/json" });


// ─────────────────────────────────────────────────────────────
// VERIFY QSTASH MIDDLEWARE
// Apply this AFTER rawBodyParser on every QStash event route.
// ─────────────────────────────────────────────────────────────
export async function verifyQStash(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const signature = req.headers["upstash-signature"] as string | undefined;

    // Guard: signature header must be present
    if (!signature) {
        return res.status(401).json({
            message: "Unauthorized: missing upstash-signature header",
        });
    }

    // At this point req.body is a raw Buffer (from rawBodyParser)
    const rawBody = (req.body as Buffer).toString("utf-8");

    try {
        await receiver.verify({
            signature,
            body: rawBody,
        });

        // Re-attach parsed JSON so route handlers get req.body as an object
        req.body = JSON.parse(rawBody);

        next();
    } catch (error) {
        console.error("[QStash] Signature verification failed:", error);
        return res.status(401).json({
            message: "Unauthorized: invalid QStash signature",
        });
    }
}
