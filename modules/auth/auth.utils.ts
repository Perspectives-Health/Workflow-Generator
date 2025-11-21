import { authStorage } from "./auth.storage";
import { AuthSession } from "./auth.types";


export const getSession = async (): Promise<AuthSession | null> => {
    try {
        const session = await authStorage.session.getValue();
        if (!session) {
            return null;
        }
        return session;
    } catch (error) {
        console.error("Error accessing session storage", error);
        return null;
    }
};

export const getAuthToken = async (): Promise<string | null> => {
    try {
        const session = await getSession();
        if (!session) {
            return null;
        }
        return session.access_token ?? null;
    } catch (error) {
        console.error("Error accessing session storage", error);
        return null;
    }
};