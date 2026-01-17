---
name: aidraw
description: Generate hand-drawn style PNG diagrams from JSON. Use when the user asks to create architecture diagrams, flowcharts, sequence diagrams, mind maps, wireframes, ER diagrams, system diagrams, or any visual diagram.
---

# AI Diagram CLI Skill

## When to Use

Use the `aidraw` tool when the user asks you to create:
- Architecture diagrams
- Flowcharts
- Sequence diagrams
- Mind maps
- Wireframes
- ER diagrams
- System diagrams
- Any visual diagram

## Quick Start

1. Create a JSON file with diagram elements
2. Run: `aidraw diagram.json -o output.png --width 1920 --height 1080`
3. Present the output.png to the user

## CLI Usage

```bash
# Basic usage
aidraw input.json -o output.png --width 1920 --height 1080

# With custom config
aidraw input.json -o output.png --width 800 --height 600 --config myconfig.json

# From stdin
cat diagram.json | aidraw -o output.png --width 1920 --height 1080
```

## Element Types

| Type | Description | Use For |
|------|-------------|---------|
| `rectangle` | Rectangular box | Components, services, steps |
| `ellipse` | Circle or oval | Start/end states, databases |
| `diamond` | Rhombus shape | Decision points, conditions |
| `container` | Invisible grouping | Grouping related elements |
| `text` | Standalone text | Labels, titles, annotations |
| `line` | Multi-point polyline | Connections without arrows |
| `arrow` | Anchored connection | Flow direction, relationships |

## Element Templates

### Basic Shape

```json
{
  "type": "rectangle",
  "id": "box1",
  "x": 100,
  "y": 100,
  "width": 150,
  "height": 80,
  "label": "My Box",
  "style": {
    "fill": "#a5d8ff",
    "stroke": "#1971c2",
    "strokeWidth": 2
  }
}
```

### Arrow Connection

```json
{
  "type": "arrow",
  "id": "arrow1",
  "start": "box1",
  "end": "box2",
  "label": "connects to"
}
```

### Nested Children

```json
{
  "type": "rectangle",
  "id": "parent",
  "x": 50,
  "y": 50,
  "width": 300,
  "height": 200,
  "label": "Parent Container",
  "style": { "fill": "#dee2e6" },
  "children": [
    {
      "type": "rectangle",
      "id": "child1",
      "x": 20,
      "y": 50,
      "width": 100,
      "height": 60,
      "label": "Child 1"
    },
    {
      "type": "rectangle",
      "id": "child2",
      "x": 150,
      "y": 50,
      "width": 100,
      "height": 60,
      "label": "Child 2"
    }
  ]
}
```

## Complete Example: Flowchart

```json
{
  "elements": [
    {
      "type": "rectangle",
      "id": "start",
      "x": 100,
      "y": 50,
      "width": 120,
      "height": 60,
      "label": "Start",
      "style": { "fill": "#b2f2bb", "stroke": "#2f9e44" }
    },
    {
      "type": "diamond",
      "id": "decision",
      "x": 100,
      "y": 150,
      "width": 120,
      "height": 80,
      "label": "Valid?",
      "style": { "fill": "#ffec99", "stroke": "#f59f00" }
    },
    {
      "type": "rectangle",
      "id": "process",
      "x": 280,
      "y": 165,
      "width": 120,
      "height": 60,
      "label": "Process",
      "style": { "fill": "#a5d8ff", "stroke": "#1971c2" }
    },
    {
      "type": "rectangle",
      "id": "end",
      "x": 100,
      "y": 280,
      "width": 120,
      "height": 60,
      "label": "End",
      "style": { "fill": "#ffc9c9", "stroke": "#c92a2a" }
    },
    { "type": "arrow", "id": "a1", "start": "start", "end": "decision" },
    { "type": "arrow", "id": "a2", "start": "decision", "end": "process", "label": "Yes" },
    { "type": "arrow", "id": "a3", "start": "decision", "end": "end", "label": "No" },
    { "type": "arrow", "id": "a4", "start": "process", "end": "end" }
  ]
}
```

## Complete Example: Architecture Diagram

