# Racer.js Framework - Complete Implementation Guide

## Overview

This document provides a comprehensive guide to the Racer.js framework transformation of the Next.js project.

## What is Racer.js?

Racer.js is **the world's most advanced backend and frontend integrated framework** that extends Next.js with:

1. **🤖 Built-in AI Agent Coding** - Generate code from natural language prompts
2. **🔥 Live Frontend Preview** - Real-time browser preview with hot reload via WebSocket
3. **⚡ Direct API Deployment** - Deploy backend APIs without configuration
4. **🌐 Native Agent Support** - Agent-first architecture for AI-assisted development

## Project Structure

```
packages/racer/
├── src/
│   ├── index.ts              # Main exports
│   ├── types.ts              # TypeScript type definitions
│   ├── core/
│   │   └── framework.ts      # Main RacerFramework orchestrator
│   ├── agent/
│   │   ├── engine.ts         # AI agent code generation engine
│   │   └── index.ts          # Agent exports
│   ├── preview/
│   │   ├── server.ts         # Live preview server with hot reload
│   │   └── index.ts          # Preview exports
│   ├── api/
│   │   ├── deployer.ts       # API deployment and management
│   │   └── index.ts          # API exports
│   └── cli/
│       └── index.ts          # Command-line interface
├── package.json              # Package configuration
├── tsconfig.json             # TypeScript configuration
└── README.md                 # Package documentation
```

## Core Components

### 1. RacerFramework (core/framework.ts)

The main orchestrator that coordinates all framework components:

- Initializes and manages Agent Engine, Preview Server, and API Deployer
- Provides unified start/stop lifecycle
- Handles graceful shutdown
- Exposes component access methods

**Usage:**
```typescript
import { RacerFramework } from '@racer/core'

const framework = new RacerFramework({
  rootDir: __dirname,
  previewPort: 3000,
  apiPort: 4000,
  enableAgent: true
})

await framework.start()
```

### 2. AgentEngine (agent/engine.ts)

AI-powered code generation system:

- Generates components, APIs, and utility functions from prompts
- Template-based code generation (extensible to real AI models)
- Auto-validation and auto-fix capabilities
- Smart file path suggestions
- Import extraction and management

**Features:**
- Component generation (React/Next.js)
- API endpoint generation (REST)
- Utility function generation
- Code validation
- Auto-fix common issues

**Usage:**
```typescript
import { AgentEngine } from '@racer/core/agent'

const agent = new AgentEngine({
  autoFix: true,
  temperature: 0.7
})

const result = await agent.generateCode({
  prompt: 'Create a user profile component',
  language: 'typescript'
})

await agent.applyCode(result, './src')
```

### 3. PreviewServer (preview/server.ts)

Live frontend preview with hot reload:

- Express-based web server
- WebSocket integration for real-time updates
- File watching with chokidar
- Beautiful UI with gradient backgrounds
- Interactive agent interface
- Automatic browser refresh on file changes

**Endpoints:**
- `GET /` - Main preview page
- `GET /agent` - Agent code generation interface
- `GET /health` - Health check
- `GET /api/files/*` - File content API

**Usage:**
```typescript
import { PreviewServer } from '@racer/core/preview'

const preview = new PreviewServer({
  port: 3000,
  rootDir: __dirname,
  hotReload: true
})

await preview.start()
```

### 4. APIDeployer (api/deployer.ts)

Direct API deployment system:

- Express-based API server
- Dynamic endpoint registration
- Auto-generated documentation
- CORS support
- Request logging
- Error handling

**Built-in Endpoints:**
- `GET /health` - Health check
- `GET /api/endpoints` - List all endpoints
- `POST /api/deploy` - Deploy new endpoint
- `GET /api/users` - Demo user endpoint
- `POST /api/users` - Demo user creation
- `GET /api/agent/status` - Agent status

**Usage:**
```typescript
import { APIDeployer } from '@racer/core/api'

const deployer = new APIDeployer({
  port: 4000,
  rootDir: __dirname
})

deployer.registerEndpoint({
  method: 'POST',
  path: '/api/custom',
  handler: async (req, res) => {
    res.json({ message: 'Custom endpoint' })
  }
})

await deployer.start()
```

### 5. CLI Tool (cli/index.ts)

Command-line interface for framework management:

**Commands:**
- `racer init` - Initialize new project
- `racer start` / `racer dev` - Start framework
- `racer generate <prompt>` / `racer gen <prompt>` - Generate code
- `racer help` - Show help

**Usage:**
```bash
# Initialize a new project
racer init

# Start the framework
racer start

# Generate code
racer generate "Create a dashboard component"
```

## Configuration

Create `racer.config.js` in your project root:

```javascript
module.exports = {
  rootDir: __dirname,
  previewPort: 3000,
  apiPort: 4000,
  enableAgent: true,
  agentConfig: {
    model: 'default',
    maxTokens: 2000,
    temperature: 0.7,
    autoFix: true
  }
}
```

## Examples

### Example 1: Basic Setup

