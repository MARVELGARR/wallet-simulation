import { Client, Receiver } from "@upstash/qstash";

// ─────────────────────────────────────────────────────────────
// QStash Client — used to publish messages / events
// Token is read from QSTASH_TOKEN env var (set in .env)
// ─────────────────────────────────────────────────────────────
// Helper to strip surrounding quotes (Docker --env-file keeps them)
// Helper to strip whitespace, carriage returns, and surrounding quotes
const clean = (val: string | undefined) => {
  if (!val) return val;
  // 1. Trim invisible spaces, newlines (\n), and Windows carriage returns (\r)
  const trimmed = val.trim(); 
  // 2. Safely strip leading/trailing quotes if they exist
  return trimmed.replace(/^["']|["']$/g, '');
};;

export const client = new Client({
    token: clean(process.env.QSTASH_TOKEN)!,
    baseUrl: clean(process.env.QSTASH_URL),
});

// ─────────────────────────────────────────────────────────────
// QStash Receiver — verifies the upstash-signature header
// using the signing keys from your Upstash dashboard.
// ─────────────────────────────────────────────────────────────
export const receiver = new Receiver({
    currentSigningKey: clean(process.env.QSTASH_CURRENT_SIGNING_KEY)!,
    nextSigningKey: clean(process.env.QSTASH_NEXT_SIGNING_KEY)!,
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