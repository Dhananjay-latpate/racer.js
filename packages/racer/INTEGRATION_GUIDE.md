# Racer.js - Full-Stack Code Generation Guide

## Overview

Racer.js now includes **coordinated backend-frontend code generation** and **DevOps lifecycle management** to accelerate full-stack development with Next.js App Router.

## Key Features

### 🤝 Backend-Frontend Coordination

Generate coordinated code that works seamlessly across your entire stack:

- **Server Actions**: For form submissions and data mutations
- **API Routes**: For RESTful API endpoints (App Router style)
- **React Server Components**: For direct data fetching

### 🔄 DevOps Lifecycle Management

Complete development lifecycle automation:

- **CI/CD Integration**: Auto-generate GitHub Actions, GitLab CI, Jenkins pipelines
- **Security Checks**: Pre-deployment vulnerability scanning
- **Deployment Automation**: Deploy to Vercel, AWS, Docker, or locally
- **Monitoring Setup**: Error tracking and performance monitoring

## Quick Start

### 1. Basic Setup

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

### 2. Generate Coordinated Full-Stack Code

```typescript
const coordinator = framework.getAgentCoordinator()

// Generate a complete feature with backend and frontend
const result = await coordinator.generateCoordinated({
  frontend: {
    prompt: 'Create a UserProfile component'
  },
  backend: {
    prompt: 'Create user profile API endpoint'
  },
  database: {
    model: 'User',
    fields: {
      id: 'string',
      name: 'string',
      email: 'string',
      createdAt: 'Date',
      updatedAt: 'Date'
    }
  },
  strategy: 'server-action' // or 'api-route' or 'rsc'
})

console.log(result.frontend?.filePath) // app/components/UserProfile.tsx
console.log(result.backend?.filePath)  // app/actions/user-profile-action.ts
console.log(result.instructions)       // Integration instructions
```

## Code Generation Strategies

### Strategy 1: Server Actions (Recommended for Mutations)

Best for: Forms, data mutations, user actions

```typescript
const result = await coordinator.generateCoordinated({
  frontend: { prompt: 'Create a product form component' },
  backend: { prompt: 'Create product submission handler' },
  strategy: 'server-action'
})
```

**Generated Files:**
- `app/actions/create-product.ts` - Server Action
- `app/components/ProductForm.tsx` - Client Component with form
- `types/database.ts` - TypeScript types

**Benefits:**
- No API routes needed
- Direct server communication
- Type-safe
- Automatic revalidation

### Strategy 2: API Routes (For REST APIs)

Best for: Public APIs, mobile apps, external integrations

```typescript
const result = await coordinator.generateCoordinated({
  frontend: { prompt: 'Create a products list component' },
  backend: { prompt: 'Create products API endpoint' },
  strategy: 'api-route'
})
```

**Generated Files:**
- `app/api/products/route.ts` - API Route Handler
- `app/components/ProductsList.tsx` - Component with fetch
- `lib/api-client.ts` - API client utilities

**Benefits:**
- RESTful API design
- Can be consumed by any client
- Standard HTTP methods
- Easy to test

### Strategy 3: React Server Components

Best for: Read-heavy pages, SEO-critical content

```typescript
const result = await coordinator.generateCoordinated({
  frontend: { prompt: 'Create a blog posts page' },
  backend: { prompt: 'Fetch blog posts from database' },
  strategy: 'rsc'
})
```

**Generated Files:**
- `app/components/BlogPosts.tsx` - Server Component
- `lib/data-fetchers.ts` - Data fetching utilities

**Benefits:**
- Zero client JavaScript
- Automatic caching
- Direct database access
- SEO-friendly

## DevOps Lifecycle Management

### 1. Pre-Deployment Checks

```typescript
const lifecycle = framework.getLifecycleManager()

const { passed, checks } = await lifecycle.runPreDeploymentChecks()

if (!passed) {
  console.log('Critical issues found:')
  checks
    .filter(c => c.severity === 'critical')
    .forEach(c => console.log(`- ${c.message}`))
}
```

### 2. Generate CI/CD Configuration

```typescript
// GitHub Actions
const githubActions = await lifecycle.generateCIConfig('github-actions')
await fs.writeFile('.github/workflows/ci.yml', githubActions)

// GitLab CI
const gitlabCI = await lifecycle.generateCIConfig('gitlab-ci')
await fs.writeFile('.gitlab-ci.yml', gitlabCI)

// Jenkins
const jenkins = await lifecycle.generateCIConfig('jenkins')
await fs.writeFile('Jenkinsfile', jenkins)
```

### 3. Deploy to Target Environment

```typescript
const result = await lifecycle.deploy({
  name: 'production',
  type: 'vercel',
  config: {
    projectId: 'your-project-id'
  }
})

if (result.success) {
  console.log(`Deployed to: ${result.url}`)
}
```

### 4. Generate Docker Configuration

```typescript
const dockerfile = lifecycle.generateDockerfile()
await fs.writeFile('Dockerfile', dockerfile)

const dockerCompose = lifecycle.generateDockerCompose()
await fs.writeFile('docker-compose.yml', dockerCompose)
```

### 5. Setup Monitoring

