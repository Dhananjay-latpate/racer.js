import * as express from 'express'
import * as http from 'http'
import { Server as WebSocketServer } from 'ws'
import * as path from 'path'
import * as fs from 'fs/promises'
import * as chokidar from 'chokidar'

export interface PreviewServerConfig {
  port: number
  rootDir: string
  hotReload?: boolean
}

/**
 * Preview Server for live frontend testing with hot reload
 */
export class PreviewServer {
  private config: PreviewServerConfig
  private app: express.Application
  private server?: http.Server
  private wss?: WebSocketServer
  private watcher?: chokidar.FSWatcher

  constructor(config: PreviewServerConfig) {
    this.config = config
    this.app = express()
    this.setupMiddleware()
    this.setupRoutes()
  }

  /**
   * Setup Express middleware
   */
  private setupMiddleware(): void {
    this.app.use(express.json())
    this.app.use(express.static(path.join(this.config.rootDir, 'public')))
    
    // CORS for development
    this.app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*')
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
      next()
    })
  }

  /**
   * Setup Express routes
   */
  private setupRoutes(): void {
    // Main preview route
    this.app.get('/', (req, res) => {
      res.send(this.getPreviewHTML())
    })

    // Agent interface route
    this.app.get('/agent', (req, res) => {
      res.send(this.getAgentInterfaceHTML())
    })

    // Health check
    this.app.get('/health', (req, res) => {
      res.json({ status: 'ok', timestamp: new Date().toISOString() })
    })

    // Get file content
    this.app.get('/api/files/*', async (req, res) => {
      try {
        const filePath = req.params[0]
        const fullPath = path.join(this.config.rootDir, filePath)
        const content = await fs.readFile(fullPath, 'utf-8')
        res.json({ content, path: filePath })
      } catch (error) {
        res.status(404).json({ error: 'File not found' })
      }
    })
  }

  /**
   * Start the preview server
   */
  async start(): Promise<void> {
    return new Promise((resolve) => {
      this.server = this.app.listen(this.config.port, () => {
        // Setup WebSocket for hot reload
        if (this.config.hotReload) {
          this.setupHotReload()
        }
        resolve()
      })
    })
  }

  /**
   * Stop the preview server
   */
  async stop(): Promise<void> {
    if (this.watcher) {
      await this.watcher.close()
    }

    if (this.wss) {
      this.wss.close()
    }

    return new Promise((resolve) => {
      if (this.server) {
        this.server.close(() => resolve())
      } else {
        resolve()
      }
    })
  }

  /**
   * Setup hot reload functionality
   */
  private setupHotReload(): void {
    if (!this.server) return

    // Create WebSocket server
    this.wss = new WebSocketServer({ server: this.server })

    this.wss.on('connection', (ws) => {
      console.log('  ↳ Client connected to hot reload')
      
      ws.on('message', (message) => {
        console.log('  ↳ Received:', message.toString())
      })
    })

    // Watch for file changes
    const watchPaths = [
      path.join(this.config.rootDir, 'pages'),
      path.join(this.config.rootDir, 'components'),
      path.join(this.config.rootDir, 'app'),
      path.join(this.config.rootDir, 'src'),
    ]

    this.watcher = chokidar.watch(watchPaths, {
      ignored: /(^|[\/\\])\../, // ignore dotfiles
      persistent: true,
      ignoreInitial: true
    })

    this.watcher
      .on('change', (filePath) => {
        console.log(`  ↳ File changed: ${filePath}`)
        this.notifyClients({ type: 'reload', file: filePath })
      })
      .on('add', (filePath) => {
        console.log(`  ↳ File added: ${filePath}`)
        this.notifyClients({ type: 'reload', file: filePath })
      })
  }

  /**
   * Notify all connected WebSocket clients
   */
  private notifyClients(message: any): void {
    if (!this.wss) return

    this.wss.clients.forEach((client) => {
      if (client.readyState === 1) { // OPEN
        client.send(JSON.stringify(message))
      }
    })
  }

  /**
   * Get preview HTML page
   */
  private getPreviewHTML(): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Racer.js Preview</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    }
    .container {
      text-align: center;
      padding: 3rem;
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      border-radius: 20px;
      box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
      max-width: 800px;
    }
    h1 {
      font-size: 3.5rem;
      margin-bottom: 1rem;
      background: linear-gradient(to right, #fff, #f0f0f0);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .tagline {
      font-size: 1.5rem;
      margin-bottom: 2rem;
      opacity: 0.9;
    }
    .features {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
      margin-top: 3rem;
    }
    .feature {
      padding: 1.5rem;
      background: rgba(255, 255, 255, 0.15);
      border-radius: 15px;
      transition: transform 0.3s ease;
    }
    .feature:hover {
      transform: translateY(-5px);
    }
    .feature-icon {
      font-size: 2.5rem;
      margin-bottom: 0.5rem;
    }
    .links {
      margin-top: 2rem;
      display: flex;
      gap: 1rem;
      justify-content: center;
      flex-wrap: wrap;
    }
    .link {
      padding: 0.75rem 1.5rem;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 10px;
      text-decoration: none;
      color: white;
      font-weight: 600;
      transition: background 0.3s ease;
    }
    .link:hover {
      background: rgba(255, 255, 255, 0.3);
    }
    .status {
      position: fixed;
      bottom: 20px;
      right: 20px;
      padding: 10px 20px;
      background: rgba(0, 0, 0, 0.3);
      border-radius: 10px;
      font-size: 0.9rem;
    }
    .status.connected { border-left: 4px solid #4ade80; }
    .status.disconnected { border-left: 4px solid #f87171; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🏎️ Racer.js</h1>
    <p class="tagline">The World's Most Advanced Backend & Frontend Integrated Framework</p>
    
    <div class="features">
      <div class="feature">
        <div class="feature-icon">🤖</div>
        <h3>AI Agent Coding</h3>
        <p>Built-in code generation</p>
      </div>
      <div class="feature">
        <div class="feature-icon">🔥</div>
        <h3>Hot Reload</h3>
        <p>Instant preview updates</p>
      </div>
      <div class="feature">
        <div class="feature-icon">🚀</div>
        <h3>API Deploy</h3>
        <p>Direct API deployment</p>
      </div>
      <div class="feature">
        <div class="feature-icon">⚡</div>
        <h3>Lightning Fast</h3>
        <p>Optimized performance</p>
      </div>
    </div>

    <div class="links">
      <a href="/agent" class="link">Agent Interface</a>
      <a href="/api/health" class="link">API Status</a>
    </div>
  </div>

  <div class="status" id="status">
    <span id="status-text">Connecting...</span>
  </div>

  <script>
    // WebSocket connection for hot reload
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(protocol + '//' + window.location.host);
    const statusEl = document.getElementById('status');
    const statusText = document.getElementById('status-text');

    ws.onopen = () => {
      statusEl.className = 'status connected';
      statusText.textContent = '🟢 Connected - Hot Reload Active';
      console.log('Connected to Racer.js hot reload');
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('Hot reload event:', data);
      
      if (data.type === 'reload') {
        console.log('Reloading due to file change:', data.file);
        setTimeout(() => window.location.reload(), 100);
      }
    };

    ws.onclose = () => {
      statusEl.className = 'status disconnected';
      statusText.textContent = '🔴 Disconnected';
      console.log('Disconnected from hot reload');
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  </script>
</body>
</html>`
  }

  /**
   * Get agent interface HTML
   */
  private getAgentInterfaceHTML(): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Racer Agent Interface</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      background: #1a1a2e;
      color: #eee;
      padding: 2rem;
    }
    .header {
      text-align: center;
      margin-bottom: 2rem;
    }
    h1 {
      font-size: 2.5rem;
      margin-bottom: 0.5rem;
      background: linear-gradient(to right, #667eea, #764ba2);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: #16213e;
      border-radius: 15px;
      padding: 2rem;
    }
    .prompt-area {
      margin-bottom: 2rem;
    }
    textarea {
      width: 100%;
      min-height: 150px;
      padding: 1rem;
      background: #0f3460;
      border: 2px solid #667eea;
      border-radius: 10px;
      color: #eee;
      font-size: 1rem;
      font-family: inherit;
      resize: vertical;
    }
    .controls {
      display: flex;
      gap: 1rem;
      margin-top: 1rem;
    }
    button {
      padding: 0.75rem 2rem;
      background: linear-gradient(to right, #667eea, #764ba2);
      border: none;
      border-radius: 10px;
      color: white;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.2s ease;
    }
    button:hover {
      transform: translateY(-2px);
    }
    button:active {
      transform: translateY(0);
    }
    .output {
      background: #0f3460;
      border-radius: 10px;
      padding: 1.5rem;
      min-height: 300px;
      margin-top: 2rem;
    }
    .output h3 {
      margin-bottom: 1rem;
      color: #667eea;
    }
    pre {
      background: #1a1a2e;
      padding: 1rem;
      border-radius: 8px;
      overflow-x: auto;
    }
    code {
      color: #4ade80;
      font-family: 'Courier New', monospace;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🤖 Racer Agent Interface</h1>
    <p>Generate code using AI-powered agents</p>
  </div>

  <div class="container">
    <div class="prompt-area">
      <label for="prompt"><strong>Enter your code generation prompt:</strong></label>
      <textarea id="prompt" placeholder="Example: Create a React component for a user profile card with name, email, and avatar"></textarea>
      
      <div class="controls">
        <button onclick="generateCode()">Generate Code</button>
        <button onclick="clearOutput()">Clear</button>
      </div>
    </div>

    <div class="output" id="output">
      <h3>Generated Code</h3>
      <p style="opacity: 0.7;">Your generated code will appear here...</p>
    </div>
  </div>

  <script>
    async function generateCode() {
      const prompt = document.getElementById('prompt').value;
      const output = document.getElementById('output');
      
      if (!prompt.trim()) {
        alert('Please enter a prompt');
        return;
      }

      output.innerHTML = '<h3>Generating...</h3><p>Please wait...</p>';

      try {
        // In production, this would call the agent API
        const mockCode = generateMockCode(prompt);
        
        output.innerHTML = \`
          <h3>✅ Code Generated Successfully</h3>
          <pre><code>\${escapeHtml(mockCode)}</code></pre>
          <p style="margin-top: 1rem; opacity: 0.7;">
            <strong>Note:</strong> In production, this would use AI models for generation.
          </p>
        \`;
      } catch (error) {
        output.innerHTML = '<h3>❌ Error</h3><p>' + error.message + '</p>';
      }
    }

    function generateMockCode(prompt) {
      return \`// Generated by Racer Agent
// Prompt: \${prompt}

export function generatedFunction() {
  // Your AI-generated code here
  return "Generated based on: \${prompt}";
}\`;
    }

    function clearOutput() {
      document.getElementById('output').innerHTML = \`
        <h3>Generated Code</h3>
        <p style="opacity: 0.7;">Your generated code will appear here...</p>
      \`;
      document.getElementById('prompt').value = '';
    }

    function escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }
  </script>
</body>
</html>`
  }
}

export default PreviewServer
