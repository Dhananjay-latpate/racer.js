# Racer.js

🏎️ **The World's Most Advanced Backend and Frontend Integrated Framework**

Racer.js is a revolutionary full-stack framework that combines the power of Next.js with AI-driven coordinated code generation, live preview capabilities, seamless API deployment, and complete DevOps lifecycle management.

## 🚀 Features

### AI-Powered Development
- **🤖 Coordinated Code Generation**: Generate frontend and backend code that work together seamlessly
- **🎯 App Router Support**: Server Components, Server Actions, and API Routes
- **🔄 Three Generation Strategies**: Choose between Server Actions, API Routes, or React Server Components
- **🛠️ Auto-Fix**: Automatically fix common code issues

### Development Experience
- **🔥 Live Frontend Preview**: Real-time browser preview with hot reload for instant feedback
- **⚡ Direct API Deployment**: Deploy backend APIs directly without complex configuration
- **🌐 Full-Stack Integration**: Seamless integration between frontend and backend
- **📦 Zero Config**: Start coding immediately with sensible defaults

### DevOps & Operations
- **🔄 CI/CD Integration**: Auto-generate pipelines for GitHub Actions, GitLab CI, Jenkins
- **🔒 Security Checks**: Pre-deployment vulnerability scanning and dependency audits
- **🚀 Multi-Target Deployment**: Deploy to Vercel, AWS, Docker, or locally
- **📊 Monitoring & Observability**: Built-in error tracking and performance monitoring
- **🐳 Docker Support**: Auto-generate Dockerfile and docker-compose configurations

## 📦 Installation

```bash
npm install -g @racer/core
```

Or use with npx:

```bash
npx @racer/core init
```

## 🎯 Quick Start

### Initialize a New Project

```bash
racer init
```

### Start the Framework

```bash
racer start
```

This will start:
- Frontend Preview Server on `http://localhost:3000`
- API Server on `http://localhost:4000`
- AI Agent Coding Interface

### Generate Code with AI

```bash
# Generate coordinated full-stack code
racer generate "Create a user authentication system with login form"

# Generate Server Action
racer gen "Create a product submission form with server action"

# Generate API Route
racer gen "Create a RESTful users API endpoint"
```

## 💡 Usage Examples

### Example 1: Coordinated Full-Stack Generation

```typescript
import { RacerFramework } from '@racer/core'

const framework = new RacerFramework({
  rootDir: __dirname,
  enableAgent: true
})

await framework.start()

const coordinator = framework.getAgentCoordinator()

// Generate coordinated frontend and backend code
const result = await coordinator.generateCoordinated({
  frontend: {
    prompt: 'Create a product list component'
  },
  backend: {
    prompt: 'Create product API endpoint'
  },
  database: {
    model: 'Product',
    fields: {
      id: 'string',
      name: 'string',
      price: 'number',
      description: 'string'
    }
  },
  strategy: 'server-action' // or 'api-route' or 'rsc'
})

console.log('Frontend:', result.frontend?.filePath)
console.log('Backend:', result.backend?.filePath)
```

### Example 2: DevOps Lifecycle

```typescript
const lifecycle = framework.getLifecycleManager()

// Run security checks
const { passed, checks } = await lifecycle.runPreDeploymentChecks()

// Generate CI/CD configuration
const ciConfig = await lifecycle.generateCIConfig('github-actions')

// Deploy to production
const deployment = await lifecycle.deploy({
  name: 'production',
  type: 'vercel'
})

console.log('Deployed to:', deployment.url)
```

### Example 3: Generate Docker Configuration

```typescript
const lifecycle = framework.getLifecycleManager()

// Generate Dockerfile
const dockerfile = lifecycle.generateDockerfile()

// Generate docker-compose.yml
const dockerCompose = lifecycle.generateDockerCompose()

// Setup monitoring
const monitoring = await lifecycle.setupMonitoring()
```

## 📖 Generation Strategies

### Server Actions (Best for Forms & Mutations)

```typescript
await coordinator.generateCoordinated({
  frontend: { prompt: 'Create a signup form' },
  backend: { prompt: 'Create user signup handler' },
  strategy: 'server-action'
})
// ✅ Generates: Client Component + Server Action
// ✅ No API routes needed
// ✅ Type-safe, auto-revalidation
```

