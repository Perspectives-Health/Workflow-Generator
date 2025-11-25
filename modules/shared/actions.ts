import { sharedStorage } from "./shared.storage";

export const registerBrowserAction = () => {
    browser.action.onClicked.addListener(async (tab) => {
        try {
            await handleBrowserAction();
        } catch (error) {
            console.error('Error handling browser action:', error);
        }
    });
}

const handleBrowserAction = async () => {
    const visibility = await sharedStorage.visibility.getValue();
    await sharedStorage.visibility.setValue(!visibility);
}