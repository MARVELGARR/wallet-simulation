
// ─────────────────────────────────────────────────────────────
// EVENTS BARREL
//
// Single entry-point for the events layer. Import from here
// to keep the rest of the app decoupled from internal paths.
// ─────────────────────────────────────────────────────────────

export { connectRabbitMQ, disconnectRabbitMQ, getChannel } from "./connection.js";
export { publish }                                          from "./publisher.js";
export { startConsumer }                                    from "./consumer.js";
export { EXCHANGE, QUEUES, EVENTS }                         from "./types.js";
export type { AppEvent, EventName }                         from "./types.js";

// Consumer starters — imported and called at server boot
export { startAuthConsumer }    from "./consumers/auth.consumer.js";
export { startPaymentConsumer } from "./consumers/payment.consumer.js";
export { startWalletConsumer }  from "./consumers/wallet.consumer.js";
