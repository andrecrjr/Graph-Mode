# Graph-View Chrome Extension for Notion

This Chrome extension allows you to visualize your Notion pages as interactive graphs directly within Notion using a sidebar.

## Features

- Adds a "Open in Graph-View" button to Notion pages
- Opens a sidebar with an interactive graph visualization of your Notion page
- Requires your Notion access token and email for authentication
- Works with any Notion page

## Installation

### Development Mode

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top-right corner
4. Click "Load unpacked" and select the `chrome-extension` folder from this repository
5. The extension should now be installed and active

### Production Mode (Coming Soon)

The extension will be available on the Chrome Web Store in the future.

## Usage

1. Navigate to any Notion page
2. Click the "Open in Graph-View" button that appears in the bottom-right corner of the page
3. A sidebar will open on the right side of the page
4. Enter your Notion access token and email when prompted
5. The graph visualization will load in the sidebar

## How to Get Your Notion Access Token

1. Log in to Notion in your browser
2. Open the browser's developer tools (F12 or right-click > Inspect)
3. Go to the "Application" tab
4. Under "Storage" > "Cookies", select the Notion site
5. Find the cookie named `token_v2` and copy its value
6. Use this value as your Notion access token when prompted by the extension

## Development

The extension consists of the following components:

- `manifest.json`: Configuration file for the Chrome extension
- `popup/`: Contains the popup UI that appears when clicking the extension icon
- `background/`: Contains the background script that handles events
- `content/`: Contains the content script that injects the button into Notion pages
- `images/`: Contains the extension icons

## Integration with Next.js App

This extension integrates with a Next.js application that provides the graph visualization. The Next.js app has a special route (`/graph/extension/[id]`) that is designed to work within the iframe.

## Troubleshooting

- If the button doesn't appear on a Notion page, try refreshing the page
- If the sidebar doesn't open, check if you're on a valid Notion page
- If the graph doesn't load, verify that your Notion access token and email are correct
- If you encounter any other issues, please report them on the GitHub repository

## Privacy

This extension only accesses your Notion data when you explicitly use it to view a graph. Your Notion access token and email are only sent to the Graph-View server to fetch data and are not stored anywhere else.

## License

This project is licensed under the MIT License - see the LICENSE file for details. 