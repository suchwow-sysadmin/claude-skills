# AFTER EFFECTS EXPRESSIONS SKILL

---

name: ae-expressions description: Adobe After Effects expression generation for
property automation, motion graphics templates, and data-driven animation. Use
when users request AE expressions, motion automation, or want to link properties
across compositions. license: MIT

---

## CRITICAL: FRAME RATE & RESOLUTION INDEPENDENCE

**All expressions must be frame-rate and resolution independent.** This allows
references at lower specs to produce expressions that work at production specs.

### Reference Material Specs

| Property   | Reference | Production       | Conversion             |
| ---------- | --------- | ---------------- | ---------------------- |
| Frame rate | 15fps     | 24fps (default)  | `seconds = frame / 15` |
| Width      | 480px     | 1920px (default) | `percentX = px / 480`  |
| Height     | 270px     | 1080px (default) | `percentY = px / 270`  |

### The Golden Rules

1. **TIME**: Always use `time` (seconds), never frame numbers

   - Expressions using `time` work at ANY frame rate automatically
   - Convert reference frames: `frame 45 at 15fps = 3 seconds`

2. **POSITION**: Always use percentages via `thisComp.width/height`

   - `[thisComp.width * 0.25, thisComp.height * 0.5]` works at ANY resolution
   - Convert reference pixels: `120px on 480px wide = 0.25 (25%)`

3. **SIZE**: Use percentages for dimensions that should scale
   - Bar width: `thisComp.width * 0.008` (not `4px`)
   - Element height: `thisComp.height * 0.15` (not `40px`)

### Conversion Examples

```javascript
// REFERENCE OBSERVATION: "Bar at x=120, y=200, reaches full at frame 45"

// Conversion math:
// x: 120 / 480 = 0.25 (25%)
// y: 200 / 270 = 0.74 (74%)
// time: 45 / 15 = 3 seconds

// EXPRESSION OUTPUT:
targetX = thisComp.width * 0.25;
targetY = thisComp.height * 0.74;
duration = 3;
ease(time, 0, duration, [0, targetY], [targetX, targetY]);
```

### Quick Percentage Reference (480×270 → any resolution)

| Reference px | Percentage | 1080p result | 4K result |
| ------------ | ---------- | ------------ | --------- |
| 48px         | 10%        | 192px        | 384px     |
| 120px        | 25%        | 480px        | 960px     |
| 240px        | 50%        | 960px        | 1920px    |
| 360px        | 75%        | 1440px       | 2880px    |
| 480px        | 100%       | 1920px       | 3840px    |

| Reference px (height) | Percentage | 1080p result |
| --------------------- | ---------- | ------------ |
| 27px                  | 10%        | 108px        |
| 67px                  | 25%        | 270px        |
| 135px                 | 50%        | 540px        |
| 270px                 | 100%       | 1080px       |

### Fixed-Pixel Elements (Strokes, Effects, Shadows)

Some properties are measured in pixels but should scale proportionally with
resolution. A 2px stroke that looks crisp at 480px becomes invisible at 4K.

**The Scale Factor Pattern:**

```javascript
// Define your reference resolution and base value
baseValue = 2; // What looked good at 480px wide
scaleFactor = thisComp.width / 480;
baseValue * scaleFactor;
```

**Apply to:**

- Stroke Width (shape layers)
- Border/outline thickness
- Drop Shadow → Distance
- Drop Shadow → Softness
- Gaussian Blur → Blurriness
- Glow → Radius
- Any effect parameter measured in pixels

**Common Stroke/Effect Conversions (480px reference):** | Reference | Scale
Factor | 1080p Result | 4K Result |
|-----------|--------------|--------------|-----------| | 1px | width/480 | 4px
| 8px | | 2px | width/480 | 8px | 16px | | 3px | width/480 | 12px | 24px | | 4px
| width/480 | 16px | 32px | | 8px | width/480 | 32px | 64px |

**Expression Examples:**

```javascript
// Stroke Width
baseStroke = 2;
(thisComp.width / 480) * baseStroke;

// Drop Shadow Distance
baseDist = 4;
(thisComp.width / 480) * baseDist;

// Blur Radius
baseBlur = 8;
(thisComp.width / 480) * baseBlur;

// With controller slider (user sets "design" value, scales automatically)
baseValue = thisComp.layer("Controller").effect("Stroke Base")("Slider");
(thisComp.width / 480) * baseValue;
```

**Note:** For effect parameters, apply the expression directly to the effect
property (e.g., Effects > Drop Shadow > Distance), not to a separate layer
property.

---

## CRITICAL: WORKING WITH REFERENCE MATERIAL

**Claude Code has a strict ~2MB image read limit.** You CANNOT read GIFs,
videos, or large images directly.

### THE SOLUTION: IMAGE SEQUENCES

