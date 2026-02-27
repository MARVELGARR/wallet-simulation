
// ─────────────────────────────────────────────────────────────
// EVENT CONTRACT — types.ts
//
// This file is the SINGLE SOURCE OF TRUTH for every event that
// travels through RabbitMQ. Both publishers and consumers import
// from here, so the shape is always in sync.
//
// Naming convention:  "<aggregate>.<past-tense-action>"
// ─────────────────────────────────────────────────────────────

// ── Exchange / Queue Names ────────────────────────────────────
export const EXCHANGE = "app.events" as const;

export const QUEUES = {
    AUTH:    "auth.events",
    PAYMENT: "payment.events",
    WALLET:  "wallet.events",
} as const;

// ── Routing Keys (event names) ────────────────────────────────
export const EVENTS = {
    // Auth domain
    USER_REGISTERED: "user.registered",
    USER_LOGGED_IN:  "user.logged_in",
    USER_LOGGED_OUT: "user.logged_out",

    // Payment domain
    PAYMENT_INITIATED:  "payment.initiated",
    PAYMENT_COMPLETED:  "payment.completed",
    PAYMENT_FAILED:     "payment.failed",

    // Wallet domain
    WALLET_CREDITED: "wallet.credited",
    WALLET_DEBITED:  "wallet.debited",
} as const;

export type EventName = (typeof EVENTS)[keyof typeof EVENTS];

// ── Event Payload Shapes ──────────────────────────────────────
export interface UserRegisteredPayload {
    userId: string;
    name:   string;
    email:  string;
    registeredAt: string; // ISO-8601
}

export interface UserLoggedInPayload {
    userId:   string;
    email:    string;
    loggedInAt: string;
}

export interface UserLoggedOutPayload {
    userId:   string;
    loggedOutAt: string;
}

export interface PaymentInitiatedPayload {
    transactionId:    string;
    senderWalletId:   string;
    receiverWalletId: string;
    amount:           string;
    currency:         string;
    initiatedAt:      string;
}

export interface PaymentCompletedPayload {
    transactionId: string;
    completedAt:   string;
}

export interface PaymentFailedPayload {
    transactionId: string;
    reason:        string;
    failedAt:      string;
}

export interface WalletCreditedPayload {
    walletId:  string;
    amount:    string;
    currency:  string;
    creditedAt: string;
}

export interface WalletDebitedPayload {
    walletId:  string;
    amount:    string;
    currency:  string;
    debitedAt: string;
}

// Discriminated union so consumers can narrow the payload by event name
export type AppEvent =
    | { event: "user.registered";  payload: UserRegisteredPayload  }
    | { event: "user.logged_in";   payload: UserLoggedInPayload    }
    | { event: "user.logged_out";  payload: UserLoggedOutPayload   }
    | { event: "payment.initiated"; payload: PaymentInitiatedPayload }
    | { event: "payment.completed"; payload: PaymentCompletedPayload }
    | { event: "payment.failed";    payload: PaymentFailedPayload   }
    | { event: "wallet.credited";   payload: WalletCreditedPayload  }
    | { event: "wallet.debited";    payload: WalletDebitedPayload   };