### API Routes (Best for Public APIs)

```typescript
await coordinator.generateCoordinated({
  backend: { prompt: 'Create RESTful products API' },
  strategy: 'api-route'
})
// ✅ Generates: API Route Handler + API Client
// ✅ Standard REST patterns
// ✅ Can be consumed by any client
```

### React Server Components (Best for Read-Heavy Pages)

```typescript
await coordinator.generateCoordinated({
  frontend: { prompt: 'Create blog posts page' },
  strategy: 'rsc'
})
// ✅ Generates: Server Component + Data Fetchers
// ✅ Zero client JavaScript
// ✅ Automatic caching
```
racer gen "Build a responsive navbar component"
```

## 🛠️ Configuration

Create a `racer.config.js` in your project root:

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

## 📖 Usage

### Using the Framework Programmatically

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

### AI Agent Code Generation

```typescript
import { AgentEngine } from '@racer/core/agent'

const agent = new AgentEngine({
  model: 'default',
  autoFix: true
})

await agent.initialize()

const result = await agent.generateCode({
  prompt: 'Create a REST API endpoint for user management',
  language: 'typescript'
})

console.log(result.code)
await agent.applyCode(result, './src')
```

### Preview Server

```typescript
import { PreviewServer } from '@racer/core/preview'

const preview = new PreviewServer({
  port: 3000,
  rootDir: __dirname,
  hotReload: true
})

await preview.start()
// Access at http://localhost:3000
```

### API Deployment

```typescript
import { APIDeployer } from '@racer/core/api'

const deployer = new APIDeployer({
  port: 4000,
  rootDir: __dirname
})

// Register custom endpoints
deployer.registerEndpoint({
  method: 'GET',
  path: '/api/custom',
  handler: (req, res) => {
    res.json({ message: 'Custom endpoint' })
  }
})

await deployer.start()
```

## 🎨 Features in Detail

### AI Agent Coding

The AI agent can:
- Generate complete components from descriptions
- Create API endpoints with proper error handling
- Write utility functions and helpers
- Auto-fix common code issues
- Suggest improvements

### Live Preview

- **Hot Reload**: Changes reflected instantly in the browser
- **WebSocket Connection**: Real-time updates without page refresh
- **Multi-Device Testing**: Preview on multiple devices simultaneously
- **Debug Mode**: Built-in debugging tools

### API Deployment

- **Auto-Discovery**: Automatically discovers and registers API routes
- **Documentation**: Auto-generates API documentation
- **Testing Interface**: Built-in API testing tools
- **Version Control**: API versioning support

## 🔧 CLI Commands

```bash
racer init              # Initialize a new project
racer start            # Start the framework
racer dev              # Start in development mode (alias for start)
racer generate <prompt> # Generate code using AI
racer gen <prompt>     # Short alias for generate
racer help             # Show help information
```

## 🌟 Example Projects

Check out the `/examples` directory for sample projects:

- Basic Blog
- E-commerce Site
- Real-time Chat Application
- REST API Backend
- GraphQL Server

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](../../contributing.md) for details.

## 📄 License

MIT License - see [LICENSE](../../license.md) file for details.

## 🔗 Links

- [Documentation](https://racer.js.org/docs)
- [GitHub Repository](https://github.com/Dhananjay-latpate/racer.js)
- [Discord Community](https://discord.gg/racerjs)

## 💡 Why Racer.js?

Traditional frameworks require extensive setup and configuration. Racer.js eliminates this complexity by:

1. **AI-First Approach**: Let AI handle boilerplate and repetitive code
2. **Instant Feedback**: See your changes immediately in the browser
3. **Unified Development**: No context switching between frontend and backend
4. **Zero Config**: Start building immediately with intelligent defaults

## 🎯 Roadmap

- [ ] Enhanced AI models for better code generation
- [ ] Cloud deployment integration
- [ ] Visual code editor
- [ ] Database integration helpers
- [ ] GraphQL support
- [ ] Microservices architecture support
- [ ] Docker containerization
- [ ] CI/CD pipeline integration

---

**Made with ❤️ by the Racer.js Team**
