/**
 * Coordinator for backend-frontend code generation
 * Ensures generated code works seamlessly across the stack
 */

import { CodeGenerationRequest, CodeGenerationResult } from '../types'
import { AgentEngine } from './engine'

export interface CoordinatedRequest {
  /** Frontend component request */
  frontend?: CodeGenerationRequest
  /** Backend API/Server Action request */
  backend?: CodeGenerationRequest
  /** Database schema if needed */
  database?: {
    model: string
    fields: Record<string, string>
  }
  /** Coordination strategy */
  strategy?: 'api-route' | 'server-action' | 'rsc'
}

export interface CoordinatedResult {
  /** Frontend code */
  frontend?: CodeGenerationResult
  /** Backend code */
  backend?: CodeGenerationResult
  /** Additional files (types, utils, etc.) */
  additionalFiles?: Map<string, string>
  /** Integration instructions */
  instructions: string
}

/**
 * AgentCoordinator ensures frontend and backend code work together
 */
export class AgentCoordinator {
  private agentEngine: AgentEngine

  constructor(agentEngine: AgentEngine) {
    this.agentEngine = agentEngine
  }

  /**
   * Generate coordinated full-stack code
   */
  async generateCoordinated(request: CoordinatedRequest): Promise<CoordinatedResult> {
    console.log('🔄 Coordinating full-stack code generation...')

    const result: CoordinatedResult = {
      additionalFiles: new Map(),
      instructions: ''
    }

    // Determine strategy if not specified
    const strategy = request.strategy || this.determineStrategy(request)

    switch (strategy) {
      case 'server-action':
        return this.generateServerActionFlow(request)
      case 'api-route':
        return this.generateAPIRouteFlow(request)
      case 'rsc':
        return this.generateRSCFlow(request)
      default:
        return this.generateAPIRouteFlow(request)
    }
  }

  /**
   * Generate coordinated code using Server Actions
   */
  private async generateServerActionFlow(request: CoordinatedRequest): Promise<CoordinatedResult> {
    const result: CoordinatedResult = {
      additionalFiles: new Map(),
      instructions: 'Using Server Actions for data mutations'
    }

    // Generate Server Action
    if (request.backend) {
      const serverActionCode = this.generateServerAction(request.backend)
      result.backend = {
        code: serverActionCode,
        filePath: 'app/actions/' + this.getActionFileName(request.backend.prompt),
        explanation: 'Server Action for data handling'
      }
    }

    // Generate Client Component that uses the action
    if (request.frontend) {
      const componentCode = this.generateClientComponentWithAction(
        request.frontend,
        result.backend?.filePath
      )
      result.frontend = {
        code: componentCode,
        filePath: 'app/components/' + this.getComponentFileName(request.frontend.prompt),
        explanation: 'Client Component using Server Action'
      }
    }

    // Generate TypeScript types
    if (request.database) {
      result.additionalFiles.set(
        'types/database.ts',
        this.generateDatabaseTypes(request.database)
      )
    }

    result.instructions = `
Server Actions Flow:
1. Server Action created at: ${result.backend?.filePath}
2. Client Component created at: ${result.frontend?.filePath}
3. Component uses 'use client' directive
4. Server Action is called directly from the component
5. No API routes needed - direct server communication
`

    return result
  }

  /**
   * Generate coordinated code using API Routes
   */
  private async generateAPIRouteFlow(request: CoordinatedRequest): Promise<CoordinatedResult> {
    const result: CoordinatedResult = {
      additionalFiles: new Map(),
      instructions: 'Using App Router API Routes'
    }

    // Generate API Route Handler
    if (request.backend) {
      const apiRouteCode = this.generateAppRouterAPIRoute(request.backend, request.database)
      result.backend = {
        code: apiRouteCode,
        filePath: 'app/api/' + this.getAPIRoutePath(request.backend.prompt) + '/route.ts',
        explanation: 'App Router API Route Handler'
      }
    }

    // Generate Component that calls the API
    if (request.frontend) {
      const componentCode = this.generateComponentWithFetch(
        request.frontend,
        this.getAPIPath(request.backend?.prompt || '')
      )
      result.frontend = {
        code: componentCode,
        filePath: 'app/components/' + this.getComponentFileName(request.frontend.prompt),
        explanation: 'Component with API integration'
      }
    }

    // Generate API client utilities
    result.additionalFiles.set(
      'lib/api-client.ts',
      this.generateAPIClient()
    )

    result.instructions = `
API Routes Flow:
1. API Route created at: ${result.backend?.filePath}
2. Component created at: ${result.frontend?.filePath}
3. API Client utilities at: lib/api-client.ts
4. Component fetches data from the API route
5. Error handling included
`

    return result
  }

