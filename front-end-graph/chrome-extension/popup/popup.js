document.addEventListener('DOMContentLoaded', function () {
    const openButton = document.getElementById('openInGraphView');
    const statusText = document.getElementById('status');

    // Check the current tab for Notion URL
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        const currentTab = tabs[0];
        const url = currentTab.url;

        // Check if the current tab is a Notion page
        if (url && (url.includes('notion.so') || url.includes('notion.site'))) {
            statusText.textContent = 'Notion page detected';
            openButton.disabled = false;
            openButton.classList.remove('disabled');
        } else {
            statusText.textContent = 'Not on a Notion page';
            openButton.disabled = true;
            openButton.classList.add('disabled');
        }
    });

    // Event listener for the open button
    openButton.addEventListener('click', function () {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            const currentTab = tabs[0];

            // Send a message to the content script to open the sidebar
            chrome.tabs.sendMessage(
                currentTab.id,
                { action: 'openSidebar' },
                function (response) {
                    if (response && response.success) {
                        // Close the popup after successfully opening the sidebar
                        window.close();
                    }
                }
            );
        });
    });
}); 