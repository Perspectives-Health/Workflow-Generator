import {
    SendMessageFn,
    OnMessageFn,
    OpenStreamFn,
    OnOpenStreamChannelFn
} from "@/modules/shared/infrastructure/isomorphic-message";
import { components } from "./schema.d";

/**
 * Represents a generic API response structure using a discriminated union.
 * @template T - The type of the data contained in the response for a successful operation.
 */
export type ApiResponse<T> =
    | { success: true; data: T; error?: undefined }
    | { success: false; data?: undefined; error: string }; // Error is now just the message string


export enum Entrypoint {
    CONTENT_SCRIPT = "content-script",
    POPUP = "popup",
    BACKGROUND = "background"
}

export interface MessagingFunctions {
    sendMessage: SendMessageFn;
    onMessage: OnMessageFn;
    openStream: OpenStreamFn;
    onOpenStreamChannel: OnOpenStreamChannelFn;
}

export type GetCentersResponse = { center_id: string, center_name: string }[];