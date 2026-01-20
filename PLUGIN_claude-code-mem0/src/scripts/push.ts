#!/usr/bin/env node
/**
 * Mem0 Context Push Script
 *
 * Pushes session summary to Mem0. Run via /mem0 command or manually.
 * Usage: npx mem0-push "Summary of what was done"
 *        npx mem0-push --agent my-project "Summary"
 */

import { createMemory } from '../index.js'
import { writeFileSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'

async function pushMemory() {
  const args = process.argv.slice(2)

  // Parse --agent flag
  let agentId = 'claude-code-session'
  let summary = ''

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--agent' && args[i + 1]) {
      agentId = args[i + 1]!
      i++
    } else if (!summary) {
      summary = args[i]!
    }
  }

  if (!summary) {
    console.error('Usage: mem0-push [--agent <agent-id>] "Summary of session"')
    console.error('Example: mem0-push --agent my-project "Implemented auth flow"')
    process.exit(1)
  }

  const mem = createMemory()

  const result = await mem.add(
    [{ role: 'assistant', content: summary }],
    { agent_id: agentId }
  )

  if (result.ok) {
    console.log(`Memory queued for ${agentId}: ${result.value[0]?.event_id}`)

    // Write save marker so Stop hook knows session was saved
    const MARKER_DIR = join(process.env['HOME'] || '', '.claude', 'mem0-markers')
    if (!existsSync(MARKER_DIR)) {
      mkdirSync(MARKER_DIR, { recursive: true })
    }
    writeFileSync(join(MARKER_DIR, 'saved.marker'), new Date().toISOString())
  } else {
    console.error('Failed to push memory:', result.error)
    process.exit(1)
  }
}

pushMemory().catch(console.error)