  /**
   * Generate coordinated code using React Server Components
   */
  private async generateRSCFlow(request: CoordinatedRequest): Promise<CoordinatedResult> {
    const result: CoordinatedResult = {
      additionalFiles: new Map(),
      instructions: 'Using React Server Components'
    }

    // Generate Server Component with data fetching
    if (request.frontend || request.backend) {
      const serverComponentCode = this.generateServerComponent(
        request.frontend || request.backend!,
        request.database
      )
      result.frontend = {
        code: serverComponentCode,
        filePath: 'app/components/' + this.getComponentFileName(
          (request.frontend || request.backend)!.prompt
        ),
        explanation: 'React Server Component with data fetching'
      }
    }

    // Generate data fetching utilities
    result.additionalFiles.set(
      'lib/data-fetchers.ts',
      this.generateDataFetchers(request.database)
    )

    result.instructions = `
React Server Components Flow:
1. Server Component created at: ${result.frontend?.filePath}
2. Data fetching logic included directly in component
3. No separate API routes needed
4. Component runs on server by default
5. Data fetchers at: lib/data-fetchers.ts
`

    return result
  }

  /**
   * Generate Server Action code
   */
  private generateServerAction(request: CodeGenerationRequest): string {
    const actionName = this.extractFunctionName(request.prompt)
    
    return `'use server'

/**
 * Server Action generated by Racer Agent
 * Prompt: ${request.prompt}
 */

import { revalidatePath } from 'next/cache'

export async function ${actionName}(formData: FormData) {
  try {
    // Extract data from FormData
    const data = {
      // Add your fields here based on your form
    }

    // Validate data
    if (!data) {
      return { success: false, error: 'Invalid data' }
    }

    // Process the action
    // TODO: Add your business logic here
    // Example: await db.insert(data)

    // Revalidate the path to update the UI
    revalidatePath('/')

    return { success: true, data }
  } catch (error) {
    console.error('Server action error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}
`
  }

  /**
   * Generate Client Component with Server Action
   */
  private generateClientComponentWithAction(
    request: CodeGenerationRequest,
    actionPath?: string
  ): string {
    const componentName = this.extractComponentName(request.prompt)
    const actionImport = actionPath 
      ? `import { ${this.extractFunctionName(request.prompt)} } from '@/${actionPath.replace('.ts', '')}'`
      : `import { serverAction } from '@/app/actions/server-actions'`

    return `'use client'

/**
 * Client Component generated by Racer Agent
 * Prompt: ${request.prompt}
 */

import React, { useTransition } from 'react'
${actionImport}

interface ${componentName}Props {
  // Add your props here
}

export function ${componentName}(props: ${componentName}Props) {
  const [isPending, startTransition] = useTransition()
  const [result, setResult] = React.useState<any>(null)

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const response = await ${this.extractFunctionName(request.prompt)}(formData)
      setResult(response)
    })
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">${componentName}</h2>
      
      <form action={handleSubmit} className="space-y-4">
        {/* Add your form fields here */}
        <input
          type="text"
          name="field"
          placeholder="Enter value"
          className="border p-2 rounded"
          required
        />
        
        <button
          type="submit"
          disabled={isPending}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {isPending ? 'Processing...' : 'Submit'}
        </button>
      </form>

      {result && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}

export default ${componentName}
`
  }

