const StorageManager = class {
    static get(key) {
        return new Promise((resolve) => {
            chrome.storage.local.get([key], (result) => {
                resolve(result[key]);
            });
        });
    }
    static set(key, value) {
        chrome.storage.local.set({ [key]: value }, () => {});
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

document
    .getElementById("limit-on-max-number-of-tabs")
    .addEventListener("change", (event) => {
        StorageManager.set("limitOnMaxNumberOfTabs", event.target.value);
    });

const main = async () => {
    const LimitOnMaxNumberOfTabs = await StorageManager.get(
        "limitOnMaxNumberOfTabs"
    );
    document.getElementById("limit-on-max-number-of-tabs").value =
        LimitOnMaxNumberOfTabs;
};

main();
