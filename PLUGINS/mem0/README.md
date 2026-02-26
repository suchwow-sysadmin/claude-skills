# claude-code-mem0

Persistent memory for Claude Code sessions using [Mem0](https://mem0.ai).

Claude Code sessions lose context when they end. This plugin uses Mem0's AI-powered memory to persist important information across sessions - decisions made, patterns discovered, project-specific knowledge.

## How It Works

```
┌─────────────────────────────────────────────────────────────┐
│                    Claude Code Session                       │
├─────────────────────────────────────────────────────────────┤
│  SessionStart Hook                                           │
│  └─> mem0-pull: Loads context from previous sessions        │
│                                                              │
│  During Session                                              │
│  └─> Claude has access to project history & decisions       │
│                                                              │
│  Before Leaving                                              │
│  └─> /mem0: Save session summary to memory                  │
│                                                              │
│  Stop Hook                                                   │
│  └─> mem0-session-end: Warns if you forgot to save          │
└─────────────────────────────────────────────────────────────┘
```

## Quick Start

### 1. Get a Mem0 API Key

1. Go to [app.mem0.ai](https://app.mem0.ai) and sign up
2. Navigate to **Dashboard → API Keys**
3. Create a new API key
4. Set it as an environment variable:

```bash
# Add to your shell profile (.bashrc, .zshrc, etc.)
export MEM0_API_KEY="your-api-key-here"

# Or use a secrets manager like Doppler
doppler secrets set MEM0_API_KEY "your-api-key-here"
```

### 2. Install the Plugin

```bash
npm install -g claude-code-mem0
```

### 3. Configure Claude Code Hooks

Create or edit `.claude/settings.local.json` in your project:

```json
{
  "hooks": {
    "SessionStart": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "npx mem0-pull",
            "statusMessage": "Loading Mem0 context..."
          }
        ]
      }
    ],
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "npx mem0-session-end",
            "statusMessage": "Checking session save status..."
          }
        ]
      }
    ]
  }
}
```

### 4. Add the /mem0 Skill

Add to your `CLAUDE.md` or project instructions:

```markdown
## Memory

Run `/mem0` before ending your session to save important context.
```

Then when you run `/mem0`, Claude will summarize and save the session.

## Usage

### Saving Memory

Before ending a session, run `/mem0` and Claude will:
1. Summarize key activities, decisions, and outcomes
2. Push to Mem0 with the appropriate agent scope
3. Mark the session as saved

Or manually:

```bash
# Save to default scope
npx mem0-push "Implemented auth flow with JWT tokens"

# Save to specific agent/project scope
npx mem0-push --agent my-project "Added video upload feature"
```

### Loading Memory

Memory is automatically loaded on session start via the hook. You can also manually pull:

```bash
npx mem0-pull
```

### Agent Scopes

Organize memories by agent/project:

| Scope | Purpose |
|-------|---------|
| `project-status` | General project state, blockers |
| `code-agent` | Code implementation decisions |
| `your-project-name` | Project-specific knowledge |

Set which scopes to pull via environment variable:

```bash
export MEM0_AGENT_IDS="project-status,my-project,code-agent"
```

## With Git Worktrees (Phantom CLI)

If you use [Phantom](https://github.com/anthropics/phantom) for git worktrees with Claude Code:

### phantom.config.json

```json
{
  "copyFiles": [".env", ".env.local"],
  "postCreate": "npm install"
}
```

### Workflow

```bash
# Create a worktree for a feature
phantom create feature/auth

# Open Claude Code in the worktree
phantom ai feature/auth

# Claude loads memory context on start
# Work on the feature...
# Run /mem0 before leaving

# Switch to another worktree
phantom ai feature/dashboard
# Memory from previous session is available!
```

### Multiple Agents Pattern

For larger projects, use different agent scopes per worktree:

```bash
# In feature/auth worktree
npx mem0-push --agent code-agent-auth "Implemented JWT refresh tokens"

# In feature/dashboard worktree
npx mem0-push --agent code-agent-dashboard "Added chart components"

# Both scopes are pulled on next session
export MEM0_AGENT_IDS="project-status,code-agent-auth,code-agent-dashboard"
```

## API Usage

You can also use the memory client programmatically:

```typescript
import { createMemory } from 'claude-code-mem0'

const mem = createMemory()

// Add a memory
await mem.add([
  { role: 'assistant', content: 'User prefers Drizzle ORM over Prisma' }
], { agent_id: 'my-project' })

// Search memories
const result = await mem.search('database ORM', { agent_id: 'my-project' })
if (result.ok) {
  console.log(result.value) // [{ memory: '...', score: 0.95, ... }]
}

// Get all memories for a scope
const all = await mem.getAll({ agent_id: 'my-project' })
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `MEM0_API_KEY` | Yes | Your Mem0 API key |
| `MEM0_AGENT_IDS` | No | Comma-separated agent IDs to pull (default: `project-status,code-agent,claude-code-session`) |

## How Mem0 Works

Mem0 is an AI-powered memory layer. When you add memories:

1. **Extraction**: Mem0's AI extracts key facts from your input
2. **Deduplication**: Similar memories are merged, not duplicated
3. **Semantic Search**: Find relevant memories by meaning, not just keywords
4. **Scoping**: Memories are organized by user, agent, or session

This means you can dump session summaries and Mem0 intelligently extracts and organizes the knowledge.

## Troubleshooting

### "MEM0_API_KEY environment variable is required"

Make sure your API key is set:

```bash
echo $MEM0_API_KEY  # Should show your key
```

If using Doppler or another secrets manager, ensure it's injected:

```bash
doppler run -- npx mem0-pull
```

### Hooks not running

1. Check `.claude/settings.local.json` exists and is valid JSON
2. Ensure the file is in your project root (or `~/.claude/` for global)
3. Restart Claude Code after changing hooks

### Memory not persisting

1. Verify you ran `/mem0` before ending the session
2. Check the Mem0 dashboard at [app.mem0.ai](https://app.mem0.ai) to see stored memories
3. Ensure you're using consistent agent IDs

## License

MIT