  /**
   * Generate App Router API Route
   */
  private generateAppRouterAPIRoute(
    request: CodeGenerationRequest,
    database?: CoordinatedRequest['database']
  ): string {
    return `/**
 * App Router API Route generated by Racer Agent
 * Prompt: ${request.prompt}
 */

import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    
    // TODO: Implement your GET logic
    const data = {
      message: 'API route working',
      timestamp: new Date().toISOString()
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    if (!body) {
      return NextResponse.json(
        { error: 'Missing request body' },
        { status: 400 }
      )
    }

    // TODO: Process the data
    // Example: await db.insert(body)

    return NextResponse.json({
      success: true,
      data: body
    })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Add more HTTP methods as needed (PUT, DELETE, PATCH)
`
  }

  /**
   * Generate Component with fetch API
   */
  private generateComponentWithFetch(
    request: CodeGenerationRequest,
    apiPath: string
  ): string {
    const componentName = this.extractComponentName(request.prompt)

    return `'use client'

/**
 * Component with API integration generated by Racer Agent
 * Prompt: ${request.prompt}
 */

import React, { useEffect, useState } from 'react'

interface ${componentName}Props {
  // Add your props here
}

interface DataType {
  // Define your data structure
  [key: string]: any
}

export function ${componentName}(props: ${componentName}Props) {
  const [data, setData] = useState<DataType | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      setLoading(true)
      const response = await fetch('${apiPath}')
      
      if (!response.ok) {
        throw new Error('Failed to fetch data')
      }
      
      const result = await response.json()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(formData: FormData) {
    try {
      const response = await fetch('${apiPath}', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(formData))
      })
      
      if (!response.ok) {
        throw new Error('Failed to submit')
      }
      
      await fetchData() // Refresh data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    }
  }

  if (loading) {
    return <div className="p-6">Loading...</div>
  }

  if (error) {
    return <div className="p-6 text-red-500">Error: {error}</div>
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">${componentName}</h2>
      
      <div className="mb-4">
        <pre className="bg-gray-100 p-4 rounded">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>

      <form action={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="field"
          placeholder="Enter value"
          className="border p-2 rounded"
          required
        />
        
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Submit
        </button>
      </form>
    </div>
  )
}

export default ${componentName}
`
  }

  /**
   * Generate React Server Component
   */
  private generateServerComponent(
    request: CodeGenerationRequest,
    database?: CoordinatedRequest['database']
  ): string {
    const componentName = this.extractComponentName(request.prompt)

    return `/**
 * React Server Component generated by Racer Agent
 * Prompt: ${request.prompt}
 */

import React from 'react'

interface ${componentName}Props {
  // Add your props here
}

async function fetchData() {
  // This runs on the server
  // TODO: Add your data fetching logic
  // Example: const data = await db.query(...)
  
  return {
    message: 'Server Component data',
    timestamp: new Date().toISOString()
  }
}

export default async function ${componentName}(props: ${componentName}Props) {
  // Fetch data directly in the component
  const data = await fetchData()

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">${componentName}</h2>
      
      <div className="bg-gray-100 p-4 rounded">
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </div>

      <div className="mt-4">
        <p className="text-sm text-gray-600">
          This component runs on the server. Data is fetched at build time or on request.
        </p>
      </div>
    </div>
  )
}
`
  }

  /**
   * Generate database type definitions
   */
  private generateDatabaseTypes(database: CoordinatedRequest['database']): string {
    if (!database) return ''

    const fields = Object.entries(database.fields)
      .map(([name, type]) => `  ${name}: ${type}`)
      .join('\n')

    return `/**
 * Database types generated by Racer Agent
 */

export interface ${database.model} {
${fields}
}

export type Create${database.model} = Omit<${database.model}, 'id' | 'createdAt' | 'updatedAt'>
export type Update${database.model} = Partial<Create${database.model}>
`
  }

