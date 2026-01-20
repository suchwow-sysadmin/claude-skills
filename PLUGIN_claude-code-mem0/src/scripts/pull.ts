#!/usr/bin/env node
/**
 * Mem0 Context Pull Script
 *
 * Pulls relevant context from Mem0 at Claude Code session start.
 * Configure in .claude/settings.local.json as a SessionStart hook.
 */

import { createMemory } from '../index.js'
import { existsSync, readFileSync, unlinkSync } from 'fs'
import { join } from 'path'

// Default agent IDs to pull from - customize for your project
const AGENT_IDS = process.env['MEM0_AGENT_IDS']?.split(',') || [
  'project-status',
  'code-agent',
  'claude-code-session',
]

async function pullMemory() {
  // Check for unsaved previous session
  const MARKER_FILE = join(process.env['HOME'] || '', '.claude', 'mem0-markers', 'last-session.json')
  if (existsSync(MARKER_FILE)) {
    try {
      const marker = JSON.parse(readFileSync(MARKER_FILE, 'utf-8'))
      console.log('⚠️  WARNING: Previous session ended without /mem0 save')
      console.log(`   Timestamp: ${marker.timestamp}`)
      console.log(`   Directory: ${marker.cwd}`)
      console.log('   Consider reviewing what was done and saving if needed.\n')
      unlinkSync(MARKER_FILE)
    } catch {
      // Ignore parse errors
    }
  }

  console.log('=== Mem0 Context for Claude Code Session ===\n')

  const mem = createMemory()

  for (const agentId of AGENT_IDS) {
    const result = await mem.getAll({ agent_id: agentId })

    if (result.ok && result.value.length > 0) {
      console.log(`## ${agentId}`)
      for (const entry of result.value.slice(0, 10)) {
        console.log(`- ${entry.memory}`)
      }
      console.log()
    }
  }

  // Search for recent highlights
  const searchResult = await mem.search('recent decision OR blocker OR important', { limit: 5 })
  if (searchResult.ok && searchResult.value.length > 0) {
    console.log('## Recent Highlights')
    for (const entry of searchResult.value) {
      console.log(`- [${entry.agent_id || 'general'}] ${entry.memory}`)
    }
    console.log()
  }

  console.log('=== End Mem0 Context ===')
}

pullMemory().catch(console.error)
