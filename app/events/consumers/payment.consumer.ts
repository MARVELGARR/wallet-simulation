
import { startConsumer } from "../consumer.js";
import { QUEUES } from "../types.js";

// ─────────────────────────────────────────────────────────────
// PAYMENT DOMAIN CONSUMER
//
// Listens to the "payment.events" queue and reacts to every
// payment lifecycle event.
//
// What to do here in production:
//   • payment.initiated  → reserve funds in sender wallet, notify
//   • payment.completed  → finalise ledger, send receipt email
//   • payment.failed     → release reserved funds, alert user
// ─────────────────────────────────────────────────────────────

export async function startPaymentConsumer(): Promise<void> {
    await startConsumer(QUEUES.PAYMENT, {

        // ── payment.initiated ─────────────────────────────────
        "payment.initiated": async (payload) => {
            console.log(
                `[payment-consumer] Payment initiated: txn=${payload.transactionId} ` +
                `amount=${payload.amount} ${payload.currency} at ${payload.initiatedAt}`
            );

            // TODO: reserve/hold funds in sender wallet
            // await walletService.hold(payload.senderWalletId, payload.amount);

            // TODO: call external payment gateway if needed
        },

        // ── payment.completed ─────────────────────────────────
        "payment.completed": async (payload) => {
            console.log(
                `[payment-consumer] Payment completed: txn=${payload.transactionId} at ${payload.completedAt}`
            );

            // TODO: debit sender, credit receiver, send receipt
            // await walletService.finalise(payload.transactionId);
            // await emailService.sendReceipt(payload.transactionId);
        },

        // ── payment.failed ────────────────────────────────────
        "payment.failed": async (payload) => {
            console.log(
                `[payment-consumer] Payment FAILED: txn=${payload.transactionId} ` +
                `reason="${payload.reason}" at ${payload.failedAt}`
            );

            // TODO: release held funds, alert user, update transaction status
            // await walletService.release(payload.transactionId);
        },
    });
}
