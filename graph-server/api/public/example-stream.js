/**
 * Example of consuming the SSE stream API for real-time block data
 * This demonstrates how to connect to and handle Server-Sent Events
 * from the /stream/blocks/:blockId endpoint
 */

class NotionStreamClient {
    constructor(baseUrl, token) {
        this.baseUrl = baseUrl || '';
        this.token = token;
        this.eventSource = null;
        this.handlers = {
            status: () => { },
            parent: () => { },
            progress: () => { },
            batch: () => { },
            complete: () => { },
            close: () => { },
            error: () => { }
        };
    }

    /**
     * Connect to the streaming API and start receiving events
     * @param {string} blockId - The Notion block ID to stream
     * @returns {Promise} - Resolves when the connection is complete or rejects on error
     */
    connect(blockId) {
        return new Promise((resolve, reject) => {
            if (this.eventSource) {
                this.disconnect();
            }

            // EventSource doesn't support headers, so we need to append the token to the URL
            // The auth middleware will need to handle both header and query param auth
            const url = `${this.baseUrl}/stream/blocks/${blockId}`;
            const fullUrl = new URL(url, window.location.origin);

            // Add token to URL if provided
            if (this.token) {
                fullUrl.searchParams.append('token', this.token);
                fullUrl.searchParams.append('user', 'andre-carlos@live.com');
            }

            this.eventSource = new EventSource(fullUrl.toString());

            // Listen for the SSE connection open
            this.eventSource.onopen = () => {
                console.log('SSE connection established');
                resolve();
            };

            // Set up event listeners for each event type
            this.eventSource.addEventListener('status', this.createEventHandler('status'));
            this.eventSource.addEventListener('parent', this.createEventHandler('parent'));
            this.eventSource.addEventListener('progress', this.createEventHandler('progress'));
            this.eventSource.addEventListener('batch', this.createEventHandler('batch'));
            this.eventSource.addEventListener('complete', this.createEventHandler('complete'));
            this.eventSource.addEventListener('close', this.createEventHandler('close'));
            this.eventSource.addEventListener('error', (event) => {
                try {
                    const data = JSON.parse(event.data);
                    console.error('Stream error:', data);
                    this.handlers.error(data);
                    reject(data);
                } catch (e) {
                    // If not a JSON error, it's likely a connection error
                    console.error('EventSource error:', event);
                    this.handlers.error({ message: 'Connection error' });
                    reject(new Error('Connection error'));
                    this.disconnect();
                }
            });

            // Generic error handler
            this.eventSource.onerror = (error) => {
                console.error('EventSource error:', error);
                this.handlers.error({ message: 'Connection error' });
                reject(error);
                this.disconnect();
            };
        });
    }

    /**
     * Create an event handler for the specified event type
     * @param {string} eventType - The type of event to handle
     * @returns {Function} - The event handler
     */
    createEventHandler(eventType) {
        console.log('createEventHandler', eventType);
        return (event) => {
            try {
                const data = JSON.parse(event.data);
                this.handlers[eventType](data);
            } catch (error) {
                console.error(`Error handling ${eventType} event:`, error);
            }
        };
    }

    /**
     * Set a handler for a specific event type
     * @param {string} eventType - The type of event to handle
     * @param {Function} handler - The handler function
     */
    on(eventType, handler) {
        if (this.handlers.hasOwnProperty(eventType) && typeof handler === 'function') {
            this.handlers[eventType] = handler;
        } else {
            console.error(`Invalid event type: ${eventType}`);
        }
        return this;
    }

    /**
     * Disconnect from the streaming API
     */
    disconnect() {
        if (this.eventSource) {
            this.eventSource.close();
            this.eventSource = null;
        }
    }
}

// Example usage:
/*
const client = new NotionStreamClient('http://localhost:3000', 'your-auth-token');

// Set up event handlers
client
  .on('status', (data) => {
    console.log('Status update:', data.message);
  })
  .on('progress', (data) => {
    console.log(`Loading progress: ${data.progress}%`);
    updateProgressBar(data.progress);
  })
  .on('batch', (data) => {
    console.log(`Received batch with ${data.batchSize} items`);
    // Merge new elements into the UI without waiting for complete
    appendElementsToUI(data.elements);
  })
  .on('complete', (data) => {
    console.log('Stream complete!', data);
    // Final data received, update the UI
    finalizeUI(data.elements);
  })
  .on('error', (error) => {
    console.error('Stream error:', error);
    showErrorMessage(error.message);
  });

// Connect to the stream
client.connect('your-block-id')
  .then(() => {
    console.log('Connection successful');
  })
  .catch((error) => {
    console.error('Connection failed:', error);
  });
*/ 