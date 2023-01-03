const StorageManager = class {
    static getNumberOfTabs() {
        return new Promise((resolve) => {
            chrome.storage.local.get(["numberOfTabs"], (result) => {
                resolve(result.numberOfTabs);
            });
        });
    }
    static setNumberOfTabs(numberOfTabs) {
        chrome.storage.local.set({ numberOfTabs: numberOfTabs }, () => {
            console.log("Settings saved");
        });
    }
};

const Badge = class {
    static setText(numberOfTabs) {
        chrome.browserAction.setBadgeText({ text: numberOfTabs });
    }
};

async function main() {
    chrome.tabs.query({ currentWindow: true }, async (tabs) => {
        const NumberOfTabs = tabs.length;
        const NumberOfTabsFromStorage = await StorageManager.getNumberOfTabs();
        if (NumberOfTabsFromStorage !== NumberOfTabs) {
            StorageManager.setNumberOfTabs(NumberOfTabs);
            Badge.setText(NumberOfTabs.toString());
        }
    });
}

setInterval(main, 500);
