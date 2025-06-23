const appBaseUrl = 'http://localhost:3000';

const pathExtension = '/graph/socket-extension/';

const sidebarWidth = '75%'; // 75% of the width of the page

// Function to extract Notion page ID from URL
function extractNotionPageId(notionUrl) {
    try {
        const url = new URL(notionUrl);

        // Handle different Notion URL formats

        // Format 1: https://www.notion.so/workspace/Page-Name-123456789abcdef123456789abcdef12
        // Format 2: https://www.notion.so/Page-Name-123456789abcdef123456789abcdef12
        const lastPathSegment = url.pathname.split('/').pop();

        // Check if the last segment contains a UUID pattern
        const uuidMatch = lastPathSegment.match(/[a-f0-9]{32}$/);
        if (uuidMatch) {
            return uuidMatch[0];
        }

        // Format 3: https://www.notion.so/123456789abcdef123456789abcdef12
        if (/^[a-f0-9]{32}$/.test(lastPathSegment)) {
            return lastPathSegment;
        }

        // Format 4: https://www.notion.so/workspace/123456789abcdef123456789abcdef12
        const allPathSegments = url.pathname.split('/');
        for (const segment of allPathSegments) {
            if (/^[a-f0-9]{32}$/.test(segment)) {
                return segment;
            }
        }

        // If no UUID found, return the last path segment as fallback
        return lastPathSegment || 'mock';
    } catch (error) {
        console.error('Error extracting Notion page ID:', error);
        return 'mock';
    }
}

function setNotionAppSidebarWidth() {
    document.body.style.display = 'flex';
    document.querySelector('#notion-app').style.width = '100%';
    document.querySelector('#notion-app .notion-cursor-listener').style.width = '100%';
    document.querySelector('#notion-app .notion-frame').style.width = `100%`;

}



// Function to create and toggle the sidebar iframe
function createGraphModeSidebar(notionUrl) {
    // Check if the sidebar already exists
    let sidebar = document.getElementById('graph-view-sidebar');

    // If the sidebar exists, just toggle its visibility
    if (sidebar) {
        if (sidebar.style.width === '0px') {
            sidebar.style.width = sidebarWidth;
        } else {
            sidebar.style.width = '0px';
        }
        return;
    }

    // Extract Notion page ID from the URL
    const notionPageId = extractNotionPageId(notionUrl);

    // Create the sidebar
    sidebar = document.createElement('div');
    sidebar.id = 'graph-view-sidebar';
    sidebar.style.width = sidebarWidth;
    sidebar.style.height = '100%';
    sidebar.style.zIndex = '10000';
    sidebar.style.backgroundColor = 'white';
    sidebar.style.boxShadow = '-5px 0 15px rgba(0, 0, 0, 0.1)';
    sidebar.style.transition = 'width 0.3s ease';
    sidebar.style.overflow = 'hidden';
    sidebar.style.position = 'relative';

    // Create a header for the sidebar
    const header = document.createElement('div');
    header.style.display = 'flex';
    header.style.position = 'absolute';
    header.style.backgroundColor = 'white';
    header.style.zIndex = '999';
    // Add close button to the header
    const closeButton = document.createElement('button');
    closeButton.textContent = '×';
    closeButton.style.border = 'none';
    closeButton.style.background = 'none';
    closeButton.style.fontSize = '2rem';
    closeButton.style.cursor = 'pointer';
    closeButton.style.padding = '0 5px';
    closeButton.style.color = 'black';
    closeButton.style.lineHeight = '1';
    closeButton.onclick = function () {
        sidebar.style.width = '0px';
    };

    header.appendChild(closeButton);
    sidebar.appendChild(header);


    // Create the iframe
    const iframe = document.createElement('iframe');
    iframe.style.width = '100%';
    iframe.style.height = '100%'; // Subtract header height
    iframe.style.border = 'none';
    iframe.id = 'graph-view-iframe';

    // Set the source to your Next.js app with the Notion page ID

    // Use the new extension route
    iframe.src = `${appBaseUrl}${pathExtension}/${notionPageId}?utm_source=notion-chrome-extension`;

    // Add the iframe to the sidebar
    sidebar.appendChild(iframe);
    setNotionAppSidebarWidth();

    // Add the sidebar to the page
    document.body.appendChild(sidebar);
    chrome.storage.local.set({ lastUrl: notionUrl }, () => {
        console.log('lastUrl set to', notionUrl);
    });
}
const updateGraphModeIframe = () => {
    setNotionAppSidebarWidth();
    const iframe = document.getElementById('graph-view-iframe');
    if (iframe) {
        console.log('Updating iframe');
        iframe.src = `${appBaseUrl}${pathExtension}/${extractNotionPageId(window.location.href)}?utm_source=notion-chrome-extension`;
    }
}

// Optional: You can add a button directly to the Notion UI
function addGraphViewButton() {
    // Check if we've already added the button
    if (document.getElementById('graph-view-button')) {
        return;
    }

    // Create a floating button
    const button = document.createElement('button');
    button.id = 'graph-view-button';
    button.textContent = 'Open in Graph-View';
    button.style.position = 'fixed';
    button.style.bottom = '20px';
    button.style.right = '20px';
    button.style.zIndex = '9999';
    button.style.padding = '8px 16px';
    button.style.backgroundColor = '#6366f1';
    button.style.color = 'white';
    button.style.border = 'none';
    button.style.borderRadius = '4px';
    button.style.fontWeight = 'bold';
    button.style.cursor = 'pointer';
    button.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.1)';

    // Add hover effect
    button.addEventListener('mouseover', function () {
        button.style.backgroundColor = '#4f46e5';
    });
    button.addEventListener('mouseout', function () {
        button.style.backgroundColor = '#6366f1';
    });

    // Add click handler
    button.addEventListener('click', function () {
        // Instead of sending a message to open a new tab, open the sidebar
        createGraphModeSidebar(window.location.href);
    });

    // Add the button to the page
    document.body.appendChild(button);
}

// Run the function when the page loads
window.addEventListener('load', addGraphViewButton);

// Listen for messages from the background script or popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'getPageInfo') {
        const pageInfo = {
            url: window.location.href,
            title: document.title,
            pageId: extractNotionPageId(window.location.href),
        };

        sendResponse(pageInfo);
    } else if (message.action === 'openSidebar') {
        createGraphModeSidebar(window.location.href);
        sendResponse({ success: true });
    } else if (message.action === 'urlChanged') {
        // Perform actions here (e.g., update iframe, save data)
        console.log('URL changed to:', message.url);
        updateGraphModeIframe();
    }

});

window.addEventListener('message', function (e) {

    if (!e.origin.includes('https://graph-mode.com') && !e.origin.includes('http://localhost:3000')) return;
    if (e.data && e.data.redirectGraphModeUrl) {
        window.location.href = e.data.redirectGraphModeUrl;
    }
});