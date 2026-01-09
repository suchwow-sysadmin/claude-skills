# After Effects Expressions & Scripting Skill

A comprehensive skill for Adobe After Effects that goes far beyond simple
expression generation - this is a full automation system for creating data
visualizations, motion graphics templates, and animated compositions.

## What This Skill Does

### 1. Expression Generation (Property Automation)

Generate JavaScript expressions for After Effects properties that are:

- **Frame-rate independent** - Works at any FPS (15fps, 24fps, 60fps, etc.)
- **Resolution independent** - Scales from 480p to 4K+ automatically
- **Data-driven** - Links to expression controls for easy editing
- **Performance optimized** - Clean, efficient code

**Example use cases:**

- Wiggle/bounce animations
- Progress bars and counters
- Timeline visualizations
- Linked properties across layers
- Staggered animation timing

### 2. ExtendScript (.jsx) Generation & Auto-Import

**This is the power feature.** The skill can generate complete .jsx scripts
that:

- Build entire compositions from scratch
- Create and configure all layers, shapes, and effects
- Apply expressions automatically
- Set up expression controls
- **Auto-import and execute in After Effects** via command line

This means you can go from "create a data visualization showing quarterly
revenue growth" to a fully-built After Effects composition in seconds.

### 3. Reference Animation Analysis

Point the skill at an image sequence or video, and it will:

- Extract individual frames (if needed)
- Analyze animation timing and movement
- Convert reference specs (480px @ 15fps) to production-ready expressions
- Generate expressions that replicate the animation at any resolution/frame rate

## Installation

### For Claude Code (Cursor IDE)

```bash
# Navigate to your project
cd /path/to/your/project

# Create the skills directory structure
mkdir -p .claude/skills/ae-expressions

# Copy the skill file
cp /path/to/claude-skills/after_effects/SKILL.md .claude/skills/ae-expressions/SKILL.md
```

**Critical:** The file must be named `SKILL.md` (all caps), not
`ae-expressions.md` or any other name.

Claude Code will automatically detect and load the skill.

## Usage Examples

### Simple Expression Request

```
Create an AE expression for a wiggling position that's resolution independent
```

**Output:** Expression code with percentage-based amplitude

### Complex Data Visualization

```
Create a .jsx script that builds a bar chart showing 5 data points:
- 45%, 67%, 89%, 34%, 92%
- Bars should animate in from bottom to top over 2 seconds
- Stagger by 0.2 seconds
- Include labels and a title
```

**Output:** Complete .jsx script + auto-import command

### From Reference Animation

```
Here's an image sequence showing a timeline animation.
Generate expressions that replicate this at 1080p.
```

**Output:** Analyzed animation with converted expressions

## Why This Skill Exists

**Data visualization for video content is tedious.** Manually keyframing
progress bars, counters, timeline markers, and animated charts is time-consuming
and error-prone. Expression-based animation is more flexible but requires deep
AE knowledge.

This skill was created to automate the entire process:

1. Describe the visualization you want
2. Get a .jsx script that builds it
3. Import into AE, adjust expression controls as needed
4. Render

Perfect for:

- YouTube video graphics (stats, timelines, progress indicators)
- Client reports (animated data presentations)
- Motion graphics templates (reusable, data-driven designs)
- Social media content (quick, repeatable visualizations)

## Key Features

### Frame-Rate Independence

All timing uses `time` (seconds), never frame numbers. This means:

- Expressions created at 15fps work perfectly at 24fps, 60fps, etc.
- No recalculation needed when changing frame rate
- Reference material can be low-FPS for smaller file sizes

### Resolution Independence

All positions and sizes use percentages via `thisComp.width` and
`thisComp.height`:

- 480px reference → 1080p production → 4K delivery (same expressions)
- No hardcoded pixel values
- Scales automatically to any composition size

### Expression Controls Integration

Generated expressions link to slider/checkbox controls, making them:

- Editable without touching code
- Compatible with Motion Graphics Templates (MOGRTs)
- Usable by non-technical editors in Premiere Pro

## .jsx Auto-Import Workflow

When the skill generates a .jsx script, it includes a command like:

```bash
# macOS
/Applications/Adobe\ After\ Effects\ 2024/aerender -project /path/to/project.aep -s /path/to/script.jsx

# Or using osascript for direct import
osascript -e 'tell application "Adobe After Effects 2024" to DoScriptFile "/path/to/script.jsx"'
```

Claude Code can execute these commands automatically (with your approval),
importing the script into your current AE project.

## Limitations & Considerations

**What this skill generates:**

- Expression code (copy/paste into AE properties)
- .jsx scripts (executable ExtendScript files)
- Setup instructions for expression controls

**What you still do in AE:**

- Create the initial project (if not using .jsx generation)
- Import footage/assets
- Apply final color grading and effects
- Render/export

**File size limits:**

- Claude Code can't directly read large GIFs or videos (>2MB)
- **Solution:** The skill knows to extract image sequences first
- Individual frames (KB each) can be read and analyzed

## Advanced Patterns

The skill includes comprehensive patterns for:

- **Data Visualization:** Bar charts, line graphs, progress rings, counters
- **Timeline Effects:** Variable density tick marks, compression/expansion,
  highlight trails
- **Physics Simulation:** Gravity, drift, bouncing, decay
- **Text Animation:** Typewriter effects, counting numbers, dynamic labels
- **Procedural Motion:** Wiggle, oscillation, rotation, looping

All patterns are resolution and frame-rate independent.

## See Also

- [SKILL.md](./SKILL.md) - The actual skill file (complete technical reference)
- [Adobe ExtendScript Documentation](https://ae-scripting.docsforadobe.dev/) -
  For advanced .jsx scripting
- [After Effects Expression Reference](https://helpx.adobe.com/after-effects/using/expression-language-reference.html)

## License

MIT
