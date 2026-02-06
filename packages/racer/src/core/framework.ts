import { RacerConfig } from '../types'
import { AgentEngine } from '../agent/engine'
import { PreviewServer } from '../preview/server'
import { APIDeployer } from '../api/deployer'
import * as path from 'path'

/**
 * Main Racer Framework class that orchestrates all components
 */
export class RacerFramework {
  private config: RacerConfig
  private agentEngine?: AgentEngine
  private previewServer?: PreviewServer
  private apiDeployer?: APIDeployer
  private isInitialized = false

  constructor(config: RacerConfig) {
    this.config = {
      previewPort: 3000,
      apiPort: 4000,
      enableAgent: true,
      ...config
    }
  }

  /**
   * Initialize the framework and all its components
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('Framework already initialized')
      return
    }

    console.log('🚀 Initializing Racer.js Framework...')

    // Initialize Agent Engine
    if (this.config.enableAgent) {
      console.log('  ✓ Initializing AI Agent Engine...')
      this.agentEngine = new AgentEngine(this.config.agentConfig)
      await this.agentEngine.initialize()
    }

    // Initialize Preview Server
    console.log('  ✓ Initializing Preview Server...')
    this.previewServer = new PreviewServer({
      port: this.config.previewPort!,
      rootDir: this.config.rootDir,
      hotReload: true
    })

    // Initialize API Deployer
    console.log('  ✓ Initializing API Deployer...')
    this.apiDeployer = new APIDeployer({
      port: this.config.apiPort!,
      rootDir: this.config.rootDir
    })

    this.isInitialized = true
    console.log('✅ Racer.js Framework initialized successfully!')
  }

  /**
   * Start all framework services
   */
  async start(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize()
    }

    console.log('\n🎯 Starting Racer.js Framework Services...')

    // Start Preview Server
    if (this.previewServer) {
      await this.previewServer.start()
      console.log(`  ✓ Preview Server: http://localhost:${this.config.previewPort}`)
    }

    // Start API Server
    if (this.apiDeployer) {
      await this.apiDeployer.start()
      console.log(`  ✓ API Server: http://localhost:${this.config.apiPort}`)
    }

    console.log('\n🎉 Racer.js Framework is running!')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('  Frontend Preview: http://localhost:' + this.config.previewPort)
    console.log('  API Endpoint: http://localhost:' + this.config.apiPort)
    if (this.config.enableAgent) {
      console.log('  Agent Coding: Enabled ✨')
    }
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  }

  /**
   * Stop all framework services
   */
  async stop(): Promise<void> {
    console.log('\n🛑 Stopping Racer.js Framework...')

    if (this.previewServer) {
      await this.previewServer.stop()
    }

    if (this.apiDeployer) {
      await this.apiDeployer.stop()
    }

    console.log('✅ Framework stopped successfully')
  }

  /**
   * Get the agent engine instance
   */
  getAgentEngine(): AgentEngine | undefined {
    return this.agentEngine
  }

  /**
   * Get the preview server instance
   */
  getPreviewServer(): PreviewServer | undefined {
    return this.previewServer
  }

  /**
   * Get the API deployer instance
   */
  getAPIDeployer(): APIDeployer | undefined {
    return this.apiDeployer
  }
}
