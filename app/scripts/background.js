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
