# Getting Started: Build a Full-Stack App in 5 Minutes

This tutorial will guide you through building a complete full-stack Todo application using Racer.js, from code generation to production deployment.

## Prerequisites

- Node.js 20.9.0 or higher
- pnpm 9.6.0 (or npm/yarn)
- Basic knowledge of Next.js and TypeScript

## Step 1: Setup (1 minute)

```bash
# Initialize a new Next.js project
npx create-next-app@latest my-todo-app --typescript --app
cd my-todo-app

# Install Racer.js
npm install @racer/core

# Create racer configuration
cat > racer.config.js << EOF
module.exports = {
  rootDir: __dirname,
  previewPort: 3000,
  apiPort: 4000,
  enableAgent: true,
  agentConfig: {
    autoFix: true
  }
}
EOF
```

## Step 2: Start the Framework (30 seconds)

Create `start-racer.ts`:

```typescript
import { RacerFramework } from '@racer/core'

async function main() {
  const framework = new RacerFramework({
    rootDir: __dirname,
    previewPort: 3000,
    apiPort: 4000,
    enableAgent: true
  })

  await framework.start()
  
  // Keep running
  process.on('SIGINT', async () => {
    await framework.stop()
    process.exit(0)
  })
}

main().catch(console.error)
```

Run it:

```bash
npx tsx start-racer.ts
```

You should see:
```
🚀 Initializing Racer.js Framework...
  ✓ Initializing AI Agent Engine...
  ✓ Initializing Agent Coordinator...
  ✓ Initializing Preview Server...
  ✓ Initializing API Deployer...
  ✓ Initializing DevOps Lifecycle Manager...
✅ Racer.js Framework initialized successfully!

🎯 Starting Racer.js Framework Services...
  ✓ Preview Server: http://localhost:3000
  ✓ API Server: http://localhost:4000

🎉 Racer.js Framework is running!
```

## Step 3: Generate the Todo Feature (1 minute)

Create `generate-todo.ts`:

```typescript
import { RacerFramework } from '@racer/core'
import * as fs from 'fs/promises'
import * as path from 'path'

async function main() {
  const framework = new RacerFramework({
    rootDir: __dirname,
    enableAgent: true
  })

  await framework.initialize()

  const coordinator = framework.getAgentCoordinator()!

  console.log('🎨 Generating Todo App...\n')

  // Generate the complete Todo feature
  const todoFeature = await coordinator.generateCoordinated({
    frontend: {
      prompt: 'Create a TodoList component with add, complete, and delete functionality'
    },
    backend: {
      prompt: 'Create server actions for creating, updating, and deleting todos'
    },
    database: {
      model: 'Todo',
      fields: {
        id: 'string',
        title: 'string',
        completed: 'boolean',
        createdAt: 'Date',
        updatedAt: 'Date'
      }
    },
    strategy: 'server-action' // Best for form submissions and mutations
  })

  // Write the generated files
  console.log('\n📝 Writing generated files...\n')

  // Frontend component
  if (todoFeature.frontend) {
    const frontendPath = path.join(__dirname, todoFeature.frontend.filePath)
    await fs.mkdir(path.dirname(frontendPath), { recursive: true })
    await fs.writeFile(frontendPath, todoFeature.frontend.code)
    console.log(`✅ Created: ${todoFeature.frontend.filePath}`)
  }

  // Backend server action
  if (todoFeature.backend) {
    const backendPath = path.join(__dirname, todoFeature.backend.filePath)
    await fs.mkdir(path.dirname(backendPath), { recursive: true })
    await fs.writeFile(backendPath, todoFeature.backend.code)
    console.log(`✅ Created: ${todoFeature.backend.filePath}`)
  }

  // Additional files (types, utilities, etc.)
  if (todoFeature.additionalFiles) {
    for (const [filePath, content] of todoFeature.additionalFiles) {
      const fullPath = path.join(__dirname, filePath)
      await fs.mkdir(path.dirname(fullPath), { recursive: true })
      await fs.writeFile(fullPath, content)
      console.log(`✅ Created: ${filePath}`)
    }
  }

  console.log('\n' + todoFeature.instructions)
  console.log('\n🎉 Todo app generated successfully!')
}

main().catch(console.error)
```

Run it:

```bash
npx tsx generate-todo.ts
```

Output:
```
🎨 Generating Todo App...

🔄 Coordinating full-stack code generation...

📝 Writing generated files...

✅ Created: app/components/TodoList.tsx
✅ Created: app/actions/manage-todo.ts
✅ Created: types/database.ts

Server Actions Flow:
1. Server Action created at: app/actions/manage-todo.ts
2. Client Component created at: app/components/TodoList.tsx
3. Component uses 'use client' directive
4. Server Action is called directly from the component
5. No API routes needed - direct server communication

🎉 Todo app generated successfully!
```

## Step 4: Create a Page to Use the Component (30 seconds)

Create `app/todos/page.tsx`:

```typescript
import TodoList from '@/app/components/TodoList'

export default function TodosPage() {
  return (
    <main className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">My Todos</h1>
      <TodoList />
    </main>
  )
}
```

## Step 5: Run Pre-Deployment Checks (30 seconds)

Create `check-security.ts`:

```typescript
import { RacerFramework } from '@racer/core'

async function main() {
  const framework = new RacerFramework({
    rootDir: __dirname,
    enableAgent: true
  })

  await framework.initialize()

  const lifecycle = framework.getLifecycleManager()!

  console.log('🔍 Running pre-deployment security checks...\n')

  const { passed, checks } = await lifecycle.runPreDeploymentChecks()

  if (passed) {
    console.log('\n✅ All security checks passed!')
    console.log('Ready to deploy to production.')
  } else {
    console.log('\n❌ Security checks failed!')
    const critical = checks.filter(c => c.severity === 'critical')
    critical.forEach(check => {
      console.log(`  ❌ ${check.type}: ${check.message}`)
    })
  }
}

main().catch(console.error)
```

