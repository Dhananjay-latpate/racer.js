# Racer.js

🏎️ **The World's Most Advanced Backend and Frontend Integrated Framework**

Racer.js is a revolutionary full-stack framework that combines the power of Next.js with AI-driven code generation, live preview capabilities, and seamless API deployment.

## 🚀 Features

- **🤖 AI Agent Coding**: Built-in AI agent that can generate, modify, and fix code automatically
- **🔥 Live Frontend Preview**: Real-time browser preview with hot reload for instant feedback
- **⚡ Direct API Deployment**: Deploy backend APIs directly without complex configuration
- **🎯 Native Agent Code Support**: Native support for agent-driven development workflows
- **🌐 Full-Stack Integration**: Seamless integration between frontend and backend
- **📦 Zero Config**: Start coding immediately with sensible defaults

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
racer generate "Create a user authentication API endpoint"
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
