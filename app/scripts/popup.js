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

chrome.runtime.onMessage.addListener((message) => {
    switch (message.type) {
        case "updateCumulativeNumberOfTabsOpened":
            document.getElementById(
                "cumulative-number-of-tabs-opened"
            ).innerText = message.value;
            break;
    }
});
