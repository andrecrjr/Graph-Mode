# Notion Block Data WebSocket API

This document describes how to use the WebSocket API for streaming Notion block data.

## Authentication & Connection Setup

Connect to the WebSocket server with authentication using your Notion API token:

```javascript
import { io } from "socket.io-client";

const socket = io("http://your-server:3001", {
  auth: {
    token: "your-notion-token" // Your Notion API token
  },
  query: {
    user: "user@example.com" // Optional: VIP user email for premium features
  }
});

// Handle connection status
socket.on("connect", () => {
  console.log("Connected to WebSocket server");
});

socket.on("connect_error", (error) => {
  console.error("Connection error:", error.message);
});
```

## Fetching Block Data

To start fetching block data:

```javascript
// Start fetching blocks
socket.emit("fetchBlocks", {
  blockId: "your-notion-block-id"
});
```

The API uses the authenticated Notion instance created during connection, so you don't need to pass it in the request.

## Handling Data Streams

Listen for data events:

```javascript
// Listen for the start of data fetching
socket.on("fetchStart", (data) => {
  console.log(`Started fetching data for block: ${data.blockId}`);
  
  // Initialize your data structures here
  const elements = [];
});

// Process incoming block data in batches
socket.on("blockData", (data) => {
  const { elements: newElements, parentId, batchId } = data;
  
  // Each batch contains new elements only
  console.log(`Received batch ${batchId} with ${newElements.length} elements`);
  
  // Add these new elements to your graph/UI
  elements.push(...newElements);
  updateGraph(elements);
});

// Process individual elements as they're created (fastest streaming option)
socket.on("newElement", (data) => {
  const { element, parentId } = data;
  
  // Process a single new element
  console.log(`Received new element: ${element.type} - ${element.id || element.source}`);
  
  // Add this element to your graph/UI
  elements.push(element);
  updateGraphIncrementally(element);
});

// Handle completion
socket.on("fetchComplete", (data) => {
  const { blockId, metadata } = data;
  console.log(`Completed fetching data for block: ${blockId}`);
  console.log("Metadata:", metadata);
  
  // Finalize your UI/processing
});

// Handle errors
socket.on("error", (error) => {
  console.error("Error:", error.message);
});

// Handle rate limit reached
socket.on("limitReached", (data) => {
  console.warn("Rate limit reached:", data);
  
  // Show appropriate UI feedback
});

// Handle individual batch errors
socket.on("batchError", (data) => {
  console.warn("Batch processing error:", data);
  
  // You may continue with partial data
});
```

## Two Streaming Modes

The API provides two ways to receive data:

1. **Batch Mode** (`blockData` events): Receives small batches of new elements as they're processed
2. **Real-time Mode** (`newElement` events): Receives individual elements immediately as they're created

You can use either or both modes depending on your application's needs:

```javascript
// For maximum performance, use the batched approach
socket.on("blockData", handleBatch);

// For immediate updates, use the real-time approach
socket.on("newElement", handleSingleElement);
```

## Working with the Data

The WebSocket API streams graph elements in the same format as the REST API:

```javascript
// Example element structure
{
  id: "block-id", 
  label: "Block Name", 
  type: "page", // Or other block types
  firstParent: true/false // Indicates if this is the first parent page
}

// Connection elements look like
{
  source: "parent-id",
  target: "child-id",
  type: "node"
}
```

## VIP Status and Rate Limits

If you provide a user email in the connection query and that user has VIP status, you'll receive higher rate limits:

```javascript
// VIP connection example
const socket = io("http://your-server:3001", {
  auth: { token: "your-notion-token" },
  query: { user: "premium-user@example.com" }
});

// The metadata in fetchComplete event will include tier and rate limit info
socket.on("fetchComplete", (data) => {
  console.log("User tier:", data.metadata.tier);
  console.log("Request limit:", data.metadata.requestLimit);
});
```

## Disconnecting

```javascript
// Disconnect when done
socket.disconnect();
```

## Error Handling

The WebSocket API provides several error events:

1. `error` - General errors
2. `batchError` - Errors in processing a specific batch of data
3. `limitReached` - When the API rate limit has been reached

Proper handling of these events will improve the user experience.

## Performance Considerations

- The `newElement` event provides the most real-time updates but may require more UI updates
- The `blockData` event provides batched updates to reduce UI rendering overhead
- Consider using requestAnimationFrame for smoother UI updates
- For large graphs, implement progressive rendering techniques

## Comparison with REST API

The WebSocket API offers these advantages over the REST API:

1. Immediate, real-time rendering as data is processed
2. Better progress indication for large data sets
3. No need for polling or multiple requests
4. Reduced overall latency for large data structures 