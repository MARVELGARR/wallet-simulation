import { revokeRefreshToken, revokeAllUserTokens } from "../../data-access-layer/auth/refresh-token.js";

type ServiceSuccess = { success: true };
type ServiceError = { success: false; error: string };
type ServiceResult = ServiceSuccess | ServiceError;

/**
 * LOGOUT SERVICE
 * 
 * Simply revokes the provided refresh token so it can no longer be used.
 */
export const Logout = async (
    refreshToken: string
): Promise<ServiceResult> => {
    try {
        await revokeRefreshToken(refreshToken);
        return { success: true };
    } catch (err) {
        console.error("[logout.service] Logout failed:", err);
        return { success: false, error: "Logout failed." };
    }
};

/**
 * GLOBAL LOGOUT SERVICE
 * 
 * Revokes all sessions for a user.
 */
export const LogoutAll = async (
    userId: number
): Promise<ServiceResult> => {
    try {
        await revokeAllUserTokens(userId);
        return { success: true };
    } catch (err) {
        console.error("[logout.service] Global logout failed:", err);
        return { success: false, error: "Global logout failed." };
    }
};
