import { revokeRefreshToken, revokeAllUserTokens } from "../../data-access-layer/auth/refresh-token.js";
import { authLogger } from "../../settings/logger.js";



type ServiceSuccess<T> = { success: true, data?: T };
type ServiceError = { success: false; error: string };
type ServiceResult<T> = ServiceSuccess<T> | ServiceError;

/**
 * LOGOUT SERVICE
 * 
 * Simply revokes the provided refresh token so it can no longer be used.
 */
export const Logout = async (
    refreshToken: string
): Promise<ServiceResult<{success: boolean}>> => {
    try {
        await revokeRefreshToken(refreshToken);
        return { success: true };
    } catch (err) {
        authLogger.error({ err }, "Logout failed");
        return { success: false, error: "Logout failed." };
    }
};

/**
 * GLOBAL LOGOUT SERVICE
 * 
 * Revokes all sessions for a user.
 */
export const LogoutAll = async (
    userId: string
): Promise<ServiceResult<{success: boolean}>> => {
    try {
        await revokeAllUserTokens(userId);
        return { success: true };
    } catch (err) {
        authLogger.error({ err }, "Global logout failed");
        return { success: false, error: "Global logout failed." };
    }
};