```json
{
  "elements": [
    {
      "type": "rectangle",
      "id": "frontend",
      "x": 50,
      "y": 50,
      "width": 200,
      "height": 150,
      "label": "Frontend",
      "style": { "fill": "#a5d8ff", "fillStyle": "solid" },
      "children": [
        {
          "type": "rectangle",
          "id": "react",
          "x": 25,
          "y": 50,
          "width": 150,
          "height": 40,
          "label": "React App"
        },
        {
          "type": "rectangle",
          "id": "nginx",
          "x": 25,
          "y": 100,
          "width": 150,
          "height": 40,
          "label": "Nginx",
          "style": { "fill": "#dee2e6" }
        }
      ]
    },
    {
      "type": "rectangle",
      "id": "backend",
      "x": 320,
      "y": 50,
      "width": 200,
      "height": 150,
      "label": "Backend",
      "style": { "fill": "#b2f2bb", "fillStyle": "solid" },
      "children": [
        {
          "type": "rectangle",
          "id": "api",
          "x": 25,
          "y": 50,
          "width": 150,
          "height": 40,
          "label": "API Server"
        },
        {
          "type": "rectangle",
          "id": "db",
          "x": 25,
          "y": 100,
          "width": 150,
          "height": 40,
          "label": "PostgreSQL",
          "style": { "fill": "#ffec99" }
        }
      ]
    },
    {
      "type": "arrow",
      "id": "conn",
      "start": "nginx",
      "end": "api",
      "label": "REST API"
    }
  ]
}
```

## Color Palette

### Background Colors (Fill)

| Color | Hex | Use For |
|-------|-----|---------|
| Blue | `#a5d8ff` | Primary containers |
| Green | `#b2f2bb` | Success states |
| Yellow | `#ffec99` | Warnings, notes |
| Red | `#ffc9c9` | Errors, alerts |
| Purple | `#d0bfff` | Special elements |
| Gray | `#dee2e6` | Neutral |
| Orange | `#ffd8a8` | Highlights |
| Cyan | `#99e9f2` | Info, data |

### Stroke Colors

| Color | Hex | Use For |
|-------|-----|---------|
| Black | `#1e1e1e` | Default |
| Blue | `#1971c2` | Primary |
| Green | `#2f9e44` | Success |
| Red | `#c92a2a` | Error |
| Gray | `#495057` | Secondary |

## Style Properties

```json
{
  "style": {
    "fill": "#a5d8ff",
    "stroke": "#1971c2",
    "strokeWidth": 2,
    "strokeStyle": "solid",
    "fillStyle": "hachure",
    "roughness": 1,
    "opacity": 100
  }
}
```

| Property | Values | Default |
|----------|--------|---------|
| `fill` | Hex color | `"transparent"` |
| `stroke` | Hex color | `"#1e1e1e"` |
| `strokeWidth` | 1-4 | `2` |
| `strokeStyle` | `"solid"`, `"dashed"`, `"dotted"` | `"solid"` |
| `fillStyle` | `"solid"`, `"hachure"`, `"cross-hatch"` | `"hachure"` |
| `roughness` | 0-2 (0=smooth, 2=rough) | `1` |
| `opacity` | 0-100 | `100` |

## Arrow Options

```json
{
  "type": "arrow",
  "start": "elementId1",
  "end": "elementId2",
  "label": "optional label",
  "startArrowhead": null,
  "endArrowhead": "arrow",
  "startSide": "auto",
  "endSide": "auto"
}
```

| Arrowhead | Description |
|-----------|-------------|
| `null` | No arrowhead |
| `"arrow"` | Triangle arrow |
| `"dot"` | Filled circle |
| `"bar"` | Vertical bar |

| Side | Description |
|------|-------------|
| `"auto"` | Auto-detect best side |
| `"top"` | Connect at top edge |
| `"bottom"` | Connect at bottom edge |
| `"left"` | Connect at left edge |
| `"right"` | Connect at right edge |

## Config File (aidraw.config.json)

```json
{
  "background": "#ffffff",
  "padding": 20
}
```

## Best Practices

1. **Use consistent spacing** - Place elements at multiples of 20 for alignment
2. **Limit colors** - Use 3-4 colors per diagram for clarity
3. **Keep text concise** - Short labels fit better in shapes
4. **Use arrows for flow** - Show direction and relationships
5. **Group related elements** - Use containers or nested children
6. **Give IDs to elements** - Required for arrow connections
7. **Use logical coordinates** - The diagram auto-scales to fit the output size

## Coordinate System

- Coordinates are in logical units (unitless)
- The diagram auto-scales and centers to fit the output image
- Child coordinates are relative to parent's top-left corner
- (0, 0) is the top-left; x increases right, y increases down
