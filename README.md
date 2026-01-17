# aidraw

A CLI tool that generates hand-drawn style PNG diagrams from JSON input. Designed for AI coding agents to create visual diagrams programmatically.

## Installation

```bash
npm install
npm run build
```

## Usage

```bash
# Basic usage
aidraw diagram.json -o output.png --width 1920 --height 1080

# With custom config
aidraw diagram.json -o output.png --width 800 --height 600 --config myconfig.json

# From stdin
cat diagram.json | aidraw -o output.png --width 800 --height 600
```

### Options

| Option | Required | Description |
|--------|----------|-------------|
| `-o, --output <file>` | Yes | Output PNG file path |
| `--width <pixels>` | Yes | Output image width |
| `--height <pixels>` | Yes | Output image height |
| `--config <file>` | No | Config file (defaults to `aidraw.config.json`) |

## JSON Input Format

```json
{
  "elements": [
    { "type": "rectangle", "id": "box1", "x": 0, "y": 0, "width": 100, "height": 60, "label": "Hello" },
    { "type": "rectangle", "id": "box2", "x": 150, "y": 0, "width": 100, "height": 60, "label": "World" },
    { "type": "arrow", "start": "box1", "end": "box2" }
  ]
}
```

Coordinates use logical units. The diagram auto-scales and centers to fit the output dimensions.

## Element Types

### Shapes

All shapes support `children[]` for hierarchical composition. Child coordinates are relative to parent.

```json
{ "type": "rectangle", "id": "r1", "x": 0, "y": 0, "width": 100, "height": 60, "label": "Box", "cornerRadius": 8 }
{ "type": "ellipse", "id": "e1", "x": 0, "y": 0, "width": 80, "height": 80, "label": "Circle" }
{ "type": "diamond", "id": "d1", "x": 0, "y": 0, "width": 80, "height": 80, "label": "Decision" }
{ "type": "container", "id": "group", "x": 0, "y": 0, "children": [...] }
```

### Text

```json
{ "type": "text", "text": "Hello World", "x": 50, "y": 100, "fontSize": 20, "fontFamily": "hand" }
```

Font families: `hand` (default), `normal`, `code`

### Line

```json
{ "type": "line", "points": [[0, 0], [50, 25], [100, 0]] }
```

### Arrow

Arrows connect elements by ID. Connection points are calculated automatically.

```json
{ "type": "arrow", "start": "box1", "end": "box2", "label": "connects" }
```

Arrow options:
- `startArrowhead` / `endArrowhead`: `null`, `"arrow"`, `"dot"`, `"bar"` (default end: `"arrow"`)
- `startSide` / `endSide`: `"top"`, `"bottom"`, `"left"`, `"right"`, `"auto"`

## Style Properties

Add a `style` object to any element:

```json
{
  "type": "rectangle",
  "style": {
    "fill": "#a5d8ff",
    "stroke": "#1971c2",
    "strokeWidth": 2,
    "strokeStyle": "solid",
    "fillStyle": "solid",
    "roughness": 1,
    "opacity": 100
  }
}
```

| Property | Values | Default |
|----------|--------|---------|
| `fill` | hex color | `"transparent"` |
| `stroke` | hex color | `"#1e1e1e"` |
| `strokeWidth` | 1-4 | 2 |
| `strokeStyle` | `"solid"`, `"dashed"`, `"dotted"` | `"solid"` |
| `fillStyle` | `"solid"`, `"hachure"`, `"cross-hatch"` | `"hachure"` |
| `roughness` | 0 (smooth) to 2 (rough) | 1 |
| `opacity` | 0-100 | 100 |

## Color Palette

**Fills:**
| Color | Hex |
|-------|-----|
| Blue | `#a5d8ff` |
| Green | `#b2f2bb` |
| Yellow | `#ffec99` |
| Red | `#ffc9c9` |
| Purple | `#d0bfff` |
| Gray | `#dee2e6` |
| Orange | `#ffd8a8` |
| Cyan | `#99e9f2` |

**Strokes:**
| Color | Hex |
|-------|-----|
| Black | `#1e1e1e` |
| Blue | `#1971c2` |
| Green | `#2f9e44` |
| Red | `#c92a2a` |
| Gray | `#495057` |

## Config File

Create `aidraw.config.json`:

```json
{
  "background": "#ffffff",
  "padding": 20
}
```

## Examples

### Flowchart

```json
{
  "elements": [
    { "type": "rectangle", "id": "start", "x": 0, "y": 0, "width": 120, "height": 50, "label": "Start", "cornerRadius": 25, "style": { "fill": "#b2f2bb" } },
    { "type": "diamond", "id": "check", "x": 0, "y": 80, "width": 120, "height": 80, "label": "Valid?" },
    { "type": "rectangle", "id": "yes", "x": 160, "y": 95, "width": 100, "height": 50, "label": "Process" },
    { "type": "rectangle", "id": "end", "x": 0, "y": 200, "width": 120, "height": 50, "label": "End", "cornerRadius": 25, "style": { "fill": "#ffc9c9" } },
    { "type": "arrow", "start": "start", "end": "check" },
    { "type": "arrow", "start": "check", "end": "yes", "label": "Yes" },
    { "type": "arrow", "start": "check", "end": "end", "label": "No" }
  ]
}
```

### Architecture Diagram

```json
{
  "elements": [
    {
      "type": "rectangle", "id": "frontend", "x": 0, "y": 0, "width": 200, "height": 120,
      "label": "Frontend", "style": { "fill": "#a5d8ff", "fillStyle": "solid" },
      "children": [
        { "type": "rectangle", "id": "react", "x": 25, "y": 50, "width": 150, "height": 40, "label": "React" }
      ]
    },
    {
      "type": "rectangle", "id": "backend", "x": 250, "y": 0, "width": 200, "height": 120,
      "label": "Backend", "style": { "fill": "#b2f2bb", "fillStyle": "solid" },
      "children": [
        { "type": "rectangle", "id": "api", "x": 25, "y": 50, "width": 150, "height": 40, "label": "API Server" }
      ]
    },
    { "type": "arrow", "start": "react", "end": "api", "label": "REST" }
  ]
}
```

## Development

```bash
npm run dev              # Run with tsx
npm run build            # Build TypeScript
npm test                 # Run tests
npm run test:coverage    # Run tests with coverage
```