Run it:

```bash
npx tsx check-security.ts
```

## Step 6: Generate CI/CD Pipeline (30 seconds)

Create `setup-cicd.ts`:

```typescript
import { RacerFramework } from '@racer/core'
import * as fs from 'fs/promises'
import * as path from 'path'

async function main() {
  const framework = new RacerFramework({
    rootDir: __dirname,
    enableAgent: true
  })

  await framework.initialize()

  const lifecycle = framework.getLifecycleManager()!

  console.log('⚙️  Setting up CI/CD...\n')

  // Generate GitHub Actions workflow
  const githubActions = await lifecycle.generateCIConfig('github-actions')
  const workflowPath = path.join(__dirname, '.github/workflows/ci.yml')
  await fs.mkdir(path.dirname(workflowPath), { recursive: true })
  await fs.writeFile(workflowPath, githubActions)
  console.log('✅ Created: .github/workflows/ci.yml')

  // Generate Docker configuration
  const dockerfile = lifecycle.generateDockerfile()
  await fs.writeFile('Dockerfile', dockerfile)
  console.log('✅ Created: Dockerfile')

  const dockerCompose = lifecycle.generateDockerCompose()
  await fs.writeFile('docker-compose.yml', dockerCompose)
  console.log('✅ Created: docker-compose.yml')

  // Setup monitoring
  const monitoring = await lifecycle.setupMonitoring()
  const monitoringPath = path.join(__dirname, 'lib/monitoring.ts')
  await fs.mkdir(path.dirname(monitoringPath), { recursive: true })
  await fs.writeFile(monitoringPath, monitoring)
  console.log('✅ Created: lib/monitoring.ts')

  console.log('\n🎉 CI/CD setup complete!')
}

main().catch(console.error)
```

Run it:

```bash
npx tsx setup-cicd.ts
```

## Step 7: Deploy to Production (30 seconds)

Create `deploy.ts`:

```typescript
import { RacerFramework } from '@racer/core'

async function main() {
  const framework = new RacerFramework({
    rootDir: __dirname,
    enableAgent: true
  })

  await framework.initialize()

  const lifecycle = framework.getLifecycleManager()!

  console.log('🚀 Deploying to production...\n')

  // Option 1: Deploy to Vercel
  const deployment = await lifecycle.deploy({
    name: 'production',
    type: 'vercel',
    config: {
      // Add your Vercel config here
      projectId: process.env.VERCEL_PROJECT_ID
    }
  })

  if (deployment.success) {
    console.log(`\n✅ Deployment successful!`)
    console.log(`🌐 URL: ${deployment.url}`)
    console.log(`📝 ${deployment.message}`)
  } else {
    console.log(`\n❌ Deployment failed: ${deployment.message}`)
  }
}

main().catch(console.error)
```

Run it:

```bash
npx tsx deploy.ts
```

## Complete! 🎉

You've just:

1. ✅ Set up Racer.js
2. ✅ Generated a full-stack Todo app
3. ✅ Created coordinated frontend and backend code
4. ✅ Ran security checks
5. ✅ Set up CI/CD pipeline
6. ✅ Generated Docker configuration
7. ✅ Deployed to production

All in under 5 minutes!

## What's Next?

### Add More Features

Generate additional features:

```typescript
// Generate user authentication
const auth = await coordinator.generateCoordinated({
  frontend: { prompt: 'Create login and signup forms' },
  backend: { prompt: 'Create user authentication actions' },
  strategy: 'server-action'
})

// Generate public API
const api = await coordinator.generateCoordinated({
  backend: { prompt: 'Create RESTful todos API' },
  strategy: 'api-route'
})
```

### Customize Generation

```typescript
const customFeature = await coordinator.generateCoordinated({
  frontend: {
    prompt: 'Create a dashboard with charts',
    language: 'typescript'
  },
  backend: {
    prompt: 'Create analytics API',
    language: 'typescript'
  },
  database: {
    model: 'Analytics',
    fields: {
      userId: 'string',
      metric: 'string',
      value: 'number',
      timestamp: 'Date'
    }
  },
  strategy: 'api-route'
})
```

### Deploy to Different Targets

```typescript
// Deploy to AWS
await lifecycle.deploy({
  name: 'aws-production',
  type: 'aws',
  config: {
    region: 'us-east-1',
    bucket: 'my-app-bucket'
  }
})

// Deploy with Docker
await lifecycle.deploy({
  name: 'docker-production',
  type: 'docker'
})
```

## Troubleshooting

### Issue: Build errors

```bash
# Clean and rebuild
npm run clean
npm run build
```

### Issue: Port already in use

Change ports in `racer.config.js`:

```javascript
module.exports = {
  previewPort: 3001,
  apiPort: 4001
}
```

### Issue: Type errors

Ensure TypeScript is configured:

```bash
npx tsc --init
```

## Resources

- [Integration Guide](./packages/racer/INTEGRATION_GUIDE.md)
- [Architecture](./INTEGRATED_AGENT_ARCHITECTURE.md)
- [Framework Documentation](./RACER_FRAMEWORK.md)
- [Examples](./packages/racer/examples/)

## Support

Need help? Open an issue on [GitHub](https://github.com/Dhananjay-latpate/racer.js/issues)

Happy coding! 🚀
