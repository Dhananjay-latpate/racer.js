# 🏎️ Racer.js Framework

> **The World's Most Advanced Backend and Frontend Integrated Framework with AI Agent Coding**

Racer.js transforms Next.js into a revolutionary full-stack development framework with built-in AI agent coding capabilities, live frontend preview, and direct API deployment.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D20.9.0-brightgreen)](https://nodejs.org/)

## ✨ Key Features

### 🤖 AI Agent Coding
- **Intelligent Code Generation**: Generate components, APIs, and utilities from natural language
- **Auto-Fix**: Automatically fix common code issues and style problems
- **Context-Aware**: Understands your project structure and coding patterns
- **Real-Time Validation**: Validates generated code instantly

### 🔥 Live Frontend Preview
- **Hot Reload**: Instant browser updates without manual refresh
- **WebSocket Integration**: Real-time communication for seamless updates
- **Multi-Device Testing**: Preview on multiple devices simultaneously
- **Interactive Agent Interface**: Generate and test code directly in the browser

### ⚡ Direct API Deployment
- **Zero Configuration**: APIs work out of the box
- **Auto-Documentation**: Generates API docs automatically
- **RESTful Standards**: Following best practices
- **Built-in Testing**: Test endpoints directly from the interface

### 🌐 Native Agent Support
- **Agent-First Architecture**: Built from the ground up for AI-assisted development
- **Extensible Agent System**: Add custom agents for specific tasks
- **Safe Execution**: Sandboxed environment for generated code
- **Version Control Ready**: All generated code is clean and maintainable

## 🚀 Quick Start

### Installation

```bash
# Install globally
npm install -g @racer/core

# Or use directly with npx
npx @racer/core init my-project
cd my-project
```

### Create Your First Project

```bash
# Initialize a new project
racer init

# Start the framework
racer start
```

This starts:
- 🌐 Frontend Preview Server: http://localhost:3000
- 🔌 API Server: http://localhost:4000
- 🤖 AI Agent Interface: http://localhost:3000/agent

### Generate Code with AI

```bash
# Generate a component
racer generate "Create a responsive navigation bar with logo and menu items"

# Generate an API endpoint
racer gen "Build a REST API for user authentication with JWT"

# Generate utilities
racer gen "Create a function to format dates in multiple locales"
```

## 📖 Core Concepts

### The Framework

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

### AI Agent Engine

```typescript
import { AgentEngine } from '@racer/core/agent'

const agent = new AgentEngine({
  model: 'default',
  autoFix: true,
  temperature: 0.7
})

const result = await agent.generateCode({
  prompt: 'Create a user profile card component',
  language: 'typescript'
})

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
```

### API Deployment

```typescript
import { APIDeployer } from '@racer/core/api'

const deployer = new APIDeployer({
  port: 4000,
  rootDir: __dirname
})

deployer.registerEndpoint({
  method: 'POST',
  path: '/api/users',
  handler: async (req, res) => {
    const user = await createUser(req.body)
    res.json({ success: true, user })
  },
  description: 'Create a new user'
})

await deployer.start()
```

## 🎯 Use Cases

### 1. Rapid Prototyping
Generate entire features in seconds:
```bash
racer gen "Create a blog post management system with CRUD operations"
```

### 2. API Development
Build and test APIs instantly:
- Generate endpoints with AI
- Test directly in the browser
- Auto-generate documentation

### 3. Component Library
Create reusable components quickly:
- Generate from descriptions
- Preview in real-time
- Export to any project

### 4. Full-Stack Applications
Build complete applications:
- Frontend with Next.js
- Backend with Express
- AI-assisted development throughout

## 🛠️ Configuration

Create `racer.config.js` in your project root:

```javascript
module.exports = {
  // Project root directory
  rootDir: __dirname,
  
  // Server ports
  previewPort: 3000,
  apiPort: 4000,
  
  // Enable AI agent
  enableAgent: true,
  
  // Agent configuration
  agentConfig: {
    model: 'default',
    maxTokens: 2000,
    temperature: 0.7,
    autoFix: true
  }
}
```

## 📦 Project Structure

```
my-racer-project/
├── racer.config.js      # Framework configuration
├── pages/               # Frontend pages
│   ├── index.js        # Home page
│   └── api/            # API routes
│       └── users.js    # User API endpoints
├── components/          # React components
│   └── Header.js       # Example component
├── public/             # Static files
├── styles/             # CSS/SCSS files
└── lib/                # Utility functions
```

## 🎨 Features in Detail

### AI Agent System

The agent can:
- ✅ Generate React/Next.js components
- ✅ Create API endpoints with error handling
- ✅ Write utility functions and helpers
- ✅ Fix common code issues automatically
- ✅ Suggest code improvements
- ✅ Generate TypeScript types
- ✅ Create test files

### Live Preview

Features:
- ✅ WebSocket-based hot reload
- ✅ Browser auto-refresh on file changes
- ✅ Real-time error display
- ✅ Network request monitoring
- ✅ Performance metrics
- ✅ Mobile device testing

### API System

Capabilities:
- ✅ RESTful API endpoints
- ✅ Auto-generated documentation
- ✅ Built-in request validation
- ✅ Error handling
- ✅ CORS support
- ✅ Rate limiting
- ✅ Authentication helpers

## 🔧 CLI Commands

```bash
racer init              # Initialize new project
racer start            # Start framework services
racer dev              # Start in development mode
racer generate <prompt> # Generate code with AI
racer gen <prompt>     # Short alias for generate
racer help             # Show help information
```

## 🌟 Examples

Check out the `/examples` directory:

- **racer-demo**: Full demo showing all features
- **blog-app**: AI-generated blog application
- **api-backend**: Pure backend API project
- **component-library**: Reusable component collection

## 🔬 Under the Hood

Racer.js is built on:
- **Next.js**: React framework for production
- **Express**: Fast, minimalist web framework
- **WebSocket**: Real-time bidirectional communication
- **TypeScript**: Type-safe development
- **Chokidar**: Efficient file watching

## 🚦 Roadmap

- [x] Core framework architecture
- [x] AI agent code generation
- [x] Live frontend preview
- [x] Direct API deployment
- [ ] Enhanced AI models integration
- [ ] Visual code editor
- [ ] Cloud deployment (Vercel, AWS, Docker)
- [ ] Database integration helpers
- [ ] GraphQL support
- [ ] Microservices architecture
- [ ] CI/CD pipeline integration
- [ ] Plugin marketplace

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](contributing.md) for details.

## 📄 License

MIT License - see [LICENSE](license.md) for details.

## 🔗 Links

- 📚 [Documentation](https://racer.js.org/docs)
- 💬 [Discord Community](https://discord.gg/racerjs)
- 🐛 [Issue Tracker](https://github.com/Dhananjay-latpate/racer.js/issues)
- 📝 [Changelog](CHANGELOG.md)

## 💡 Why Racer.js?

Traditional frameworks require extensive setup, boilerplate, and manual coding for common patterns. Racer.js eliminates this complexity by:

1. **AI-First Approach**: Let AI handle repetitive code
2. **Instant Feedback**: See changes immediately
3. **Unified Development**: No context switching
4. **Zero Config**: Intelligent defaults
5. **Production Ready**: Enterprise-grade architecture

## 🙏 Acknowledgments

Built on top of the amazing Next.js framework and inspired by the developer community's needs for faster, smarter development tools.

---

**Made with ❤️ by the Racer.js Team**

**Star ⭐ this project if you find it useful!**
