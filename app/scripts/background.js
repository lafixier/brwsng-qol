setInterval(() => {
    chrome.tabs.query({ currentWindow: true }, (tabs) => {
        chrome.browserAction.setBadgeText({ text: String(tabs.length) });
    });
}, 500);