Individual frames from an image sequence are typically **kilobytes each** - well
under the limit. Work with the sequence, not the compiled output.

**If user provides an image sequence directory:**

```bash
# List frames to understand what's there
ls -la /path/to/frames/

# Read a sampling of frames (these are KB each, no problem)
# Read frame_0001.png, frame_0030.png, frame_0060.png, etc.
```

**If user provides a GIF/video, extract frames first:**

```bash
# Create frames directory
mkdir -p /tmp/ref_frames

# Extract at 480px wide, 15fps (produces KB-sized frames)
ffmpeg -i input.gif -vf "scale=480:-1:flags=lanczos,fps=15" /tmp/ref_frames/frame_%04d.png

# Or from video:
ffmpeg -i input.mov -vf "scale=480:-1:flags=lanczos,fps=15" /tmp/ref_frames/frame_%04d.png

# Check frame sizes (should be KB each)
ls -lh /tmp/ref_frames/
```

**To compile frames back to GIF (for user reference):**

```bash
cd /path/to/frames
magick -delay 7 -loop 0 frame_*.png -layers Optimize output.gif
```

### WORKFLOW ORDER

1. **User provides reference** → Ask: "Is this an image sequence directory or a
   compiled GIF/video?"
2. **If image sequence** → Read sampling of individual frames directly (they're
   KB each)
3. **If GIF/video** → Extract frames first with ffmpeg command above
4. **Read 3-5 frames** → Enough to understand the animation: first, 25%, 50%,
   75%, last
5. **Convert observations** → Frames to seconds (÷15), pixels to percentages
   (÷480 or ÷270)
6. **Generate expressions** → Using `time` and `thisComp.width/height`

### FRAME SAMPLING STRATEGY

For a typical animation reference, read these frames:

```bash
# List total frame count
ls frames/ | wc -l
# Example output: 120 frames (= 8 seconds at 15fps)

# Read strategic frames:
# - Frame 1 (start state) → time = 0.067s
# - Frame 30 (25% through) → time = 2s
# - Frame 60 (midpoint) → time = 4s
# - Frame 90 (75% through) → time = 6s
# - Frame 120 (end state) → time = 8s
```

This gives you the full picture of:

- Start/end states
- Animation progression
- Timing/easing (by comparing frame differences)
- All visual elements

**Always note your frame-to-seconds conversion in analysis:**

```
Frame 45: Bar reaches 50% height
→ 45 / 15 = 3 seconds
→ Expression: ease(time, 0, 3, 0, targetHeight * 0.5)
```

---

## OVERVIEW

After Effects expressions are **JavaScript-based code snippets** that evaluate
to single values for layer properties at specific times. Unlike scripts (which
tell the app to do something), expressions tell **properties** to do something.

This skill generates production-ready AE expressions with:

- Clean, commented code
- Frame-rate independence (using `time` in seconds)
- Resolution independence (using `thisComp.width/height`)
- Performance optimization
- Expression controls integration
- Fallback patterns for complex operations

---

## WHEN TO USE THIS SKILL

**Trigger phrases:**

- "Create an AE expression for..."
- "Automate this property in After Effects..."
- "Link these layers together..."
- "Make this wiggle/bounce/loop..."
- "Create a motion graphics template with..."
- "Data-driven animation for..."
- "Replicate this animation..." (with reference)

**Do NOT use for:**

- General JavaScript questions (not AE-specific)
- Scripting (.jsx files that automate AE UI)
- Plugin development

---

## TWO-STEP PROCESS

### Step 1: Analyze Reference (if provided)

1. **Get the frames** - Work with image sequence, extract if necessary
2. **Read strategic frames** - First, middle, last at minimum
3. **Convert units:**
   - Frames → seconds (÷15)
   - Pixels → percentages (÷480 for X, ÷270 for Y)
4. **Identify elements:**
   - What's animating? (position, scale, opacity, rotation, etc.)
   - What's the timing? (convert to seconds)
   - What are the positions? (convert to percentages)
   - What stays static? (backgrounds, labels)
   - What's data-driven? (numbers, progress bars, charts)

### Step 2: Expression Implementation

Write the expression with:

- `time` for all timing (never frame numbers)
- `thisComp.width/height` for all positions/sizes
- Clear comments explaining each section
- Variable declarations at top
- Expression controls where appropriate
- Error handling for edge cases

---

## EXPRESSION FUNDAMENTALS

### Core Concepts

```javascript
// Expressions evaluate at EACH FRAME to produce a single value
// They have access to:
// - time: current composition time in seconds (FRAME-RATE INDEPENDENT)
// - value: the property's pre-expression value (including keyframes)
// - thisComp: composition reference (use .width, .height for RESOLUTION INDEPENDENCE)
// - thisLayer, thisProperty: context references

// Basic structure:
// 1. Get references and controls
// 2. Calculate using time (seconds) and percentages
// 3. Return a single value (number, array, or color)
```

