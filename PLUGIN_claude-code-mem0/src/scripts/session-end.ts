#!/usr/bin/env node
/**
 * Session End Marker
 *
 * Writes a marker file when session ends without /mem0 save.
 * Next session's pull script checks this and warns if previous wasn't saved.
 */

import { writeFileSync, existsSync, mkdirSync, unlinkSync } from 'fs'
import { join } from 'path'

const MARKER_DIR = join(process.env['HOME'] || '', '.claude', 'mem0-markers')
const MARKER_FILE = join(MARKER_DIR, 'last-session.json')
const SAVE_MARKER = join(MARKER_DIR, 'saved.marker')

if (existsSync(SAVE_MARKER)) {
  // Session was saved via /mem0, clean up
  unlinkSync(SAVE_MARKER)
  console.log('Session saved to Mem0 - clean exit')
} else {
  // Session ended without /mem0
  if (!existsSync(MARKER_DIR)) {
    mkdirSync(MARKER_DIR, { recursive: true })
  }

  writeFileSync(MARKER_FILE, JSON.stringify({
    timestamp: new Date().toISOString(),
    cwd: process.cwd(),
    warning: 'Session ended without /mem0 save'
  }, null, 2))

  console.log('Warning: Session ended without /mem0 save')
}