  /**
   * Generate API client utilities
   */
  private generateAPIClient(): string {
    return `/**
 * API Client utilities generated by Racer Agent
 */

type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

interface RequestOptions {
  method?: HTTPMethod
  body?: any
  headers?: Record<string, string>
}

export class APIClient {
  private baseURL: string

  constructor(baseURL: string = '') {
    this.baseURL = baseURL
  }

  async request<T = any>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const { method = 'GET', body, headers = {} } = options

    const config: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    }

    if (body) {
      config.body = JSON.stringify(body)
    }

    const response = await fetch(\`\${this.baseURL}\${endpoint}\`, config)

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }))
      throw new Error(error.error || 'Request failed')
    }

    return response.json()
  }

  get<T = any>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  post<T = any>(endpoint: string, body: any): Promise<T> {
    return this.request<T>(endpoint, { method: 'POST', body })
  }

  put<T = any>(endpoint: string, body: any): Promise<T> {
    return this.request<T>(endpoint, { method: 'PUT', body })
  }

  delete<T = any>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }
}

export const apiClient = new APIClient()
`
  }

  /**
   * Generate data fetching utilities
   */
  private generateDataFetchers(database?: CoordinatedRequest['database']): string {
    return `/**
 * Data fetching utilities for Server Components
 * Generated by Racer Agent
 */

// Cache configuration
const CACHE_CONFIG = {
  revalidate: 3600, // 1 hour
  tags: ['data']
}

/**
 * Fetch data with caching
 */
export async function fetchData<T = any>(key: string): Promise<T> {
  // This is a placeholder - implement your actual data fetching
  // Example: using database, API, etc.
  
  const data = {
    key,
    timestamp: new Date().toISOString()
  }

  return data as T
}

/**
 * Fetch with custom cache settings
 */
export async function fetchWithCache<T = any>(
  key: string,
  options?: { revalidate?: number; tags?: string[] }
): Promise<T> {
  // Use Next.js fetch with cache options
  const response = await fetch(\`/api/data/\${key}\`, {
    next: {
      revalidate: options?.revalidate || CACHE_CONFIG.revalidate,
      tags: options?.tags || CACHE_CONFIG.tags
    }
  })

  if (!response.ok) {
    throw new Error('Failed to fetch data')
  }

  return response.json()
}
`
  }

  // Helper methods

  private determineStrategy(request: CoordinatedRequest): 'api-route' | 'server-action' | 'rsc' {
    // If only frontend, use RSC
    if (request.frontend && !request.backend) {
      return 'rsc'
    }

    // If mutation-focused, use server actions
    if (request.backend?.prompt.toLowerCase().includes('create') ||
        request.backend?.prompt.toLowerCase().includes('update') ||
        request.backend?.prompt.toLowerCase().includes('delete')) {
      return 'server-action'
    }

    // Default to API routes
    return 'api-route'
  }

  private extractComponentName(prompt: string): string {
    const words = prompt.split(/\s+/)
    for (const word of words) {
      if (word.length > 2 && /^[A-Z]/.test(word)) {
        return word
      }
    }
    return 'GeneratedComponent'
  }

  private extractFunctionName(prompt: string): string {
    const words = prompt.toLowerCase().split(/\s+/)
    const actionWords = words.filter(w => 
      ['create', 'update', 'delete', 'add', 'remove', 'submit'].includes(w)
    )
    
    if (actionWords.length > 0) {
      return actionWords[0] + 'Action'
    }
    
    return 'serverAction'
  }

  private getActionFileName(prompt: string): string {
    const name = this.extractFunctionName(prompt)
    return name.replace(/([A-Z])/g, '-$1').toLowerCase().slice(1) + '.ts'
  }

  private getComponentFileName(prompt: string): string {
    const name = this.extractComponentName(prompt)
    return name + '.tsx'
  }

  private getAPIRoutePath(prompt: string): string {
    const words = prompt.toLowerCase().split(/\s+/)
    const relevantWords = words.filter(w => 
      w.length > 3 && !['create', 'make', 'generate', 'build'].includes(w)
    )
    
    if (relevantWords.length > 0) {
      return relevantWords[0]
    }
    
    return 'resource'
  }

  private getAPIPath(prompt: string): string {
    return '/api/' + this.getAPIRoutePath(prompt)
  }
}