### Pre-Expression vs Post-Expression Values

```javascript
// Pre-expression value (blue in AE UI)
// Access via: value, valueAtTime(t), key(n).value

// Post-expression value (red in AE UI)
// This is what the expression returns

// Example: Add wiggle ON TOP of keyframed animation
wiggle(5, 20); // This uses 'value' internally

// Explicit version:
value + wiggle(5, 20) - value; // Same result, shows the math
```

---

## COMMON EXPRESSION PATTERNS

### 1. WIGGLE (Random Movement)

```javascript
// Basic wiggle - frequency (per second), amplitude (percentage of comp)
wiggleAmp = thisComp.width * 0.015; // 1.5% of width
wiggle(2, wiggleAmp);

// Smooth wiggle - add octaves and amp_mult
wiggle(2, wiggleAmp, 2, 0.5); // 2 octaves, amplitude halved each octave

// Wiggle with expression control
freq = effect("Wiggle Frequency")("Slider");
ampPercent = effect("Wiggle Amplitude")("Slider") / 100;
amp = thisComp.width * ampPercent;
wiggle(freq, amp);

// One-dimensional wiggle (X only)
wiggleAmp = thisComp.width * 0.015;
[wiggle(2, wiggleAmp)[0], value[1]];

// Wiggle that holds position briefly (less jittery)
n = 0; // Segments to hold
if (n > 0) {
	freq = 2;
	amp = thisComp.width * 0.015;
	t = time;
	hold = 1 / (freq * n);
	t = t - (t % hold);
	wiggle(freq, amp, 1, 0.5, t);
} else {
	wiggle(2, thisComp.width * 0.015);
}
```

### 2. TIME-BASED ANIMATION

```javascript
// Constant rotation (degrees per second)
time * 90; // 90 degrees per second

// Oscillating value (ping-pong)
amplitude = thisComp.height * 0.05; // 5% of comp height
frequency = 1; // Cycles per second
value + Math.sin(time * frequency * Math.PI * 2) * amplitude;

// Bouncing (absolute value of sine)
amplitude = thisComp.height * 0.1; // 10% of comp height
frequency = 2;
Math.abs(Math.sin(time * frequency * Math.PI)) * amplitude;

// Decay/dampen over time
amplitude = thisComp.width * 0.1;
decay = 3; // Higher = faster decay
amplitude * Math.exp(-decay * time);

// Exponential growth (careful with large values!)
startValue = thisComp.width * 0.01;
growth = 0.5;
startValue * Math.exp(growth * time);
```

### 3. LOOPING

```javascript
// Loop out - repeat animation after last keyframe
loopOut(); // Default: "cycle"
loopOut("cycle"); // Same - jumps back to start
loopOut("pingpong"); // Reverses direction
loopOut("offset"); // Continues from where it ended
loopOut("continue"); // Extrapolates based on velocity

// Loop with specific number of keyframes
loopOut("cycle", 2); // Only loop last 2 keyframes

// Loop in - repeat animation before first keyframe
loopIn();
loopIn("pingpong");

// Seamless loop for entire comp duration
loopDuration = 2; // seconds (frame-rate independent)
time % loopDuration;

// Loop with easing at connection point
loopDuration = 2;
t = time % loopDuration;
ease(t, 0, loopDuration, 0, 100); // Eased 0-100 loop
```

### 4. PROPERTY LINKING

```javascript
// Link to another layer's property
thisComp.layer("Controller").transform.position;

// Link to effect slider
thisComp.layer("Controller").effect("Slider Control")("Slider");

// Link with offset (percentage-based)
offsetX = thisComp.width * 0.05; // 5% of width
offsetY = 0;
thisComp.layer("Other Layer").transform.position + [offsetX, offsetY];

// Link with delay (follow with lag)
delay = 0.5; // seconds
target = thisComp.layer("Leader").transform.position;
target.valueAtTime(time - delay);

// Parent-style linking without parenting
parentLayer = thisComp.layer("Parent");
parentLayer.toWorld(parentLayer.transform.anchorPoint);
```

### 5. RANGE MAPPING & INTERPOLATION

```javascript
// Linear mapping (input range → output range)
// linear(value, inMin, inMax, outMin, outMax)
linear(time, 0, 5, 0, 100); // 0-100 over 5 seconds

// Eased mapping (smooth start and end)
// ease(value, inMin, inMax, outMin, outMax)
ease(time, 0, 5, 0, 100);

// One-sided easing
easeIn(time, 0, 5, 0, 100); // Slow start
easeOut(time, 0, 5, 0, 100); // Slow end

// Clamp to range (prevent overshoot)
clamp(value, 0, 100);

// Normalize to 0-1 range
normalize = (value - min) / (max - min);

// Position mapping (resolution independent)
startPos = [thisComp.width * 0.1, thisComp.height * 0.5];
endPos = [thisComp.width * 0.9, thisComp.height * 0.5];
ease(time, 0, 3, startPos, endPos); // Move across 80% of comp in 3 seconds
```