```typescript
const monitoring = await lifecycle.setupMonitoring()
await fs.writeFile('lib/monitoring.ts', monitoring)

// In your app
import { initMonitoring } from './lib/monitoring'
initMonitoring()
```

## Complete Example: Building a Todo App

```typescript
import { RacerFramework } from '@racer/core'

async function buildTodoApp() {
  // 1. Initialize framework
  const framework = new RacerFramework({
    rootDir: __dirname,
    previewPort: 3000,
    apiPort: 4000
  })
  await framework.start()

  const coordinator = framework.getAgentCoordinator()
  const lifecycle = framework.getLifecycleManager()

  // 2. Generate coordinated code
  const todoFeature = await coordinator.generateCoordinated({
    frontend: {
      prompt: 'Create a TodoList component with add and complete functionality'
    },
    backend: {
      prompt: 'Create todo management actions for create, update, delete'
    },
    database: {
      model: 'Todo',
      fields: {
        id: 'string',
        title: 'string',
        completed: 'boolean',
        createdAt: 'Date'
      }
    },
    strategy: 'server-action'
  })

  // 3. Write generated files
  for (const [path, content] of todoFeature.additionalFiles!) {
    await fs.writeFile(path, content)
  }

  // 4. Run security checks
  const { passed, checks } = await lifecycle.runPreDeploymentChecks()
  
  if (!passed) {
    console.error('Security issues found!')
    return
  }

  // 5. Generate CI/CD
  const ciConfig = await lifecycle.generateCIConfig('github-actions')
  await fs.writeFile('.github/workflows/ci.yml', ciConfig)

  // 6. Deploy
  const deployment = await lifecycle.deploy({
    name: 'production',
    type: 'vercel'
  })

  console.log('✅ Todo app deployed:', deployment.url)
}
```

## Best Practices

### 1. Choose the Right Strategy

- **Server Actions**: Forms, mutations, user actions
- **API Routes**: Public APIs, external integrations
- **RSC**: Read-heavy pages, SEO content

### 2. Use Type-Safe Database Models

Always define your database models for better type safety:

```typescript
database: {
  model: 'User',
  fields: {
    id: 'string',
    name: 'string',
    email: 'string',
    role: 'UserRole',
    createdAt: 'Date'
  }
}
```

### 3. Run Pre-Deployment Checks

Never skip security checks:

```typescript
const { passed } = await lifecycle.runPreDeploymentChecks()
if (!passed) {
  throw new Error('Deployment blocked by security checks')
}
```

### 4. Use Monitoring from Day One

Set up monitoring early:

```typescript
const monitoring = await lifecycle.setupMonitoring()
// Integrate into your app immediately
```

## Configuration

### Framework Configuration

```typescript
const framework = new RacerFramework({
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
})
```

### Lifecycle Configuration

```typescript
const lifecycle = new LifecycleManager({
  enableCI: true,
  enableDeployment: true,
  enableMonitoring: true,
  environment: 'production'
})
```

## Advanced Usage

### Custom Code Generation

```typescript
const agent = framework.getAgentEngine()

// Generate custom code
const result = await agent.generateCode({
  prompt: 'Create a custom authentication middleware',
  language: 'typescript',
  filePath: 'middleware/auth.ts'
})

await agent.applyCode(result, './src')
```

### Manual Deployment

```typescript
const lifecycle = framework.getLifecycleManager()

// Deploy to AWS
const deployment = await lifecycle.deploy({
  name: 'aws-production',
  type: 'aws',
  config: {
    region: 'us-east-1',
    bucket: 'my-app-bucket'
  }
})
```

### Custom Monitoring

```typescript
const monitoring = await lifecycle.setupMonitoring()

// Add custom tracking
import { trackMetric } from './lib/monitoring'
trackMetric('user_signup', 1, { source: 'web' })
```

## API Reference

### AgentCoordinator

- `generateCoordinated(request: CoordinatedRequest): Promise<CoordinatedResult>`

### LifecycleManager

- `initialize(): Promise<void>`
- `runPreDeploymentChecks(): Promise<{ passed: boolean, checks: SecurityCheck[] }>`
- `generateCIConfig(target: string): Promise<string>`
- `deploy(target: DeploymentTarget): Promise<DeploymentResult>`
- `generateDockerfile(): string`
- `generateDockerCompose(): string`
- `setupMonitoring(): Promise<string>`

## Troubleshooting

### Build Errors

If you encounter build errors:

```bash
cd packages/racer
npm run clean
npm run build
```

### Type Errors

Ensure all dependencies are installed:

```bash
npm install @types/node @types/express @types/ws
```

### Deployment Failures

Check pre-deployment results:

```typescript
const { passed, checks } = await lifecycle.runPreDeploymentChecks()
console.log(checks.filter(c => c.severity === 'critical'))
```

## Support

For issues, questions, or contributions:

- GitHub Issues: [racer.js/issues](https://github.com/Dhananjay-latpate/racer.js/issues)
- Documentation: [RACER_FRAMEWORK.md](./RACER_FRAMEWORK.md)
- Implementation Guide: [RACER_IMPLEMENTATION.md](./RACER_IMPLEMENTATION.md)

## License

MIT License - see [license.md](../../license.md)
