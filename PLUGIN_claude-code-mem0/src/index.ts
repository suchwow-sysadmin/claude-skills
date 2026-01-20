/**
 * Claude Code Mem0 Plugin
 *
 * Persistent memory for Claude Code sessions using Mem0 API.
 * Enables context to persist across sessions via hooks.
 */

const MEM0_API_BASE = 'https://api.mem0.ai/v1'

// Memory entry as returned from Mem0 API
export interface MemoryEntry {
  id: string
  memory: string
  user_id?: string
  agent_id?: string
  categories?: string[]
  metadata?: Record<string, unknown>
  created_at?: string
  updated_at?: string
  score?: number
}

// Message format for adding memories
export interface MemoryMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

// Options for scoping memories
export interface MemoryScope {
  user_id?: string
  agent_id?: string
  run_id?: string
  metadata?: Record<string, unknown>
}

// Search options
export interface SearchOptions extends MemoryScope {
  limit?: number
  categories?: string[]
}

// Result of queueing a memory
export interface MemoryQueueResult {
  event_id: string
  status: 'PENDING' | 'COMPLETED'
}

// Simple Result type
export type Result<T> =
  | { ok: true; value: T }
  | { ok: false; error: Error }

// Agent memory client interface
export interface AgentMemory {
  add(messages: MemoryMessage[], scope: MemoryScope): Promise<Result<MemoryQueueResult[]>>
  addMemory(content: string, scope: MemoryScope): Promise<Result<MemoryQueueResult>>
  search(query: string, options?: SearchOptions): Promise<Result<MemoryEntry[]>>
  getAll(scope: MemoryScope): Promise<Result<MemoryEntry[]>>
  get(memoryId: string): Promise<Result<MemoryEntry>>
  update(memoryId: string, content: string): Promise<Result<MemoryEntry>>
  delete(memoryId: string): Promise<Result<void>>
  deleteAll(scope: MemoryScope): Promise<Result<void>>
  history(memoryId: string): Promise<Result<MemoryEntry[]>>
}

// API response types
interface Mem0AddQueuedResponse {
  message: string
  status: 'PENDING' | 'COMPLETED'
  event_id: string
}

interface Mem0SearchResult {
  id: string
  memory: string
  score?: number
  user_id?: string
  agent_id?: string
  categories?: string[]
  created_at?: string
  updated_at?: string
  metadata?: Record<string, unknown>
}

/**
 * Get the Mem0 API key from environment
 */
export function getApiKey(): string {
  const key = process.env['MEM0_API_KEY']
  if (!key) {
    throw new Error(
      'MEM0_API_KEY environment variable is required.\n' +
      'Get your API key at: https://app.mem0.ai/dashboard/api-keys'
    )
  }
  return key
}

/**
 * Create a memory client for Claude Code sessions
 *
 * @example
 * ```ts
 * const memory = createMemory()
 *
 * // Store a memory
 * await memory.add([
 *   { role: 'assistant', content: 'User prefers TypeScript over JavaScript' }
 * ], { agent_id: 'my-project' })
 *
 * // Search memories
 * const result = await memory.search('typescript', { agent_id: 'my-project' })
 * ```
 */