### 6. CONDITIONALS

```javascript
// Simple if/else (time in seconds)
if (time < 2) {
	100;
} else {
	0;
}

// Ternary operator (preferred for simple conditions)
time < 2 ? 100 : 0;

// Multiple conditions
value < 50 ? "Low" : value < 100 ? "Medium" : "High";

// Checkbox-controlled behavior
enabled = effect("Enable")("Checkbox");
enabled ? wiggle(2, thisComp.width * 0.015) : value;

// Time-based triggers (seconds)
marker.numKeys > 0 && time >= marker.key(1).time ? 100 : 0;
```

### 7. ARRAY OPERATIONS (Position, Scale, etc.)

```javascript
// Position is [x, y] or [x, y, z] in 3D
// Add percentage-based offset to X only
[value[0] + thisComp.width * 0.05, value[1]];

// Scale uniformly from slider
s = effect("Scale Control")("Slider");
[s, s];

// Independent X/Y wiggle (percentage-based amplitude)
xAmp = thisComp.width * 0.015;
yAmp = thisComp.height * 0.03;
[wiggle(2, xAmp)[0], wiggle(1, yAmp)[1]];

// Separate dimension controls
xAmpPct = effect("X Amplitude %")("Slider") / 100;
yAmpPct = effect("Y Amplitude %")("Slider") / 100;
xAmp = thisComp.width * xAmpPct;
yAmp = thisComp.height * yAmpPct;
[
	value[0] + wiggle(2, xAmp)[0] - value[0],
	value[1] + wiggle(2, yAmp)[1] - value[1],
];
```

### 8. EXPRESSION CONTROLS SETUP

```javascript
// Reference pattern for expression controls
// Apply these effects to a "Controller" null layer:

// Slider Control → numeric values
freq = thisComp.layer("Controller").effect("Frequency")("Slider");
ampPct = thisComp.layer("Controller").effect("Amplitude %")("Slider") / 100;
amp = thisComp.width * ampPct;

// Checkbox Control → boolean
enabled = thisComp.layer("Controller").effect("Enable Wiggle")("Checkbox");

// Color Control → color values
col = thisComp.layer("Controller").effect("Fill Color")("Color");

// Point Control → 2D position (use percentages in the control, multiply here)
posPct = thisComp.layer("Controller").effect("Offset %")("Point");
pos = [(thisComp.width * posPct[0]) / 100, (thisComp.height * posPct[1]) / 100];

// Layer Control → layer reference
targetLayer = thisComp.layer("Controller").effect("Target")("Layer");

// Dropdown Menu Control → index (1-based)
option = thisComp.layer("Controller").effect("Mode")("Menu");
switch (option) {
	case 1:
		/* Option A */ break;
	case 2:
		/* Option B */ break;
	default:
		/* Default */ break;
}
```

---

## ADVANCED PATTERNS

### Inertia/Overshoot

```javascript
// Smooth follow with overshoot (apply to position/rotation/scale)
// Requires keyframes - the expression adds bounce after keyframe ends

n = 0;
if (numKeys > 0) {
	n = nearestKey(time).index;
	if (key(n).time > time) n--;
}
if (n > 0) {
	t = time - key(n).time;
	amp = velocityAtTime(key(n).time - 0.001);
	freq = 3; // Bounce frequency
	decay = 5; // Damping
	value + amp * (Math.sin(t * freq * Math.PI * 2) / Math.exp(decay * t));
} else {
	value;
}
```

### Typewriter Effect

```javascript
// Apply to Source Text property
fullText = "Hello, World!";
charsPerSecond = 10;
numChars = Math.floor(time * charsPerSecond);
fullText.substring(0, numChars);
```

### Auto-Orient Along Path

```javascript
// Apply to Rotation - makes layer point in direction of movement
delta = 0.01;
p1 = thisLayer.transform.position.valueAtTime(time - delta);
p2 = thisLayer.transform.position.valueAtTime(time + delta);
angle = Math.atan2(p2[1] - p1[1], p2[0] - p1[0]);
radiansToDegrees(angle);
```

### Counter/Number Display

```javascript
// Apply to Source Text
startNum = 0;
endNum = 1000;
duration = 3; // seconds
decimals = 0;

progress = clamp(time / duration, 0, 1);
currentNum = linear(progress, 0, 1, startNum, endNum);
currentNum.toFixed(decimals);
```

### Random Within Constraints (Resolution Independent)

