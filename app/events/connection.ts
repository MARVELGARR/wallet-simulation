
import amqplib from "amqplib";
import type { ChannelModel, Channel } from "amqplib";
import { EXCHANGE, QUEUES } from "./types.js";

// ─────────────────────────────────────────────────────────────
// RABBITMQ CONNECTION MANAGER
//
// Provides a singleton ChannelModel + Channel pair.
// • connect()    — call once at server boot
// • getChannel() — call anywhere to get the shared channel
// • disconnect() — call on SIGTERM / SIGINT for clean shutdown
// ─────────────────────────────────────────────────────────────

let model:   ChannelModel | null = null;
let channel: Channel      | null = null;

/**
 * Connects to RabbitMQ, declares the topic exchange, and binds all
 * application queues. Safe to call multiple times — only connects once.
 */
export async function connectRabbitMQ(): Promise<void> {
    if (model) return; // already connected

    const url = process.env.RABBITMQ_URL ?? "amqp://localhost";

    try {
        // amqplib ≥ 0.10 returns a ChannelModel (formerly Connection)
        model   = await amqplib.connect(url);
        channel = await model.createChannel();

        // ── Declare a durable topic exchange ─────────────────
        // "topic" routing lets consumers subscribe with wildcards:
        //   "user.*" matches user.registered, user.logged_in, etc.
        await channel.assertExchange(EXCHANGE, "topic", { durable: true });

        // ── Declare & bind all application queues ─────────────
        const bindings: Array<{ queue: string; pattern: string }> = [
            { queue: QUEUES.AUTH,    pattern: "user.*"    },
            { queue: QUEUES.PAYMENT, pattern: "payment.*" },
            { queue: QUEUES.WALLET,  pattern: "wallet.*"  },
        ];

        for (const { queue, pattern } of bindings) {
            await channel.assertQueue(queue, { durable: true });
            await channel.bindQueue(queue, EXCHANGE, pattern);
        }

        console.log("[rabbitmq] Connected and exchange/queues asserted ✓");

        // ── Error / close handling ─────────────────────────────
        model.on("error", (err: Error) => {
            console.error("[rabbitmq] Connection error:", err.message);
        });

        model.on("close", () => {
            console.warn("[rabbitmq] Connection closed. Restart the server to reconnect.");
            model   = null;
            channel = null;
        });

    } catch (err) {
        console.error("[rabbitmq] Failed to connect:", err);
        throw err; // surface the error so the server boot fails loudly
    }
}

/**
 * Returns the shared channel.
 * Throws if connectRabbitMQ() was never awaited at boot.
 */
export function getChannel(): Channel {
    if (!channel) {
        throw new Error(
            "[rabbitmq] Channel is not available. " +
            "Ensure connectRabbitMQ() was called at server startup."
        );
    }
    return channel;
}

/**
 * Gracefully closes the channel and model.
 * Call this on SIGTERM / SIGINT.
 */
export async function disconnectRabbitMQ(): Promise<void> {
    try {
        if (channel) await channel.close();
        if (model)   await model.close();
        console.log("[rabbitmq] Disconnected gracefully.");
    } catch (err) {
        console.error("[rabbitmq] Error during disconnect:", err);
    } finally {
        channel = null;
        model   = null;
    }
}
