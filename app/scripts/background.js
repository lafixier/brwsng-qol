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

chrome.tabs.onCreated.addListener(async () => {
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
    });
};

setInterval(main, 500);
