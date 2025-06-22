import { Router } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const socketRouter = Router();

// Serve WebSocket documentation
socketRouter.get('/docs', (req, res) => {
    res.sendFile(path.join(__dirname, '../controller/SocketController/README.md'));
});

// Serve a simple WebSocket example page
socketRouter.get('/example', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>WebSocket Example</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        #status { color: green; }
        #error { color: red; }
        #log { 
          height: 250px; 
          overflow-y: scroll; 
          border: 1px solid #ccc; 
          padding: 10px;
          margin-top: 20px;
          font-family: monospace;
        }
        #graph {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 20px;
        }
        .node {
          border: 1px solid #888;
          border-radius: 4px;
          padding: 8px;
          background: #f9f9f9;
          width: 150px;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .node.page { background: #e6f7ff; }
        .connection {
          font-size: 12px;
          color: #666;
        }
        .info { color: #4444cc; }
        .warning { color: #cc7700; }
        .error { color: #cc0000; }
        .streamMode { 
          margin-top: 15px;
          padding: 10px;
          border: 1px solid #ddd;
        }
        .realtime { border-left: 5px solid #4caf50; }
        .batchMode { border-left: 5px solid #2196f3; }
        #stats {
          margin-top: 20px;
          display: flex;
          gap: 20px;
        }
        .stat {
          padding: 10px;
          background: #f5f5f5;
          border-radius: 4px;
        }
      </style>
    </head>
    <body>
      <h1>WebSocket Notion Block Data Example</h1>
      <div>Status: <span id="status">Disconnected</span></div>
      <div id="error"></div>
      
      <div>
        <label for="blockId">Notion Block ID:</label>
        <input type="text" id="blockId" placeholder="Enter block ID">
      </div>
      <div>
        <label for="token">Notion Token:</label>
        <input type="text" id="token" placeholder="Enter your Notion API token">
      </div>
      <div>
        <label for="user">User Email (optional for VIP):</label>
        <input type="email" id="user" placeholder="Enter email for VIP features">
      </div>
      
      <div>
        <label>Streaming Mode:</label>
        <div>
          <input type="checkbox" id="useBatchMode" checked>
          <label for="useBatchMode">Use Batch Mode</label>
        </div>
        <div>
          <input type="checkbox" id="useRealTimeMode" checked>
          <label for="useRealTimeMode">Use Real-time Mode</label>
        </div>
      </div>
      
      <button id="connect">Connect</button>
      <button id="fetch" disabled>Fetch Block Data</button>
      <button id="disconnect" disabled>Disconnect</button>
      
      <div id="stats">
        <div class="stat">Elements: <span id="elementCount">0</span></div>
        <div class="stat">Pages: <span id="pageCount">0</span></div>
        <div class="stat">Connections: <span id="connectionCount">0</span></div>
        <div class="stat">Batches: <span id="batchCount">0</span></div>
        <div class="stat">Individual updates: <span id="updateCount">0</span></div>
      </div>
      
      <div class="streamMode batchMode">
        <h2>Batch Mode Data Log</h2>
        <div id="batchLog" class="log"></div>
      </div>
      
      <div class="streamMode realtime">
        <h2>Real-time Mode Data Log</h2>
        <div id="realtimeLog" class="log"></div>
      </div>
      
      <h2>Graph Visualization</h2>
      <div id="graph"></div>
      
      <script src="/socket.io/socket.io.js"></script>
      <script>
        const statusEl = document.getElementById('status');
        const errorEl = document.getElementById('error');
        const blockIdEl = document.getElementById('blockId');
        const tokenEl = document.getElementById('token');
        const userEl = document.getElementById('user');
        const connectBtn = document.getElementById('connect');
        const fetchBtn = document.getElementById('fetch');
        const disconnectBtn = document.getElementById('disconnect');
        const batchLogEl = document.getElementById('batchLog');
        const realtimeLogEl = document.getElementById('realtimeLog');
        const graphEl = document.getElementById('graph');
        const useBatchModeEl = document.getElementById('useBatchMode');
        const useRealTimeModeEl = document.getElementById('useRealTimeMode');
        
        // Stats elements
        const elementCountEl = document.getElementById('elementCount');
        const pageCountEl = document.getElementById('pageCount');
        const connectionCountEl = document.getElementById('connectionCount');
        const batchCountEl = document.getElementById('batchCount');
        const updateCountEl = document.getElementById('updateCount');
        
        let socket;
        let elements = [];
        let batchCount = 0;
        let updateCount = 0;
        
        // Log helper
        function log(message, type = 'info', target = batchLogEl) {
          const entry = document.createElement('div');
          entry.textContent = \`[\${new Date().toLocaleTimeString()}] \${message}\`;
          entry.className = type;
          target.appendChild(entry);
          target.scrollTop = target.scrollHeight;
        }
        
        // Update stats
        function updateStats() {
          elementCountEl.textContent = elements.length;
          pageCountEl.textContent = elements.filter(el => el.type === 'page').length;
          connectionCountEl.textContent = elements.filter(el => el.type === 'node').length;
          batchCountEl.textContent = batchCount;
          updateCountEl.textContent = updateCount;
        }
        
        // Update graph visualization
        function updateGraph() {
          requestAnimationFrame(() => {
            graphEl.innerHTML = '';
            
            // Create nodes
            const nodes = elements.filter(el => el.type !== 'node');
            nodes.forEach(node => {
              const nodeEl = document.createElement('div');
              nodeEl.className = \`node \${node.type}\`;
              nodeEl.textContent = node.label || node.id;
              nodeEl.title = \`\${node.type}: \${node.id}\`;
              graphEl.appendChild(nodeEl);
            });
            
            // Create connections
            const connections = elements.filter(el => el.type === 'node');
            connections.forEach(conn => {
              const connEl = document.createElement('div');
              connEl.className = 'connection';
              connEl.textContent = \`\${conn.source} → \${conn.target}\`;
              graphEl.appendChild(connEl);
            });
          });
        }
        
        // Helper for a single element update
        function updateSingleElement(element) {
          elements.push(element);
          updateStats();
          // For simplicity, we'll just update the whole graph on each element
          // In a real app, you'd want to add just the new element to the visualization
          updateGraph();
        }
        
        // Connect
        connectBtn.addEventListener('click', () => {
          const token = tokenEl.value.trim();
          const user = userEl.value.trim();
          
          if (!token) {
            errorEl.textContent = 'Please provide a Notion API token';
            return;
          }
          
          // Clear state
          elements = [];
          batchCount = 0;
          updateCount = 0;
          batchLogEl.innerHTML = '';
          realtimeLogEl.innerHTML = '';
          updateStats();
          updateGraph();
          
          try {
            // Create connection options
            const options = {
              auth: { token }
            };
            
            // Add user email for VIP if provided
            if (user) {
              options.query = { user };
            }
            
            // Connect with auth and optional user
            socket = io(options);
            
            socket.on('connect', () => {
              statusEl.textContent = 'Connected';
              connectBtn.disabled = true;
              fetchBtn.disabled = false;
              disconnectBtn.disabled = false;
              errorEl.textContent = '';
              log('Connected to WebSocket server', 'info', batchLogEl);
              log('Connected to WebSocket server', 'info', realtimeLogEl);
              
              if (user) {
                log(\`Authenticated with user: \${user}\`, 'info', batchLogEl);
                log(\`Authenticated with user: \${user}\`, 'info', realtimeLogEl);
              }
            });
            
            socket.on('connect_error', (error) => {
              statusEl.textContent = 'Connection Error';
              errorEl.textContent = error.message;
              log(\`Connection error: \${error.message}\`, 'error', batchLogEl);
              log(\`Connection error: \${error.message}\`, 'error', realtimeLogEl);
            });
            
            // Handle streaming data - batch mode
            socket.on('fetchStart', (data) => {
              log(\`Started fetching data for block: \${data.blockId}\`, 'info', batchLogEl);
              log(\`Started fetching data for block: \${data.blockId}\`, 'info', realtimeLogEl);
              elements = [];
              updateStats();
              updateGraph();
            });
            
            // Handler for batch mode
            socket.on('blockData', (data) => {
              // Skip if batch mode is disabled
              if (!useBatchModeEl.checked) return;
              
              const { elements: newElements, parentId, batchId } = data;
              batchCount++;
              
              log(\`Batch [\${batchCount}] Received \${newElements.length} elements (batchId: \${batchId})\`, 'info', batchLogEl);
              
              // Merge new elements
              elements.push(...newElements);
              updateStats();
              updateGraph();
            });
            
            // Handler for real-time mode
            socket.on('newElement', (data) => {
              // Skip if real-time mode is disabled
              if (!useRealTimeModeEl.checked) return;
              
              const { element, parentId } = data;
              updateCount++;
              
              const elementDesc = element.type === 'node' 
                ? \`Connection from \${element.source} to \${element.target}\`
                : \`\${element.type}: \${element.label || element.id}\`;
                
              log(\`Element [\${updateCount}] \${elementDesc}\`, 'info', realtimeLogEl);
              
              // Add this single element
              updateSingleElement(element);
            });
            
            socket.on('fetchComplete', (data) => {
              const { blockId, metadata } = data;
              log(\`Completed fetching data for block: \${blockId}\`, 'info', batchLogEl);
              log(\`Metadata: \${JSON.stringify(metadata)}\`, 'info', batchLogEl);
              
              log(\`Completed fetching data for block: \${blockId}\`, 'info', realtimeLogEl);
              log(\`Metadata: \${JSON.stringify(metadata)}\`, 'info', realtimeLogEl);
              
              // Highlight VIP status if applicable
              if (metadata.isVip) {
                log(\`VIP status detected: Tier \${metadata.tier}\`, 'info', batchLogEl);
                log(\`VIP status detected: Tier \${metadata.tier}\`, 'info', realtimeLogEl);
              }
            });
            
            socket.on('error', (error) => {
              errorEl.textContent = error.message;
              log(\`Error: \${error.message}\`, 'error', batchLogEl);
              log(\`Error: \${error.message}\`, 'error', realtimeLogEl);
            });
            
            socket.on('limitReached', (data) => {
              log(\`Rate limit reached: \${JSON.stringify(data)}\`, 'warning', batchLogEl);
              log(\`Rate limit reached: \${JSON.stringify(data)}\`, 'warning', realtimeLogEl);
            });
            
            socket.on('batchError', (data) => {
              log(\`Batch processing error: \${data.message}\`, 'warning', batchLogEl);
              log(\`Batch processing error: \${data.message}\`, 'warning', realtimeLogEl);
            });
            
            socket.on('disconnect', () => {
              statusEl.textContent = 'Disconnected';
              connectBtn.disabled = false;
              fetchBtn.disabled = true;
              disconnectBtn.disabled = true;
              log('Disconnected from WebSocket server', 'info', batchLogEl);
              log('Disconnected from WebSocket server', 'info', realtimeLogEl);
            });
            
          } catch (error) {
            errorEl.textContent = error.message;
            log(\`Error creating connection: \${error.message}\`, 'error', batchLogEl);
            log(\`Error creating connection: \${error.message}\`, 'error', realtimeLogEl);
          }
        });
        
        // Fetch data
        fetchBtn.addEventListener('click', () => {
          const blockId = blockIdEl.value.trim();
          if (!blockId) {
            errorEl.textContent = 'Please provide a block ID';
            return;
          }
          
          log(\`Requesting data for block: \${blockId}\`, 'info', batchLogEl);
          log(\`Requesting data for block: \${blockId}\`, 'info', realtimeLogEl);
          socket.emit('fetchBlocks', { blockId });
        });
        
        // Toggle streaming modes
        useBatchModeEl.addEventListener('change', (e) => {
          document.querySelector('.batchMode').style.display = e.target.checked ? 'block' : 'none';
        });
        
        useRealTimeModeEl.addEventListener('change', (e) => {
          document.querySelector('.realtime').style.display = e.target.checked ? 'block' : 'none';
        });
        
        // Disconnect
        disconnectBtn.addEventListener('click', () => {
          if (socket) {
            socket.disconnect();
          }
        });
      </script>
    </body>
    </html>
  `);
});

export { socketRouter };
