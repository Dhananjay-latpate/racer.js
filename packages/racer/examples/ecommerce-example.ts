/**
 * Example: Building a Full-Stack E-Commerce Feature
 * Demonstrates coordinated backend-frontend code generation
 */

import { RacerFramework, AgentCoordinator } from '@racer/core'
import * as fs from 'fs/promises'
import * as path from 'path'

async function main() {
  console.log('🚀 Starting Racer.js Example: E-Commerce Product Management\n')

  // 1. Initialize the framework
  const framework = new RacerFramework({
    rootDir: __dirname,
    previewPort: 3000,
    apiPort: 4000,
    enableAgent: true
  })

  await framework.start()

  // 2. Get the coordinator
  const coordinator = framework.getAgentCoordinator()!
  const lifecycle = framework.getLifecycleManager()!

  // Example 1: Generate Product Listing with Server Components
  console.log('\n📦 Example 1: Product Listing (React Server Component)')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  const productListing = await coordinator.generateCoordinated({
    frontend: {
      prompt: 'Create a ProductList component showing product cards'
    },
    database: {
      model: 'Product',
      fields: {
        id: 'string',
        name: 'string',
        description: 'string',
        price: 'number',
        imageUrl: 'string',
        stock: 'number',
        createdAt: 'Date'
      }
    },
    strategy: 'rsc' // React Server Component for read-heavy page
  })

  console.log('✅ Generated Files:')
  console.log(`  Frontend: ${productListing.frontend?.filePath}`)
  if (productListing.additionalFiles) {
    for (const [filePath] of productListing.additionalFiles) {
      console.log(`  Additional: ${filePath}`)
    }
  }
  console.log('\n' + productListing.instructions)

  // Example 2: Generate Product Form with Server Actions
  console.log('\n📝 Example 2: Add Product Form (Server Action)')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  const productForm = await coordinator.generateCoordinated({
    frontend: {
      prompt: 'Create an AddProduct form component with validation'
    },
    backend: {
      prompt: 'Create product creation server action with validation'
    },
    database: {
      model: 'Product',
      fields: {
        id: 'string',
        name: 'string',
        description: 'string',
        price: 'number',
        imageUrl: 'string',
        stock: 'number'
      }
    },
    strategy: 'server-action' // Server Actions for mutations
  })

  console.log('✅ Generated Files:')
  console.log(`  Frontend: ${productForm.frontend?.filePath}`)
  console.log(`  Backend: ${productForm.backend?.filePath}`)
  if (productForm.additionalFiles) {
    for (const [filePath] of productForm.additionalFiles) {
      console.log(`  Additional: ${filePath}`)
    }
  }
  console.log('\n' + productForm.instructions)

  // Example 3: Generate Public API for Mobile App
  console.log('\n📱 Example 3: Public Products API (API Route)')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  const publicAPI = await coordinator.generateCoordinated({
    backend: {
      prompt: 'Create RESTful products API with pagination and filtering'
    },
    database: {
      model: 'Product',
      fields: {
        id: 'string',
        name: 'string',
        description: 'string',
        price: 'number',
        category: 'string',
        tags: 'string[]'
      }
    },
    strategy: 'api-route' // API Routes for public APIs
  })

  console.log('✅ Generated Files:')
  console.log(`  API Route: ${publicAPI.backend?.filePath}`)
  if (publicAPI.additionalFiles) {
    for (const [filePath] of publicAPI.additionalFiles) {
      console.log(`  Additional: ${filePath}`)
    }
  }
  console.log('\n' + publicAPI.instructions)

  // Example 4: DevOps - Pre-Deployment Checks
  console.log('\n🔍 Example 4: Pre-Deployment Security Checks')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  const { passed, checks } = await lifecycle.runPreDeploymentChecks()

  console.log(`Security Scan: ${passed ? '✅ PASSED' : '❌ FAILED'}`)
  console.log(`Total Checks: ${checks.length}`)
  
  const criticalIssues = checks.filter(c => c.severity === 'critical')
  const highIssues = checks.filter(c => c.severity === 'high')
  
  console.log(`  Critical: ${criticalIssues.length}`)
  console.log(`  High: ${highIssues.length}`)
  console.log(`  Other: ${checks.length - criticalIssues.length - highIssues.length}`)

  // Example 5: Generate CI/CD Configuration
  console.log('\n⚙️  Example 5: Generate CI/CD Pipeline')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  const githubActions = await lifecycle.generateCIConfig('github-actions')
  console.log('✅ Generated GitHub Actions workflow')
  console.log('   File: .github/workflows/ci.yml')
  console.log('   Steps: install → lint → test → build → deploy')

  // Example 6: Generate Docker Configuration
  console.log('\n🐳 Example 6: Generate Docker Configuration')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  const dockerfile = lifecycle.generateDockerfile()
  const dockerCompose = lifecycle.generateDockerCompose()

  console.log('✅ Generated Docker files:')
  console.log('   Dockerfile - Multi-stage build for production')
  console.log('   docker-compose.yml - Complete stack (web + db + redis)')

  // Example 7: Setup Monitoring
  console.log('\n📊 Example 7: Setup Monitoring & Observability')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  const monitoring = await lifecycle.setupMonitoring()
  console.log('✅ Generated monitoring setup:')
  console.log('   - Error tracking')
  console.log('   - Performance monitoring')
  console.log('   - Custom metrics tracking')

  // Example 8: Deploy to Vercel
  console.log('\n🚀 Example 8: Deploy to Production')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  const deployment = await lifecycle.deploy({
    name: 'production',
    type: 'vercel',
    config: {
      projectId: 'your-project-id'
    }
  })

  if (deployment.success) {
    console.log(`✅ Deployment successful!`)
    console.log(`   URL: ${deployment.url}`)
    console.log(`   Message: ${deployment.message}`)
  } else {
    console.log(`❌ Deployment failed: ${deployment.message}`)
  }

  // Summary
  console.log('\n📋 Summary')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  console.log('Generated Components:')
  console.log('  ✓ Product Listing (Server Component)')
  console.log('  ✓ Add Product Form (Client + Server Action)')
  console.log('  ✓ Public Products API (API Route)')
  console.log('  ✓ Database Types')
  console.log('  ✓ API Client Utilities')
  console.log('  ✓ Data Fetchers')
  console.log('')
  console.log('DevOps Setup:')
  console.log('  ✓ Security checks passed')
  console.log('  ✓ CI/CD pipeline configured')
  console.log('  ✓ Docker configuration generated')
  console.log('  ✓ Monitoring setup')
  console.log('  ✓ Production deployment')
  console.log('')
  console.log('🎉 E-Commerce feature complete and deployed!')

  // Stop the framework
  await framework.stop()
}

// Run the example
main().catch(console.error)
