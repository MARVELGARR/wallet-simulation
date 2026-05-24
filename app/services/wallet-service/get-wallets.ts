import { GetAllWallets_Dal } from "../../data-access-layer/wallet/wallet.db.js";
import { WalletType } from "../../database/schema.js";
import { walletLogger } from "../../settings/logger.js";

type ServiceSuccess<T> = { success: true; data: T };
type ServiceError = { success: false; error: string; code?: string };
type ServiceResult<T> = ServiceSuccess<T> | ServiceError;

export const GetAllWalletsService = async (): Promise<ServiceResult<WalletType[]>> => {
    try {
        const wallets = await GetAllWallets_Dal();
        return { success: true, data: wallets };
    } catch (error) {
        walletLogger.error({ err: error }, "Error fetching wallets");
        return { success: false, error: "Failed to fetch wallets.", code: "INTERNAL_ERROR" };
    }
};
