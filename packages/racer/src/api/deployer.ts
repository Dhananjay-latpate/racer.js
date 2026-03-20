import * as express from 'express'
import * as http from 'http'
import * as path from 'path'
import * as fs from 'fs/promises'
import { APIEndpoint, DeploymentConfig } from '../types'

export interface APIDeployerConfig {
  port: number
  rootDir: string
}

/**
 * API Deployer for direct backend API deployment
 */
export class APIDeployer {
  private config: APIDeployerConfig
  private app: express.Application
  private server?: http.Server
  private endpoints: Map<string, APIEndpoint> = new Map()

  constructor(config: APIDeployerConfig) {
    this.config = config
    this.app = express()
    this.setupMiddleware()
    this.setupDefaultRoutes()
  }

  /**
   * Setup Express middleware
   */
  private setupMiddleware(): void {
    this.app.use(express.json())
    this.app.use(express.urlencoded({ extended: true }))
    
    // CORS
    this.app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*')
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS')
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
      
      if (req.method === 'OPTIONS') {
        return res.sendStatus(200)
      }
      next()
    })

    // Request logging
    this.app.use((req, res, next) => {
      console.log(`  ↳ API: ${req.method} ${req.path}`)
      next()
    })
  }

  /**
   * Setup default API routes
   */
  private setupDefaultRoutes(): void {
    // Health check
    this.registerEndpoint({
      method: 'GET',
      path: '/health',
      handler: (req: express.Request, res: express.Response) => {
        res.json({
          status: 'healthy',
          timestamp: new Date().toISOString(),
          uptime: process.uptime(),
          framework: 'Racer.js',
          version: '1.0.0'
        })
      },
      description: 'Health check endpoint'
    })

    // Get all registered endpoints
    this.registerEndpoint({
      method: 'GET',
      path: '/api/endpoints',
      handler: (req: express.Request, res: express.Response) => {
        const endpointsList = Array.from(this.endpoints.values()).map(ep => ({
          method: ep.method,
          path: ep.path,
          description: ep.description
        }))
        res.json({ endpoints: endpointsList, count: endpointsList.length })
      },
      description: 'List all registered API endpoints'
    })

    // Agent code deployment endpoint
    this.registerEndpoint({
      method: 'POST',
      path: '/api/deploy',
      handler: async (req: express.Request, res: express.Response) => {
        try {
          const { code, endpoint, method = 'GET' } = req.body

          if (!code || !endpoint) {
            return res.status(400).json({ error: 'Missing required fields: code, endpoint' })
          }

          // In production, this would safely execute the code
          console.log(`  ↳ Deploying API endpoint: ${method} ${endpoint}`)

          res.json({
            success: true,
            message: 'API endpoint deployed',
            endpoint: endpoint,
            method: method
          })
        } catch (error: any) {
          res.status(500).json({ error: error.message })
        }
      },
      description: 'Deploy a new API endpoint from agent-generated code'
    })

    // Example REST endpoints
    this.registerEndpoint({
      method: 'GET',
      path: '/api/users',
      handler: (req: express.Request, res: express.Response) => {
        res.json({
          users: [
            { id: 1, name: 'John Doe', email: 'john@example.com' },
            { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
          ]
        })
      },
      description: 'Get all users (demo endpoint)'
    })

    this.registerEndpoint({
      method: 'POST',
      path: '/api/users',
      handler: (req: express.Request, res: express.Response) => {
        const userData = req.body
        res.status(201).json({
          success: true,
          message: 'User created',
          data: { id: Date.now(), ...userData }
        })
      },
      description: 'Create a new user (demo endpoint)'
    })

    // Agent status endpoint
    this.registerEndpoint({
      method: 'GET',
      path: '/api/agent/status',
      handler: (req: express.Request, res: express.Response) => {
        res.json({
          agent: 'active',
          capabilities: [
            'code-generation',
            'api-deployment',
            'auto-fix',
            'validation'
          ],
          version: '1.0.0'
        })
      },
      description: 'Get agent system status'
    })
  }

  /**
   * Register a new API endpoint
   */
  registerEndpoint(endpoint: APIEndpoint): void {
    const key = `${endpoint.method}:${endpoint.path}`
    this.endpoints.set(key, endpoint)

    // Register with Express
    const method = endpoint.method.toLowerCase() as 'get' | 'post' | 'put' | 'delete' | 'patch'
    
    const handler = async (req: express.Request, res: express.Response) => {
      try {
        // Apply middleware if any
        if (endpoint.middleware && endpoint.middleware.length > 0) {
          for (const mw of endpoint.middleware) {
            await mw(req, res)
          }
        }

        // Execute handler
        await endpoint.handler(req, res)
      } catch (error: any) {
        console.error(`Error in ${endpoint.method} ${endpoint.path}:`, error)
        if (!res.headersSent) {
          res.status(500).json({ error: error.message })
        }
      }
    }

    this.app[method](endpoint.path, handler)
    console.log(`  ↳ Registered: ${endpoint.method} ${endpoint.path}`)
  }

  /**
   * Unregister an API endpoint
   */
  unregisterEndpoint(method: string, path: string): boolean {
    const key = `${method}:${path}`
    return this.endpoints.delete(key)
  }

  /**
   * Deploy APIs from a directory
   */
  async deployFromDirectory(dirPath: string): Promise<void> {
    try {
      const fullPath = path.join(this.config.rootDir, dirPath)
      const files = await fs.readdir(fullPath)

      for (const file of files) {
        if (file.endsWith('.js') || file.endsWith('.ts')) {
          console.log(`  ↳ Loading API from: ${file}`)
          // In production, this would safely import and register the endpoints
        }
      }
    } catch (error) {
      console.error('Error deploying from directory:', error)
    }
  }

  /**
   * Start the API server
   */
  async start(): Promise<void> {
    return new Promise((resolve) => {
      this.server = this.app.listen(this.config.port, () => {
        resolve()
      })
    })
  }

  /**
   * Stop the API server
   */
  async stop(): Promise<void> {
    return new Promise((resolve) => {
      if (this.server) {
        this.server.close(() => resolve())
      } else {
        resolve()
      }
    })
  }

  /**
   * Get deployment info
   */
  getDeploymentInfo(): DeploymentConfig {
    return {
      target: 'local',
      config: {
        port: this.config.port,
        endpointsCount: this.endpoints.size
      }
    }
  }

  /**
   * Export API documentation
   */
  exportDocumentation(): any {
    const docs: any = {
      title: 'Racer.js API Documentation',
      version: '1.0.0',
      baseUrl: `http://localhost:${this.config.port}`,
      endpoints: []
    }

    this.endpoints.forEach((endpoint) => {
      docs.endpoints.push({
        method: endpoint.method,
        path: endpoint.path,
        description: endpoint.description || 'No description provided'
      })
    })

    return docs
  }
}

export default APIDeployer
