
import { startConsumer } from "../consumer.js";
import { QUEUES } from "../types.js";

// ─────────────────────────────────────────────────────────────
// WALLET DOMAIN CONSUMER
//
// Listens to the "wallet.events" queue and reacts to wallet
// debit / credit events — keeping a consistent audit trail and
// triggering downstream notifications.
// ─────────────────────────────────────────────────────────────

export async function startWalletConsumer(): Promise<void> {
    await startConsumer(QUEUES.WALLET, {

        // ── wallet.credited ───────────────────────────────────
        "wallet.credited": async (payload) => {
            console.log(
                `[wallet-consumer] Wallet credited: walletId=${payload.walletId} ` +
                `+${payload.amount} ${payload.currency} at ${payload.creditedAt}`
            );

            // TODO: update balance cache, notify user via push/email
            // await notificationService.credit(payload.walletId, payload.amount);
        },

        // ── wallet.debited ────────────────────────────────────
        "wallet.debited": async (payload) => {
            console.log(
                `[wallet-consumer] Wallet debited: walletId=${payload.walletId} ` +
                `-${payload.amount} ${payload.currency} at ${payload.debitedAt}`
            );

            // TODO: update balance cache, notify user
            // await notificationService.debit(payload.walletId, payload.amount);
        },
    });
}