```javascript
// Seed-based random (consistent per layer)
seedRandom(index, true);
random(0, 100);

// Time-based random that changes
seedRandom(Math.floor(time * 2), false); // Changes 2x per second
random(0, 100);

// Random position within bounds (percentage-based)
seedRandom(index, true);
marginPct = 0.1; // 10% margin from edges
x = random(thisComp.width * marginPct, thisComp.width * (1 - marginPct));
y = random(thisComp.height * marginPct, thisComp.height * (1 - marginPct));
[x, y];

// Random position within specific region (25%-75% of comp)
seedRandom(index, true);
x = random(thisComp.width * 0.25, thisComp.width * 0.75);
y = random(thisComp.height * 0.25, thisComp.height * 0.75);
[x, y];
```

---

## DATA VISUALIZATION PATTERNS

### Animated Bar Chart

```javascript
// Apply to Scale (Y) of a rectangle shape layer
// Anchor point must be at BOTTOM CENTER of the bar
// Controller needs: "Bar Value" slider (0-100), "Duration" slider (seconds)

targetValue = thisComp.layer("Controller").effect("Bar Value")("Slider");
duration = thisComp.layer("Controller").effect("Duration")("Slider");

progress = clamp(time / duration, 0, 1);
currentHeight = ease(progress, 0, 1, 0, targetValue);
[value[0], currentHeight];
```

### Bar Chart with Staggered Bars

```javascript
// Apply to Scale (Y) of multiple bar layers
// Uses layer index for stagger timing

targetValue = thisComp.layer("Controller").effect("Bar Value")("Slider");
duration = thisComp.layer("Controller").effect("Duration")("Slider");
staggerDelay = 0.1; // seconds between each bar

layerDelay = (index - 1) * staggerDelay;
t = Math.max(0, time - layerDelay);
progress = clamp(t / duration, 0, 1);
currentHeight = ease(progress, 0, 1, 0, targetValue);
[value[0], currentHeight];
```

### Timeline Ticker (Variable Density)

```javascript
// Apply to Position (X) of tick mark layers
// Compresses/expands spacing based on "time compression" factor

ctrl = thisComp.layer("Controller");
baseSpacing = thisComp.width * 0.02; // 2% of comp width base spacing
compressionFactor = ctrl.effect("Time Compression")("Slider"); // 1 = normal, <1 = compressed, >1 = expanded

tickIndex = index - 1; // 0-based index
currentSpacing = baseSpacing * compressionFactor;

startX = thisComp.width * 0.1; // Start at 10% from left
startX + tickIndex * currentSpacing;
```

### Timeline with Animated Compression

```javascript
// Apply to Position (X) - spacing changes over time
ctrl = thisComp.layer("Controller");
baseSpacing = thisComp.width * 0.02;
compressionStart = ctrl.effect("Compression Start")("Slider"); // seconds
compressionEnd = ctrl.effect("Compression End")("Slider"); // seconds
minCompression = ctrl.effect("Min Compression")("Slider"); // e.g., 0.3

// Calculate current compression factor
compressionFactor = 1;
if (time >= compressionStart && time <= compressionEnd) {
	progress = (time - compressionStart) / (compressionEnd - compressionStart);
	compressionFactor = ease(progress, 0, 1, 1, minCompression);
} else if (time > compressionEnd) {
	compressionFactor = minCompression;
}

tickIndex = index - 1;
currentSpacing = baseSpacing * compressionFactor;
startX = thisComp.width * 0.1;
[startX + tickIndex * currentSpacing, value[1]];
```

### Current Tick Highlight (Opacity Trail)

```javascript
// Apply to Opacity of tick marks
// Creates fading trail behind the "current" tick

ctrl = thisComp.layer("Controller");
currentTickIndex = ctrl.effect("Current Tick")("Slider");
trailLength = ctrl.effect("Trail Length")("Slider"); // How many ticks fade

tickIndex = index - 1;
distance = currentTickIndex - tickIndex;

if (distance < 0) {
	0; // Future ticks: invisible
} else if (distance == 0) {
	100; // Current tick: full opacity
} else if (distance <= trailLength) {
	// Trail: fade based on distance
	linear(distance, 0, trailLength, 100, 20);
} else {
	20; // Past ticks: dim
}
```

### Current Tick Scale (Slightly Taller)

```javascript
// Apply to Scale (Y) of tick marks
// Current tick is taller, eases in

ctrl = thisComp.layer("Controller");
currentTickIndex = ctrl.effect("Current Tick")("Slider");
transitionDuration = 0.3; // seconds to grow

tickIndex = index - 1;
baseScale = 100;
highlightScale = 120; // 20% taller when current

// Check if this is becoming the current tick
prevTick = ctrl.effect("Current Tick").valueAtTime(time - transitionDuration);
isCurrent = tickIndex == Math.floor(currentTickIndex);
wasCurrent = tickIndex == Math.floor(prevTick);

if (isCurrent && !wasCurrent) {
	// Transitioning to current: ease up
	timeSinceCurrent = time - (time - transitionDuration); // Approximate
	ease(timeSinceCurrent, 0, transitionDuration, baseScale, highlightScale);
} else if (isCurrent) {
	highlightScale;
} else {
	baseScale;
}
```

