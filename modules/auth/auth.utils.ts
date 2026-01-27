import { authStorage } from "@/modules/auth/auth.storage";
import { AuthSession } from "@/modules/auth/auth.types";
import { refreshToken } from "@/modules/shared/infrastructure/api.background";


// Singleton promise to prevent multiple refresh requests
let refreshPromise: Promise<AuthSession | null> | null = null;

/**
 * Gets the current session from storage
 * @returns {Promise<AuthSession | null>} The session if it exists, null otherwise
 */
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

/**
 * Gets the current session from storage
 * @returns {Promise<string | null>} The session token if it exists, null otherwise
 */
export const getAuthToken = async (): Promise<string | null> => {
    try {
        // First check chrome.storage.local for local auth session
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

/**
 * Checks if the user is authenticated by checking if the auth token is present
 * @returns {Promise<boolean>} True if the user is authenticated, false otherwise
 */
export const isAuthenticated = async (): Promise<boolean> => {
    try {
        const authToken = await getAuthToken();
        return !!authToken;
    } catch (error) {
        console.error("Error checking authentication", error);
        return false;
    }
};

/**
 * Refreshes the current user session using the stored refresh token
 * Deduplicates concurrent calls - only one refresh request will be made at a time
 * @returns {Promise<AuthSession | null>} The new session if successful, null otherwise
 */
export const refreshAuthSession = async (): Promise<AuthSession | null> => {
    // If a refresh is already in progress, return the existing promise
    if (refreshPromise) {
        console.log("Refresh already in progress, waiting for existing request...");
        return refreshPromise;
    }

    // Create and store the refresh promise
    refreshPromise = (async () => {
        try {
            const session = await getSession();
            if (!session?.refresh_token) {
                console.warn("No refresh token available for session refresh");
                return null;
            }
            
            const newSession = await refreshToken(session.refresh_token);
            await authStorage.session.setValue(newSession);
            return newSession;
        } catch (error) {
            console.error("Error refreshing auth session", error);
            return null;
        } finally {
            // Clear the promise so future calls can trigger a new refresh
            refreshPromise = null;
        }
    })();

    return refreshPromise;
};


/**
 * Creates a copy of a Request for retry purposes.
 * This is needed because Request bodies can only be read once.
 * @param request The original request to copy
 * @param body Optional body blob (since original body may have been consumed)
 * @param newAuthToken Optional new auth token to set on the copied request
 * @returns A new Request object with the same properties
 */
export function cloneRequestForRetry(
    request: Request,
    body: Blob | null,
    newAuthToken?: string
): Request {
    const init: RequestInit = {
        method: request.method,
        headers: request.headers,
        body: body,
        mode: request.mode,
        credentials: request.credentials,
        cache: request.cache,
        redirect: request.redirect,
        referrer: request.referrer,
        integrity: request.integrity,
    };
    const clonedRequest = new Request(request.url, init);
    
    if (newAuthToken) {
        clonedRequest.headers.set("Authorization", `Bearer ${newAuthToken}`);
    }
    
    return clonedRequest;
}