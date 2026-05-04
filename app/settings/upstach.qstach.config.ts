import { Client, Receiver } from "@upstash/qstash";

// ─────────────────────────────────────────────────────────────
// QStash Client — used to publish messages / events
// Token is read from QSTASH_TOKEN env var (set in .env)
// ─────────────────────────────────────────────────────────────
export const client = new Client({
    token: process.env.QSTASH_TOKEN!,
});

// ─────────────────────────────────────────────────────────────
// QStash Receiver — verifies the upstash-signature header
// using the signing keys from your Upstash dashboard.
// ─────────────────────────────────────────────────────────────
export const receiver = new Receiver({
    currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY!,
    nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY!,
});

// ─────────────────────────────────────────────────────────────
// Verify QStash Signature
// Reusable helper: pass the raw body string and the
// `upstash-signature` header value. Throws on failure.
// ─────────────────────────────────────────────────────────────
export async function verifyQStashSignature(
    signature: string,
    body: string
): Promise<boolean> {
    return receiver.verify({ signature, body });
}