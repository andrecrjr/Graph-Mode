// Listen for the extension icon click in the toolbar
chrome.action.onClicked.addListener((tab) => {
    // This will only execute if no popup is defined or if the user clicks on the extension icon
    // We'll use this as a backup method if the popup fails

    // Check if the current tab is a Notion page
    if (tab.url && (tab.url.includes('notion.so') || tab.url.includes('notion.site'))) {
        // Instead of opening a new tab, send a message to the content script to open the sidebar
        chrome.tabs.sendMessage(
            tab.id,
            { action: 'openSidebar' }
        );
    }
});

// Optional: Listen for messages from the popup or content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    // Handle the legacy 'openInGraphView' action by redirecting it to the content script
    if (message.action === 'openInGraphView' && message.notionUrl) {
        // Extract tab id from the sender
        const tabId = sender.tab?.id;

        if (tabId) {
            // Send a message to the content script to open the sidebar
            chrome.tabs.sendMessage(
                tabId,
                { action: 'openSidebar' },
                function (response) {
                    sendResponse(response);
                }
            );
            return true; // Keep the message channel open for async response
        }
    }
    return true; // Keep the message channel open for async response
});

// background.js
let pendingUrls = {}; // Store URLs during "loading" phase

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    // 1. Capture URL early during "loading"
    if (changeInfo.url) {
        pendingUrls[tabId] = changeInfo.url;
    }

    // 2. Handle completion using the stored URL
    if (changeInfo.status === "complete" && pendingUrls[tabId]) {
        const newUrl = pendingUrls[tabId];
        delete pendingUrls[tabId]; // Clean up

        chrome.storage.local.get("lastUrl", (result) => {
            const lastUrl = result.lastUrl;

            if (newUrl !== lastUrl) {
                chrome.storage.local.set({ lastUrl: newUrl }, () => {
                    chrome.tabs.sendMessage(tabId, { action: "urlChanged", url: newUrl }, () => {
                        if (chrome.runtime.lastError) {
                            console.warn('Error sending message:', chrome.runtime.lastError);
                        }
                    });
                });
            }
        });
    }
});