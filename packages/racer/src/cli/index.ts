#!/usr/bin/env node

import { RacerFramework } from '../core/framework'
import * as path from 'path'
import * as fs from 'fs'

/**
 * Racer.js CLI - Command Line Interface for the framework
 */

const args = process.argv.slice(2)
const command = args[0]

async function main() {
  console.log('🏎️  Racer.js Framework CLI\n')

  switch (command) {
    case 'start':
    case 'dev':
      await startFramework()
      break
    
    case 'init':
      await initProject()
      break
    
    case 'generate':
    case 'gen':
      await generateCode()
      break
    
    case 'help':
    case '--help':
    case '-h':
    case undefined:
      showHelp()
      break
    
    default:
      console.log(`Unknown command: ${command}`)
      console.log('Run "racer help" for usage information\n')
      process.exit(1)
  }
}

/**
 * Start the Racer framework
 */
async function startFramework() {
  const rootDir = process.cwd()
  const configPath = path.join(rootDir, 'racer.config.js')
  
  let config = {
    rootDir,
    previewPort: 3000,
    apiPort: 4000,
    enableAgent: true
  }

  // Load config file if exists
  if (fs.existsSync(configPath)) {
    console.log('📝 Loading configuration from racer.config.js\n')
    const userConfig = require(configPath)
    config = { ...config, ...userConfig }
  }

  const framework = new RacerFramework(config)

  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n\n👋 Shutting down gracefully...')
    await framework.stop()
    process.exit(0)
  })

  process.on('SIGTERM', async () => {
    await framework.stop()
    process.exit(0)
  })

  await framework.start()

  // Keep the process running
  await new Promise(() => {})
}

/**
 * Initialize a new Racer project
 */
async function initProject() {
  console.log('🎯 Initializing new Racer.js project...\n')

  const rootDir = process.cwd()
  
  // Create racer.config.js
  const configContent = `module.exports = {
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
`

  fs.writeFileSync(path.join(rootDir, 'racer.config.js'), configContent)
  console.log('  ✓ Created racer.config.js')

  // Create directories
  const dirs = ['pages', 'components', 'api', 'public', 'styles']
  for (const dir of dirs) {
    const dirPath = path.join(rootDir, dir)
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true })
      console.log(`  ✓ Created ${dir}/ directory`)
    }
  }

  // Create example files
  const indexPage = `export default function Home() {
  return (
    <div>
      <h1>Welcome to Racer.js!</h1>
      <p>The world's most advanced backend & frontend integrated framework</p>
    </div>
  )
}
`
  fs.writeFileSync(path.join(rootDir, 'pages', 'index.js'), indexPage)
  console.log('  ✓ Created pages/index.js')

  console.log('\n✅ Project initialized successfully!')
  console.log('\nNext steps:')
  console.log('  1. Run "racer start" to start the framework')
  console.log('  2. Open http://localhost:3000 for frontend preview')
  console.log('  3. Open http://localhost:4000 for API endpoints\n')
}

/**
 * Generate code using AI agent
 */
async function generateCode() {
  const prompt = args.slice(1).join(' ')
  
  if (!prompt) {
    console.log('❌ Please provide a code generation prompt')
    console.log('Example: racer generate "Create a user profile component"\n')
    return
  }

  console.log(`🤖 Generating code for: "${prompt}"\n`)

  const rootDir = process.cwd()
  const framework = new RacerFramework({
    rootDir,
    enableAgent: true
  })

  await framework.initialize()

  const agent = framework.getAgentEngine()
  if (!agent) {
    console.log('❌ Agent engine not available')
    return
  }

  const result = await agent.generateCode({ prompt })
  
  console.log('\n📝 Generated Code:')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`File: ${result.filePath}`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  console.log(result.code)
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  
  if (result.explanation) {
    console.log(`\n💡 ${result.explanation}`)
  }

  // Ask to save
  console.log('\n📁 Would you like to save this code? (The file will be created)')
  console.log(`   Path: ${path.join(rootDir, result.filePath)}`)
}

/**
 * Show help information
 */
function showHelp() {
  console.log('Usage: racer <command> [options]\n')
  console.log('Commands:')
  console.log('  start, dev          Start the Racer framework')
  console.log('  init                Initialize a new Racer project')
  console.log('  generate, gen       Generate code using AI agent')
  console.log('  help                Show this help message\n')
  console.log('Examples:')
  console.log('  racer init')
  console.log('  racer start')
  console.log('  racer generate "Create a user profile component"')
  console.log('  racer gen "API endpoint for getting users"\n')
  console.log('For more information, visit: https://github.com/Dhananjay-latpate/racer.js\n')
}

// Run the CLI
main().catch((error) => {
  console.error('❌ Error:', error.message)
  process.exit(1)
})
