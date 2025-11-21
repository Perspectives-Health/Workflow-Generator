import { ApiResponse } from '@/modules/shared/types';


export function sendResponse(): ApiResponse<void>;
export function sendResponse<T>(data: T): ApiResponse<T>;
export function sendResponse<T>(data?: T): ApiResponse<T> | ApiResponse<void> {
    return {
        success: true,
        data: data as T,
    };
}

export function sendError(error: Error): ApiResponse<never> {
    const message = error?.message || 'An unknown error occurred';
    const formattedMessage = message.charAt(0).toUpperCase() + message.slice(1);
    return {
        success: false,
        error: formattedMessage,
    };
}