### Circular Progress Ring

```javascript
// Apply to "Trim Paths > End" on a circle stroke
targetPercent = thisComp.layer("Controller").effect("Progress")("Slider");
duration = thisComp.layer("Controller").effect("Duration")("Slider");

progress = clamp(time / duration, 0, 1);
ease(progress, 0, 1, 0, targetPercent);
```

### Counting Number

```javascript
// Apply to Source Text
startNum = 0;
endNum = thisComp.layer("Controller").effect("Target Number")("Slider");
duration = thisComp.layer("Controller").effect("Duration")("Slider");
prefix = "$";
suffix = "M";

progress = clamp(time / duration, 0, 1);
currentNum = ease(progress, 0, 1, startNum, endNum);
prefix + currentNum.toFixed(1) + suffix;
```

### Staggered Animation (Multiple Elements)

```javascript
// Apply to Position of multiple layers
// Each layer animates with a delay based on its index

staggerDelay = 0.1; // seconds between each layer
layerDelay = (index - 1) * staggerDelay;
duration = 0.5; // seconds

// Start 5% below final position, animate up
offsetY = thisComp.height * 0.05;
startPos = [transform.position[0], transform.position[1] + offsetY];
endPos = transform.position;

progress = clamp((time - layerDelay) / duration, 0, 1);
ease(progress, 0, 1, startPos, endPos);
```

### Falling Elements (Gravity + Drift)

```javascript
// Apply to Position for particle-like falling
// Each layer uses index for variation

seedRandom(index, true);
gravity = thisComp.height * 0.5; // Fall speed (50% of comp height per second squared)
xDrift = random(-0.05, 0.05) * thisComp.width; // Random horizontal drift

startX = thisComp.width * random(0.2, 0.8); // Random start X (20%-80%)
startY = -thisComp.height * 0.05; // Start just above comp

// Physics: y = y0 + 0.5 * g * t^2
currentX = startX + xDrift * time;
currentY = startY + 0.5 * gravity * time * time;

[currentX, currentY];
```

---

## OUTPUT FORMAT

### Single Expression

```javascript
// ================================================
// EXPRESSION: [Name]
// Property: [Position/Rotation/Scale/Opacity/etc.]
// Description: [What it does]
// Reference: [Frame X = Y seconds, position at Z% of comp]
// ================================================

// Expression Controls Required:
// - [Layer Name] > [Effect Name] (Slider/Checkbox/etc.)

// --- EXPRESSION START ---
[expression code with comments]
// --- EXPRESSION END ---

// Usage Notes:
// - Resolution independent: uses thisComp.width/height
// - Frame-rate independent: uses time in seconds
// - [Any other important notes]
```

### Expression Preset Bundle

```json
{
	"name": "Expression Preset Name",
	"version": "1.0",
	"author": "ae-expressions-skill",
	"description": "What this preset does",
	"reference_specs": {
		"fps": 15,
		"width": 480,
		"height": 270
	},
	"output_specs": {
		"fps": 24,
		"width": 1920,
		"height": 1080
	},
	"expressions": {
		"Position": "[thisComp.width * 0.5, thisComp.height * 0.5]",
		"Rotation": "time * 90",
		"Opacity": "ease(time, 0, 2, 0, 100)"
	},
	"controls": [
		{
			"name": "Frequency",
			"type": "Slider Control",
			"default": 2,
			"min": 0.5,
			"max": 10,
			"description": "Wiggle frequency in cycles per second"
		},
		{
			"name": "Amplitude %",
			"type": "Slider Control",
			"default": 5,
			"min": 0,
			"max": 50,
			"description": "Wiggle amplitude as percentage of comp width"
		},
		{
			"name": "Enable Effect",
			"type": "Checkbox Control",
			"default": true,
			"description": "Toggle the effect on/off"
		}
	],
	"setup_instructions": [
		"Create a Null layer named 'Controller'",
		"Add the expression controls listed above",
		"Apply expressions to target layer properties",
		"Expressions will work at any resolution/frame rate"
	]
}
```

---

## PERFORMANCE OPTIMIZATION

### Do's

```javascript
// ✅ Cache layer references
ctrl = thisComp.layer("Controller");
freq = ctrl.effect("Frequency")("Slider");
amp = (ctrl.effect("Amplitude %")("Slider") / 100) * thisComp.width;

// ✅ Calculate percentages once
widthUnit = thisComp.width / 100;
heightUnit = thisComp.height / 100;
pos = [widthUnit * 25, heightUnit * 50];

// ✅ Use simple math where possible
time * 90; // Good
radiansToDegrees((time * Math.PI) / 2); // Unnecessary

// ✅ Minimize valueAtTime calls
// Each call evaluates the entire expression tree
```

