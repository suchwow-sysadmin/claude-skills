# Claude Skills + Plugins Collection

A curated collection of specialized skills for Claude Code that extend its
capabilities across the domain of life - from creative workflows and data
visualization to automation and beyond.

## What Are Claude Skills?

Claude skills are specialized knowledge modules that teach Claude Code how to
handle specific domains, tools, or workflows. They combine domain expertise,
best practices, and automated workflows into reusable, shareable packages.

## What Are Claude Plugins?

Claude plugins are **code packages** that extend Claude Code with **executable tooling**—most commonly:

- **CLI commands** (e.g. `mem0-pull`, `mem0-push`) that Claude Code can run
- **Hooks integration** via `.claude/settings.local.json` (e.g. `SessionStart`, `Stop`)
- **Optional helpers** your project or agents can import/use

In practice, plugins let you wire real automation into your Claude Code workflow (pull context at session start, warn on exit, sync data, run scripts, etc.).

### Plugins vs Skills (Quick Mental Model)

- **Skills**: Documentation-only behavior guides (`SKILL.md`) that teach Claude *how to think and respond* in a domain.
- **Plugins**: Installable code that lets Claude *do things* (run commands, integrate services, trigger hooks).

## Installation

### For Claude Code (Cursor IDE)

Skills must be installed in the `.claude/skills/` directory with the following
structure:

```
.claude/skills/<skillname>/SKILL.md
```

**Important:** The skill file MUST be named `SKILL.md` (all caps), not a
descriptive name like `after-effects-skill.md`.

Common confusion point: Cursor will display this directory, but otherwise is not visible by default on most systems via the file explorer. Try copy/pasting the SKILL.md contents to a new file within your own IDE instead of moving the file.

#### Installation Example

```bash
# Navigate to your project
cd /path/to/your/project

# Create the skills directory structure
mkdir -p .claude/skills/ae-expressions

# Copy or symlink the skill file
cp /path/to/this/repo/after_effects/SKILL.md .claude/skills/ae-expressions/SKILL.md
```

Claude Code will automatically detect and load skills from this directory.

### Installing Claude Plugins (Claude Code)

Plugin installation is typically:

1. **Install the package** (usually via npm).
2. **Configure hooks** (optional, but common) so Claude Code runs the plugin’s commands at key lifecycle events.

Example (from this repo’s Mem0 plugin):

- **Plugin**: [`PLUGIN_claude-code-mem0/`](./PLUGIN_claude-code-mem0/)
- **Install**:

```bash
npm install -g claude-code-mem0
```

- **Hook it into Claude Code** by adding commands to `.claude/settings.local.json` (project) or `~/.claude/settings.local.json` (global). For example, to run on session start / stop, the plugin README uses:

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

### Claude Desktop vs Claude Code

**Claude Desktop** is the standalone application for general AI assistance. For
creative workflows like After Effects automation (especially .jsx script
generation and auto-import), you'll want to use **Claude Code** (the Cursor IDE
integration) as it has direct filesystem access and can execute scripts.

## Skills in This Repository

### [After Effects Expressions & Scripting](./after_effects/)

**Domain:** Motion graphics, data visualization, animation automation

A comprehensive skill for Adobe After Effects that handles both:

- **Expression generation** - JavaScript expressions for property automation
- **.jsx script creation** - Full ExtendScript automation with auto-import
  capability

Created specifically for data visualization workflows, this skill can:

- Analyze reference animations (image sequences)
- Generate resolution-independent expressions
- Create complete .jsx scripts that build entire compositions
- Auto-import and execute scripts in After Effects
- Handle timeline visualizations, progress bars, charts, and animated data
  displays

See the [After Effects README](./after_effects/AE-skill_README.md) for detailed
capabilities.

## Plugins in This Repository

### [Mem0 Persistent Memory (Claude Code Plugin)](./PLUGIN_claude-code-mem0/)

**Domain:** Workflow automation, session memory

Adds commands + hooks that persist useful context across Claude Code sessions via Mem0.

---

## Philosophy: Skills for the Domain of Life

This repository hosts skills across a broad spectrum - not just traditional
code. The "domain of life" means these skills might cover:

- **Creative tools** (After Effects, Premiere, design automation)
- **Data visualization** (charts, graphs, animated reports)
- **Personal automation** (workflows, task management)
- **Media processing** (video, audio, image manipulation)
- **Document generation** (reports, presentations, templates)
- **And whatever else emerges** in the course of modern life

The common thread: they extend Claude's capabilities into specialized domains
where deep knowledge and specific workflows matter.

## Contributing

Have a skill to share? PRs welcome! Please follow the structure:

```
skill-name/
  ├── SKILL.md           # The skill itself (MUST be this exact name)
  └── README.md          # Documentation for humans
```

## License

MIT - See [LICENSE](./LICENSE) for details.

---

**Note:** These skills are designed for Claude Code specifically. While the
knowledge can inform conversations with Claude Desktop, the automation features
(file generation, script execution, auto-import) require Claude Code's extended
capabilities.
