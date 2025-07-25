# Notion Graph Visualization

This NodeJS and D3.js project creates interactive graph visualizations based on data from the Notion platform. The visualizations represent pages and their connections, allowing for visual and interactive navigation.

## Features

- **Interactive Graph Visualization**: Displays dynamic graphs with data from Notion pages.
- **Node Interaction**: Allows dragging and dropping nodes, with automatic link adjustment.
- **Direct Links to Pages**: Each node is a hyperlink that opens the corresponding Notion page in a new tab.

## Technologies Used

- **D3.js**: Used for rendering and manipulating the graphs.
- **Express.js**: Backend framework used to create the API that interacts with Notion.
- **Notion API**: Used to fetch data from pages and blocks.

## Project Setup

### Prerequisites

- Node.js
- PNPM, NPM, or Yarn
- Notion account with API integration access

* Enable integration for Notion pages: Ensure your Notion page has the necessary permissions for the integration.

### Installation

1. Clone the repository:
   ```bash
   git clone [REPOSITORY_URL]
   cd [REPOSITORY_NAME]
   ```

2. Install the dependencies:
    ``` bash 
        npm install
    ```

3. Configure the environment variables: Create a .env file in the root of the project with the following variables:
    ```
    PORT=3000
    NOTION_API_KEY=YOUR_NOTION_API_KEY
    API_URL=YOUR_NOTION_API_URL
    ```


### Troubleshooting
Does not fully support multi-column layouts but works well for a general list of pages.

## User Tiers and Limitations

The application implements a tiered access system with different limitations based on user subscription status:

### User Tiers

- **Free**: Basic access with rate limits
- **Premium**: Enhanced access for subscribers
- **Lifetime**: Unlimited access for lifetime purchase users

### Tier Limitations

|                  | Free                 | Premium       | Lifetime      |
|------------------|----------------------|---------------|---------------|
| API Requests     | Limited (default: 5) | High limit    | Unlimited     |
| Caching          | 5 minutes            | 1 minute      | No caching    |
| Batch Processing | Small batches (2)    | Medium (5)    | Large (10)    |

### Testing User Tiers

You can create test users for each tier using the provided script:

```bash
npm run seed:testusers
```

This will create three test users with different tiers:
- free@example.com (Free tier)
- premium@example.com (Premium tier)
- lifetime@example.com (Lifetime tier)

To test different user tiers, append the email as the `user` query parameter:
```
http://localhost:3000/api/blocks/12345?user=premium@example.com
```

### Environment Variables

The following environment variables control the rate limiting:

```
LIMIT_NOTION_REFRESH=5  # Maximum API requests for free users
MAX_NOTES=2             # Maximum daily fast notes for free users
```

## API Implementation

The backend includes the following components to support WebSocket functionality:

### SocketController

The `SocketController` is responsible for managing WebSocket connections. It handles the establishment of connections, broadcasting messages to connected clients, and managing disconnections. This component ensures efficient communication between the server and clients by maintaining active WebSocket connections and handling events such as message reception and transmission. It is designed to support scalable real-time communication, allowing multiple clients to interact with the server simultaneously.

### StreamingProcessor

The `StreamingProcessor` is tasked with processing streaming data to provide real-time updates to clients. It ensures efficient data flow by managing the rate at which data is sent over WebSocket connections. This component implements rate limiting to prevent server overload and ensure fair usage among clients. It uses algorithms to dynamically adjust the data flow based on current server load and client demand, providing a smooth and responsive real-time experience for users.

## Redis Integration

The application utilizes Redis for efficient data caching and session management. Redis is configured to store frequently accessed data, reducing the load on the primary database and improving response times. The Redis connection settings are defined in the environment variables, allowing for easy configuration and scaling. Custom scripts are used to interact with Redis, providing utilities for data retrieval and storage.

## WebSocket Integration

WebSocket is integrated into the application to provide real-time communication between the server and clients. This integration allows for instant updates and message broadcasting, enhancing the user experience with live data feeds. The WebSocket implementation is designed to handle multiple connections efficiently, using libraries that support scalable and robust communication. Configuration settings for WebSocket are defined in the server setup, ensuring secure and reliable connections.