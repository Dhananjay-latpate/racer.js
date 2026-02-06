/**
 * Core types for Racer.js Framework
 */

export interface RacerConfig {
  /** Project root directory */
  rootDir: string
  /** Port for preview server */
  previewPort?: number
  /** Port for API server */
  apiPort?: number
  /** Enable agent coding */
  enableAgent?: boolean
  /** Agent configuration */
  agentConfig?: AgentConfig
}

export interface AgentConfig {
  /** Agent model to use */
  model?: string
  /** Maximum tokens for code generation */
  maxTokens?: number
  /** Temperature for creativity */
  temperature?: number
  /** Enable auto-fix */
  autoFix?: boolean
}

export interface CodeGenerationRequest {
  /** Prompt for code generation */
  prompt: string
  /** Target file path */
  filePath?: string
  /** Programming language */
  language?: string
  /** Context files */
  context?: string[]
}

export interface CodeGenerationResult {
  /** Generated code */
  code: string
  /** File path where code should be placed */
  filePath: string
  /** Explanation of the code */
  explanation?: string
  /** Suggested imports */
  imports?: string[]
}

export interface PreviewConfig {
  /** Port to run preview on */
  port: number
  /** Enable hot reload */
  hotReload?: boolean
  /** Browser to open */
  browser?: 'chrome' | 'firefox' | 'safari' | 'edge'
}

export interface APIEndpoint {
  /** HTTP method */
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  /** Endpoint path */
  path: string
  /** Handler function */
  handler: Function
  /** Middleware functions */
  middleware?: Function[]
  /** Endpoint description */
  description?: string
}

export interface DeploymentConfig {
  /** Deployment target */
  target: 'vercel' | 'aws' | 'local' | 'docker'
  /** Environment variables */
  env?: Record<string, string>
  /** Custom configuration */
  config?: Record<string, any>
}
