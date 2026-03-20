const { RacerFramework } = require('@racer/core')

async function main() {
  console.log('🏎️  Starting Racer.js Demo Application\n')

  const framework = new RacerFramework({
    rootDir: __dirname,
    previewPort: 3000,
    apiPort: 4000,
    enableAgent: true
  })

  process.on('SIGINT', async () => {
    console.log('\n\n👋 Shutting down...')
    await framework.stop()
    process.exit(0)
  })

  await framework.start()

  const agent = framework.getAgentEngine()
  if (agent) {
    console.log('\n🤖 Demonstrating Agent Capabilities...\n')
    const result = await agent.generateCode({
      prompt: 'Create a welcome component',
      language: 'typescript'
    })
    console.log('  ✓ Generated sample code')
  }

  console.log('\n✨ Visit http://localhost:3000 and http://localhost:4000\n')
}

main().catch(console.error)
