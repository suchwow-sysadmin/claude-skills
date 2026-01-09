# Claude Skills Collection

A curated collection of specialized skills for Claude Code that extend its
capabilities across the domain of life - from creative workflows and data
visualization to automation and beyond.

## What Are Claude Skills?

Claude skills are specialized knowledge modules that teach Claude Code how to
handle specific domains, tools, or workflows. They combine domain expertise,
best practices, and automated workflows into reusable, shareable packages.

## Installation

### For Claude Code (Cursor IDE)

Skills must be installed in the `.claude/skills/` directory with the following
structure:

```
.claude/skills/<skillname>/SKILL.md
```

**Important:** The skill file MUST be named `SKILL.md` (all caps), not a
descriptive name like `after-effects-skill.md`.

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