```javascript
const { RacerFramework } = require('@racer/core')

const framework = new RacerFramework({
  rootDir: __dirname,
  previewPort: 3000,
  apiPort: 4000
})

framework.start()
```

### Example 2: Custom API Endpoint

```javascript
const deployer = framework.getAPIDeployer()

deployer.registerEndpoint({
  method: 'GET',
  path: '/api/products',
  handler: (req, res) => {
    res.json({ products: [...] })
  },
  description: 'Get all products'
})
```

### Example 3: Generate Code

```javascript
const agent = framework.getAgentEngine()

const result = await agent.generateCode({
  prompt: 'Create a login form component with email and password fields'
})

console.log(result.code)
await agent.applyCode(result, './components')
```

## Key Features Explained

### Hot Reload Mechanism

The preview server uses WebSocket for real-time communication:

1. Client connects via WebSocket
2. Server watches file system with chokidar
3. On file change, server sends reload message
4. Client receives message and refreshes page
5. Instant feedback without manual refresh

### Code Generation System

The agent engine uses a template-based approach:

1. Analyze prompt to determine code type (component, API, utility)
2. Select appropriate template
3. Generate code with context from prompt
4. Validate generated code
5. Apply auto-fixes if enabled
6. Return result with metadata

Templates can be extended or replaced with real AI model calls.

### API Deployment

Dynamic endpoint registration system:

1. Define endpoint with method, path, handler
2. Framework registers with Express
3. Endpoint immediately available
4. Auto-documented in /api/endpoints
5. Full error handling and logging

## Development Workflow

1. **Initialize Project**
   ```bash
   racer init
   ```

2. **Start Framework**
   ```bash
   racer start
   ```

3. **Access Interfaces**
   - Frontend: http://localhost:3000
   - Agent UI: http://localhost:3000/agent
   - API: http://localhost:4000

4. **Generate Code**
   - Use CLI: `racer gen "prompt"`
   - Use Agent UI: Visit /agent and enter prompt
   - Use programmatically: Call agent.generateCode()

5. **Make Changes**
   - Edit any file
   - Browser auto-refreshes
   - See changes instantly

## Integration with Next.js

Racer.js is built as a layer on top of Next.js:

- Uses Next.js for frontend rendering (future integration)
- Provides agent coding capabilities
- Adds live preview infrastructure
- Extends with API deployment system
- Maintains Next.js compatibility

## Future Enhancements

1. **AI Model Integration**
   - Connect to OpenAI, Anthropic, or other LLMs
   - Real intelligent code generation
   - Context-aware suggestions

2. **Visual Editor**
   - Drag-and-drop component builder
   - Visual API designer
   - Real-time code preview

3. **Cloud Deployment**
   - One-click deployment to Vercel
   - AWS Lambda integration
   - Docker containerization

4. **Database Integration**
   - ORM helpers
   - Database schema generation
   - Migration management

5. **Advanced Features**
   - GraphQL support
   - WebSocket API endpoints
   - Microservices architecture
   - CI/CD pipeline integration

## Architecture Decisions

### Why Express?
- Simple, well-tested HTTP server
- Large ecosystem of middleware
- Easy to integrate with Next.js
- Familiar to developers

### Why WebSocket?
- Real-time bidirectional communication
- Low latency for hot reload
- Standard protocol support
- Browser compatibility

### Why Template-Based Generation?
- Works without external API dependencies
- Fast and predictable
- Easy to customize and extend
- Can be replaced with real AI models

### Why Separate Components?
- Modular architecture
- Easy to test individually
- Can be used independently
- Clear separation of concerns

## Security Considerations

1. **Code Execution**
   - Generated code should be reviewed
   - Sandbox execution environment (future)
   - Validation before application

2. **API Endpoints**
   - Authentication needed (future)
   - Rate limiting (future)
   - Input validation
   - CORS properly configured

3. **File System Access**
   - Limited to project directory
   - Path validation
   - No arbitrary file access

## Performance

- Lightweight architecture
- Efficient file watching
- WebSocket for minimal overhead
- Lazy loading of components
- Optimized template system

## Testing Strategy

1. **Unit Tests**
   - Test each component individually
   - Mock external dependencies
   - Test error scenarios

2. **Integration Tests**
   - Test component interactions
   - Test full workflow
   - Test hot reload mechanism

3. **E2E Tests**
   - Test CLI commands
   - Test web interfaces
   - Test code generation flow

## Conclusion

Racer.js transforms Next.js into a powerful, AI-enabled full-stack framework. It provides:

- Faster development with AI assistance
- Instant feedback with hot reload
- Easy API deployment
- Unified development experience
- Production-ready architecture

The framework is designed to be extensible, maintainable, and developer-friendly while maintaining compatibility with the Next.js ecosystem.

## Getting Help

- Documentation: RACER_FRAMEWORK.md
- Package README: packages/racer/README.md
- Example: examples/racer-demo/
- Issues: GitHub Issues

## License

MIT - See license.md
