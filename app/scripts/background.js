const DefaultLimitOnMaxNumberOfTabs = 50;
const Colors = {
    Red: "red",
    Green: "green",
};

const StorageManager = class {
    static get(key) {
        return new Promise((resolve) => {
            chrome.storage.local.get([key], (result) => {
                resolve(result[key]);
            });
        });
    }
    static set(key, value) {
        chrome.storage.local.set({ [key]: value }, () => {
            console.log("Settings saved");
        });
    }
};

const Badge = class {
    static setText(text) {
        chrome.browserAction.setBadgeText({ text: text });
    }
    static setBackgroundColor(color) {
        chrome.browserAction.setBadgeBackgroundColor({ color: color });
    }
};

const sendWarningNotification = async () => {
    const NumberOfTabs = (await StorageManager.get("numberOfTabs")) + 1;
    chrome.notifications.create({
        type: "basic",
        iconUrl: chrome.runtime.getURL("images/icon-128.png"),
        title: "Warning | Brwsng QOL",
        message: `You have opened ${NumberOfTabs} tabs.\nPlease close some tabs.`,
    });
};

chrome.runtime.onInstalled.addListener(async () => {
    const LimitOnMaxNumberOfTabs = await StorageManager.get(
        "limitOnMaxNumberOfTabs"
    );
    const CumulativeNumberOfTabsOpened = await StorageManager.get(
        "cumulativeNumberOfTabsOpened"
    );
    StorageManager.set(
        "limitOnMaxNumberOfTabs",
        LimitOnMaxNumberOfTabs || DefaultLimitOnMaxNumberOfTabs
    );
    StorageManager.set(
        "cumulativeNumberOfTabsOpened",
        CumulativeNumberOfTabsOpened || 0
    );
});

chrome.tabs.onCreated.addListener(async () => {
    const NumberOfTabs = await StorageManager.get("numberOfTabs");
    const LimitOnMaxNumberOfTabs = await StorageManager.get(
        "limitOnMaxNumberOfTabs"
    );
    if (NumberOfTabs + 1 > LimitOnMaxNumberOfTabs) {
        sendWarningNotification();
        Badge.setBackgroundColor(Colors.Red);
    }
    const CumulativeNumberOfTabsOpened = await StorageManager.get(
        "cumulativeNumberOfTabsOpened"
    );
    console.log(CumulativeNumberOfTabsOpened);
    StorageManager.set(
        "cumulativeNumberOfTabsOpened",
        CumulativeNumberOfTabsOpened + 1
    );
});

const main = async () => {
    chrome.tabs.query({ currentWindow: true }, async (tabs) => {
        const NumberOfTabs = tabs.length;
        const NumberOfTabsFromStorage = await StorageManager.get(
            "numberOfTabs"
        );
        if (NumberOfTabsFromStorage !== NumberOfTabs) {
            StorageManager.set("numberOfTabs", NumberOfTabs);
            Badge.setText(NumberOfTabs.toString());
        }
        const LimitOnMaxNumberOfTabs = await StorageManager.get(
            "limitOnMaxNumberOfTabs"
        );
        if (NumberOfTabs <= LimitOnMaxNumberOfTabs) {
            Badge.setBackgroundColor(Colors.Green);
        }
        const CumulativeNumberOfTabsOpened = await StorageManager.get(
            "cumulativeNumberOfTabsOpened"
        );
        chrome.runtime.sendMessage({
            type: "updateCumulativeNumberOfTabsOpened",
            value: CumulativeNumberOfTabsOpened,
        });
    });
};

setInterval(main, 500);
