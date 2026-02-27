
import type { Channel, ConsumeMessage } from "amqplib";
import { getChannel } from "./connection.js";
import type { AppEvent, EventName } from "./types.js";

// ─────────────────────────────────────────────────────────────
// EVENT CONSUMER (base utility)
//
// Generic consumer that:
//   1. Subscribes to a named queue
//   2. Deserialises the JSON envelope
//   3. Dispatches to a per-event handler map you provide
//   4. ACKs on success, NACKs (no requeue) on unrecoverable error
//
// Usage:
//   startConsumer(QUEUES.AUTH, {
//     "user.registered": async (payload) => { ... },
//   });
// ─────────────────────────────────────────────────────────────

type HandlerMap = {
    [E in EventName]?: (
        payload: Extract<AppEvent, { event: E }>["payload"]
    ) => Promise<void>;
};

/**
 * Starts consuming messages from `queue`.
 * Each message is routed to the matching handler in `handlers`.
 * Unknown event types are simply ACKed and logged.
 *
 * @param queue    - Queue name (from QUEUES constant)
 * @param handlers - Map of event name → async handler function
 * @param prefetch - Max unacknowledged messages in flight (default: 10)
 */
export async function startConsumer(
    queue:    string,
    handlers: HandlerMap,
    prefetch  = 10
): Promise<void> {
    const channel: Channel = getChannel();

    // Limit in-flight unacknowledged messages to avoid overwhelming this process
    await channel.prefetch(prefetch);

    await channel.consume(queue, async (msg: ConsumeMessage | null) => {
        if (!msg) return; // consumer was cancelled server-side

        let envelope: { event: string; payload: unknown; timestamp?: string };

        // ── Parse ─────────────────────────────────────────────
        try {
            envelope = JSON.parse(msg.content.toString());
        } catch {
            console.error("[consumer] Failed to parse message — NACKing (no requeue):", msg.content.toString());
            channel.nack(msg, false, false);
            return;
        }

        const { event, payload } = envelope;

        // ── Dispatch ──────────────────────────────────────────
        const handler = handlers[event as EventName];

        if (!handler) {
            // No handler registered for this event — ACK and skip
            console.warn(`[consumer] No handler for event "${event}" on queue "${queue}". Skipping.`);
            channel.ack(msg);
            return;
        }

        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await handler(payload as any);
            channel.ack(msg);
            console.log(`[consumer] ✓ Handled "${event}" from queue "${queue}"`);
        } catch (err) {
            // Handler threw — NACK without requeue to avoid infinite loops.
            // In production you would send this to a Dead Letter Queue (DLQ).
            console.error(`[consumer] Handler for "${event}" threw an error — NACKing:`, err);
            channel.nack(msg, false, false);
        }
    });

    console.log(`[consumer] Listening on queue "${queue}" ✓`);
}
