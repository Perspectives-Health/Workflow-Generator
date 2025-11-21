import { SendMessageFn } from "./isomorphic-message";

export function createQueries<T>(sendMessage: SendMessageFn, definition: (send: SendMessageFn) => T): T {
    return definition(sendMessage);
}