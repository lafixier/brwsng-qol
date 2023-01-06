const DefaultLimitOnMaxNumberOfTabs = 50;

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
    StorageManager.set(
        "limitOnMaxNumberOfTabs",
        LimitOnMaxNumberOfTabs || DefaultLimitOnMaxNumberOfTabs
    );
});

chrome.tabs.onCreated.addListener(async () => {
    const NumberOfTabs = await StorageManager.get("numberOfTabs");
    const LimitOnMaxNumberOfTabs = await StorageManager.get(
        "limitOnMaxNumberOfTabs"
    );
    if (NumberOfTabs + 1 > LimitOnMaxNumberOfTabs) {
        sendWarningNotification();
    }
    const CumulativeNumberOfTabsOpened = await StorageManager.get(
        "cumulativeNumberOfTabsOpened"
    );
    if (CumulativeNumberOfTabsOpened === undefined) {
        const NumberOfTabsFromStorage = await StorageManager.get(
            "numberOfTabs"
        );
        StorageManager.set(
            "cumulativeNumberOfTabsOpened",
            NumberOfTabsFromStorage + 1
        );
        return;
    }
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