### Don'ts

```javascript
// ❌ Don't use try/catch (slow and often unnecessary)
try {
	/* ... */
} catch (e) {
	/* ... */
}

// ❌ Don't evaluate other layer's expressions unnecessarily
// This creates evaluation chains

// ❌ Don't use posterizeTime unless needed for effect
// It doesn't improve performance

// ❌ Avoid complex string operations
// Text expressions can be slow with manipulation

// ❌ Don't hardcode pixels - always use percentages
[480, 270][(thisComp.width * 0.25, thisComp.height * 0.25)]; // BAD // GOOD
```

---

## ERROR HANDLING

### Common Errors

| Error                        | Cause                      | Solution                            |
| ---------------------------- | -------------------------- | ----------------------------------- |
| "undefined is not an object" | Layer/effect doesn't exist | Check layer and effect names        |
| "Expected: ]"                | Array syntax error         | Count brackets, check commas        |
| Expression disabled          | Error during evaluation    | Check AE's expression error dialog  |
| Unexpected value type        | Wrong property type        | Ensure return matches property type |

### Defensive Coding

```javascript
// Check if layer exists
target = thisComp.layer("Controller");
if (target) {
	target.transform.position;
} else {
	value;
}

// Check if effect exists
try {
	effect("Slider Control")("Slider");
} catch (e) {
	50; // Default value
}

// Note: try/catch is slow - use sparingly
```

---

## INTEGRATION WITH MOGRT

### Essential Properties Pattern

```javascript
// When creating Motion Graphics Templates:
// 1. Apply expression to property
// 2. Add expression control as driver
// 3. Enable "Essential Graphics" on the control
// 4. The expression links to the control

// Example: Editable wiggle in MOGRT (percentage-based)
freq = effect("Wiggle Speed")("Slider"); // This becomes editable
ampPct = effect("Wiggle Amount %")("Slider") / 100; // This becomes editable
amp = thisComp.width * ampPct;
wiggle(freq, amp);

// Mark both slider controls as Essential Properties
// Users can adjust in Premiere without AE
```

---

## AE PROJECT ASSET WORKFLOW

### What This Skill Generates vs. What AE Does

| Element              | Generated by Skill         | Created in AE          |
| -------------------- | -------------------------- | ---------------------- |
| Expressions          | ✅ Text output, copy/paste | -                      |
| Expression controls  | ✅ Setup instructions      | Apply effects manually |
| Solids/shapes        | ❌                         | ✅ Create in AE        |
| Keyframe animations  | ❌                         | ✅ Animate in AE       |
| Text layers          | ✅ Font/style suggestions  | ✅ Create in AE        |
| Composition settings | ✅ Recommendations         | ✅ Create in AE        |

### Workflow: Reference → Expressions

```
1. USER: Provides image sequence directory (or GIF/video to extract)
2. AGENT: Extracts frames if needed, reads sampling of individual frames
3. AGENT: Analyzes animation, converting:
   - Frames → seconds (÷15)
   - Pixels → percentages (÷480 for X, ÷270 for Y)
4. AGENT: Outputs:
   - Expression code using time and thisComp.width/height
   - Layer structure recommendations
   - Controller null setup instructions
   - Which elements need keyframes vs expressions
5. USER: Creates layers/solids in AE at target resolution
6. USER: Applies expressions from skill output
7. USER: Sets up expression controls on Controller null
8. RESULT: Expressions work at any resolution/frame rate
```

### What CAN Be Expression-Driven

| Animation Type     | Expression-Driven? | Notes                                               |
| ------------------ | ------------------ | --------------------------------------------------- |
| Counting numbers   | ✅ Yes             | `linear(time, 0, dur, start, end).toFixed(0)`       |
| Progress bars      | ✅ Yes             | Link scale to slider control                        |
| Wiggle/jitter      | ✅ Yes             | `wiggle(freq, amp)` with % amplitude                |
| Looping motion     | ✅ Yes             | `loopOut("cycle")`                                  |
| Data-linked values | ✅ Yes             | Link to slider/text source                          |
| Following/delay    | ✅ Yes             | `valueAtTime(time - delay)`                         |
| Random placement   | ✅ Yes             | `seedRandom(index, true)` with % bounds             |
| Staggered timing   | ✅ Yes             | Based on layer index                                |
| Variable spacing   | ✅ Yes             | Timeline compression/expansion                      |
| Color transitions  | ⚠️ Partial         | Expressions can interpolate, keyframes often easier |
| Complex paths      | ❌ No              | Use keyframes or shape layer paths                  |
| Morphing shapes    | ❌ No              | Use keyframes                                       |

