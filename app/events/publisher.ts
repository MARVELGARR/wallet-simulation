
import { getChannel } from "./connection.js";
import { EXCHANGE, type EventName, type AppEvent } from "./types.js";

// ─────────────────────────────────────────────────────────────
// EVENT PUBLISHER
//
// Usage:
//   import { publish } from "../events/publisher.js";
//   await publish("user.registered", { userId, name, email, registeredAt });
//
// The function is typed via the AppEvent discriminated union so TypeScript
// will enforce that the payload matches the event name.
// ─────────────────────────────────────────────────────────────

type PayloadFor<E extends EventName> = Extract<AppEvent, { event: E }>["payload"];

/**
 * Publishes a typed event to the shared topic exchange.
 *
 * @param event   - Routing key, e.g. "user.registered"
 * @param payload - Strongly-typed payload that matches the event
 * @returns true on success, false if channel is unavailable
 */
export function publish<E extends EventName>(
    event:   E,
    payload: PayloadFor<E>
): boolean {
    try {
        const channel = getChannel();

        const message = Buffer.from(
            JSON.stringify({ event, payload, timestamp: new Date().toISOString() })
        );

        // persistent: true → message survives a broker restart
        const ok = channel.publish(EXCHANGE, event, message, {
            persistent:  true,
            contentType: "application/json",
        });

        if (!ok) {
            // Channel buffer is full — back-pressure signal from RabbitMQ.
            // In production you would wait for the "drain" event before continuing.
            console.warn(`[publisher] Back-pressure on event "${event}". Channel buffer full.`);
        }

        console.log(`[publisher] ✉  "${event}" → exchange "${EXCHANGE}"`);
        return ok;

    } catch (err) {
        // We deliberately do NOT throw — a failed publish must NEVER crash
        // a service request. Log and move on.
        console.error(`[publisher] Failed to publish "${event}":`, err);
        return false;
    }
}
