
import { startConsumer } from "../consumer.js";
import { QUEUES } from "../types.js";

// ─────────────────────────────────────────────────────────────
// AUTH DOMAIN CONSUMER
//
// This worker listens to the "auth.events" queue and handles
// every user-related event published by the auth service.
//
// What to do here in production:
//   • user.registered  → send welcome email, create wallet, audit log
//   • user.logged_in   → record login history, update last-seen
//   • user.logged_out  → invalidate caches, notify connected devices
// ─────────────────────────────────────────────────────────────

export async function startAuthConsumer(): Promise<void> {
    await startConsumer(QUEUES.AUTH, {

        // ── user.registered ───────────────────────────────────
        "user.registered": async (payload) => {
            console.log(
                `[auth-consumer] New user registered: ${payload.name} <${payload.email}> ` +
                `(id=${payload.userId}) at ${payload.registeredAt}`
            );

            // TODO: trigger welcome email via email service
            // await emailService.sendWelcome(payload.email, payload.name);

            // TODO: provision a wallet for the new user
            // await walletService.createWallet(payload.userId);
        },

        // ── user.logged_in ────────────────────────────────────
        "user.logged_in": async (payload) => {
            console.log(
                `[auth-consumer] User logged in: ${payload.email} ` +
                `(id=${payload.userId}) at ${payload.loggedInAt}`
            );

            // TODO: update last_login_at in DB, audit log, etc.
        },

        // ── user.logged_out ───────────────────────────────────
        "user.logged_out": async (payload) => {
            console.log(
                `[auth-consumer] User logged out: id=${payload.userId} at ${payload.loggedOutAt}`
            );

            // TODO: invalidate session cache, push notification to other devices
        },
    });
}