export function createMemory(): AgentMemory {
  const apiKey = getApiKey()

  async function apiRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`${MEM0_API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Token ${apiKey}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Mem0 API error: ${response.status} ${error}`)
    }

    return response.json() as Promise<T>
  }

  async function tryCatch<T>(fn: () => Promise<T>): Promise<Result<T>> {
    try {
      return { ok: true, value: await fn() }
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e : new Error(String(e)) }
    }
  }

  return {
    async add(messages: MemoryMessage[], scope: MemoryScope): Promise<Result<MemoryQueueResult[]>> {
      return tryCatch(async () => {
        const response = await apiRequest<Mem0AddQueuedResponse[]>('/memories/', {
          method: 'POST',
          body: JSON.stringify({
            messages,
            user_id: scope.user_id,
            agent_id: scope.agent_id,
            run_id: scope.run_id,
            metadata: scope.metadata,
          }),
        })
        return response.map(r => ({
          event_id: r.event_id,
          status: r.status,
        }))
      })
    },

    async addMemory(content: string, scope: MemoryScope): Promise<Result<MemoryQueueResult>> {
      return tryCatch(async () => {
        const messages: MemoryMessage[] = [{ role: 'assistant', content }]
        const response = await apiRequest<Mem0AddQueuedResponse[]>('/memories/', {
          method: 'POST',
          body: JSON.stringify({
            messages,
            user_id: scope.user_id,
            agent_id: scope.agent_id,
            run_id: scope.run_id,
            metadata: scope.metadata,
          }),
        })
        if (response.length === 0) {
          throw new Error('No memory queued')
        }
        const r = response[0]!
        return { event_id: r.event_id, status: r.status }
      })
    },

    async search(query: string, options: SearchOptions = {}): Promise<Result<MemoryEntry[]>> {
      return tryCatch(async () => {
        const results = await apiRequest<Mem0SearchResult[]>('/memories/search/', {
          method: 'POST',
          body: JSON.stringify({
            query,
            user_id: options.user_id,
            agent_id: options.agent_id,
            run_id: options.run_id,
            limit: options.limit,
            categories: options.categories,
          }),
        })
        return results.map(r => ({
          id: r.id,
          memory: r.memory,
          score: r.score,
          user_id: r.user_id,
          agent_id: r.agent_id,
          categories: r.categories,
          created_at: r.created_at,
          updated_at: r.updated_at,
          metadata: r.metadata,
        }))
      })
    },

    async getAll(scope: MemoryScope): Promise<Result<MemoryEntry[]>> {
      return tryCatch(async () => {
        const params = new URLSearchParams()
        if (scope.user_id) params.set('user_id', scope.user_id)
        if (scope.agent_id) params.set('agent_id', scope.agent_id)
        if (scope.run_id) params.set('run_id', scope.run_id)
        return apiRequest<MemoryEntry[]>(`/memories/?${params.toString()}`)
      })
    },

    async get(memoryId: string): Promise<Result<MemoryEntry>> {
      return tryCatch(async () => {
        return apiRequest<MemoryEntry>(`/memories/${memoryId}/`)
      })
    },

    async update(memoryId: string, content: string): Promise<Result<MemoryEntry>> {
      return tryCatch(async () => {
        return apiRequest<MemoryEntry>(`/memories/${memoryId}/`, {
          method: 'PUT',
          body: JSON.stringify({ text: content }),
        })
      })
    },

    async delete(memoryId: string): Promise<Result<void>> {
      return tryCatch(async () => {
        await apiRequest<{ message: string }>(`/memories/${memoryId}/`, {
          method: 'DELETE',
        })
      })
    },

    async deleteAll(scope: MemoryScope): Promise<Result<void>> {
      return tryCatch(async () => {
        const params = new URLSearchParams()
        if (scope.user_id) params.set('user_id', scope.user_id)
        if (scope.agent_id) params.set('agent_id', scope.agent_id)
        if (scope.run_id) params.set('run_id', scope.run_id)
        await apiRequest<{ message: string }>(
          `/memories/?${params.toString()}`,
          { method: 'DELETE' }
        )
      })
    },

    async history(memoryId: string): Promise<Result<MemoryEntry[]>> {
      return tryCatch(async () => {
        interface HistoryEntry {
          id: string
          memory_id: string
          old_memory: string | null
          new_memory: string | null
          user_id?: string
          categories?: string[]
          created_at?: string
          updated_at?: string
        }
        const response = await apiRequest<HistoryEntry[]>(
          `/memories/${memoryId}/history/`
        )
        return response.map(h => ({
          id: h.id,
          memory: h.new_memory ?? h.old_memory ?? '',
          user_id: h.user_id,
          categories: h.categories,
          created_at: h.created_at,
          updated_at: h.updated_at,
        }))
      })
    },
  }
}

// Re-export for convenience
export { createMemory as createAgentMemory }
