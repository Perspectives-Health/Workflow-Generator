import {
    onMessage as onMessageContentScript,
    sendMessage as sendMessageContentScript,
    openStream as openStreamContentScript,
    onOpenStreamChannel as onOpenStreamChannelContentScript
} from "webext-bridge/content-script";

import {
    onMessage as onMessagePopup,
    sendMessage as sendMessagePopup,
    openStream as openStreamPopup,
    onOpenStreamChannel as onOpenStreamChannelPopup
} from "webext-bridge/popup";

import {
    onMessage as onMessageBackground,
    sendMessage as sendMessageBackground,
    openStream as openStreamBackground,
    onOpenStreamChannel as onOpenStreamChannelBackground
} from "webext-bridge/background";

import {
    Entrypoint,
    MessagingFunctions
} from "@/modules/shared/types";


export type SendMessageFn = typeof sendMessageContentScript | typeof sendMessagePopup | typeof sendMessageBackground;
export type OnMessageFn = typeof onMessageContentScript | typeof onMessagePopup | typeof onMessageBackground;
export type OpenStreamFn = typeof openStreamContentScript | typeof openStreamPopup | typeof openStreamBackground;
export type OnOpenStreamChannelFn = typeof onOpenStreamChannelContentScript | typeof onOpenStreamChannelPopup | typeof onOpenStreamChannelBackground;

export const getMessagingFunctions = (ctx: Entrypoint): MessagingFunctions => {
    switch (ctx) {
        case 'content-script':
            return {
                sendMessage: sendMessageContentScript,
                onMessage: onMessageContentScript,
                openStream: openStreamContentScript,
                onOpenStreamChannel: onOpenStreamChannelContentScript
            };
        case 'popup':
            return {
                sendMessage: sendMessagePopup,
                onMessage: onMessagePopup,
                openStream: openStreamPopup,
                onOpenStreamChannel: onOpenStreamChannelPopup
            };
        case 'background':
            return {
                sendMessage: sendMessageBackground,
                onMessage: onMessageBackground,
                openStream: openStreamBackground,
                onOpenStreamChannel: onOpenStreamChannelBackground
            };
        default:
            throw new Error(`Invalid entrypoint context: ${ctx}`);
    }
};