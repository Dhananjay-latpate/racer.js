/**
 * Racer.js - The World's Most Advanced Backend and Frontend Integrated Framework
 * 
 * Features:
 * - Inbuilt AI Agent Coding with Backend-Frontend Coordination
 * - Live Frontend Preview Window
 * - Direct API Deployment
 * - Native Agent Code Support
 * - DevOps Lifecycle Management (CI/CD, Deployment, Monitoring)
 * - Next.js App Router Support (Server Components, Server Actions, API Routes)
 */

// Core framework
export { RacerFramework } from './core/framework'

// Agent system with coordination
export { AgentEngine } from './agent/engine'
export { AgentCoordinator } from './agent/coordinator'

// Preview and API
export { PreviewServer } from './preview/server'
export { APIDeployer } from './api/deployer'

// DevOps lifecycle
export { LifecycleManager } from './devops/lifecycle'

// Type exports
export * from './types'
export type { CoordinatedRequest, CoordinatedResult } from './agent/coordinator'
export type { LifecycleConfig, DeploymentTarget, SecurityCheck } from './devops/lifecycle'