---

## STARTER TEMPLATE: Components

### Controller Null Setup

**Layer:** Null object named `Controller`

**Standard Controls:** | Effect | Type | Purpose | |--------|------|---------| |
Duration | Slider (0-10) | Animation duration in seconds | | Delay | Slider
(0-5) | Start delay in seconds | | Target Value | Slider (0-100) | Target
percentage for bars/progress | | Current Index | Slider | For sequential
animations (tickers) | | Stagger | Slider (0-1) | Delay between elements in
seconds | | Compression | Slider (0.1-2) | Spacing multiplier for timelines |

### Bar Component

**Layer:** Shape layer with rectangle, anchor at bottom center

**Apply to Scale Y:**

```javascript
targetValue = thisComp.layer("Controller").effect("Target Value")("Slider");
duration = thisComp.layer("Controller").effect("Duration")("Slider");
delay = thisComp.layer("Controller").effect("Delay")("Slider");

t = Math.max(0, time - delay);
progress = clamp(t / duration, 0, 1);
[100, ease(progress, 0, 1, 0, targetValue)];
```

### Tick Mark Component

**Layer:** Shape layer rectangle, narrow and tall

**Apply to Position X:**

```javascript
ctrl = thisComp.layer("Controller");
baseSpacing = thisComp.width * 0.02;
compression = ctrl.effect("Compression")("Slider");
startX = thisComp.width * 0.1;

tickIndex = index - 1;
startX + tickIndex * baseSpacing * compression;
```

### Falling Element Component

**Layer:** Shape or image, small element

**Apply to Position:**

```javascript
seedRandom(index, true);
startX = thisComp.width * random(0.2, 0.8);
startY = -thisComp.height * 0.05;
gravity = thisComp.height * 0.3;
drift = random(-0.02, 0.02) * thisComp.width;

delay = random(0, 2);
t = Math.max(0, time - delay);

[startX + drift * t, startY + 0.5 * gravity * t * t];
```

---

## QUICK REFERENCE CARD

| Task              | Expression                                                       |
| ----------------- | ---------------------------------------------------------------- |
| Wiggle (%)        | `wiggle(2, thisComp.width * 0.03)`                               |
| Constant rotation | `time * 90`                                                      |
| Loop animation    | `loopOut("cycle")`                                               |
| Bounce            | `Math.abs(Math.sin(time * 2 * Math.PI)) * thisComp.height * 0.1` |
| Link to slider    | `effect("Control")("Slider")`                                    |
| Delay/follow      | `target.valueAtTime(time - 0.5)`                                 |
| Range map         | `linear(time, 0, 5, 0, 100)`                                     |
| Eased map         | `ease(time, 0, 5, 0, 100)`                                       |
| Random (seeded)   | `seedRandom(index, true); random(0, 100)`                        |
| Conditional       | `time < 2 ? 100 : 0`                                             |
| Counter           | `linear(time, 0, dur, 0, end).toFixed(0)`                        |
| Stagger           | `(index - 1) * 0.1`                                              |
| Center position   | `[thisComp.width * 0.5, thisComp.height * 0.5]`                  |
| Percentage X      | `thisComp.width * 0.25`                                          |

### Conversion Cheat Sheet

| From Reference   | Math                   | Example                        |
| ---------------- | ---------------------- | ------------------------------ |
| Frame to seconds | `frame / 15`           | Frame 45 → 3s                  |
| X pixels to %    | `px / 480`             | 120px → 0.25                   |
| Y pixels to %    | `px / 270`             | 135px → 0.5                    |
| % to expression  | `thisComp.width * pct` | 0.25 → `thisComp.width * 0.25` |

---

## CHANGELOG

| Date       | Change                                                                        |
| ---------- | ----------------------------------------------------------------------------- |
| 2025-12-28 | Initial skill specification created                                           |
| 2025-12-28 | Added expression controls patterns                                            |
| 2025-12-28 | Added MOGRT integration section                                               |
| 2025-12-28 | Added performance optimization guide                                          |
| 2026-01-06 | CRITICAL: Added image sequence workflow (frames are KB, GIFs are MB)          |
| 2026-01-06 | Added data visualization expression patterns                                  |
| 2026-01-06 | Added correct ffmpeg/magick commands                                          |
| 2026-01-06 | Added frame sampling strategy                                                 |
| 2026-01-06 | **MAJOR: Added frame rate independence (15fps ref → time in seconds)**        |
| 2026-01-06 | **MAJOR: Added resolution independence (480px ref → percentage expressions)** |
| 2026-01-06 | Updated ALL expression examples to use thisComp.width/height                  |
| 2026-01-06 | Added conversion cheat sheet and quick reference                              |
| 2026-01-06 | Added starter template components section                                     |
| 2026-01-06 | Added timeline ticker and variable density patterns                           |
