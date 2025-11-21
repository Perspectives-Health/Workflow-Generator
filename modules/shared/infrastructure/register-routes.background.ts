import type { ProtocolWithReturn } from "webext-bridge";
import type { ApiResponse, GetCentersResponse } from "@/modules/shared/types";
import { onMessage } from "webext-bridge/background";
import { sendResponse, sendError } from "@/modules/shared/infrastructure/api-utils.background";
import { AuthSession } from "@/modules/auth/auth.types";
import { getCenters, login } from "@/modules/shared/infrastructure/api.background";


declare module "webext-bridge" {
    export interface ProtocolMap {
        "login": ProtocolWithReturn<{ email: string; password: string }, ApiResponse<AuthSession>>;
        "get-centers": ProtocolWithReturn<void, ApiResponse<GetCentersResponse>>;
    }
}

export function registerBackgroundRoutes() {
    onMessage("login", async ({ data }) => {
        try {
            const result = await login(data);
            return sendResponse(result);
        } catch (error) {
            return sendError(error as Error);
        }
    });

    onMessage("get-centers", async () => {
        try {
            const result = await getCenters();
            return sendResponse(result);
        } catch (error) {
            return sendError(error as Error);
        }
    });
}