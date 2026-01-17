# Product Requirements Document: AI Diagram CLI

## Overview

**AI Diagram CLI** is a command-line diagramming tool designed specifically for AI coding agents (like Claude Code). It accepts a JSON document containing diagram definitions and produces PNG image output. The tool provides Excalidraw-style hand-drawn aesthetics in a format optimized for programmatic generation.

## Problem Statement

AI coding agents need to create visual diagrams (architecture diagrams, flowcharts, sequence diagrams, wireframes, etc.) but lack appropriate tools. Existing diagramming tools are either:

1. **Interactive/GUI-based** (Excalidraw, Figma) - not usable by CLI-based AI agents
2. **Text-based DSLs** (Mermaid, PlantUML) - limited visual customization and aesthetics
3. **Programmatic libraries** (D3.js, Canvas APIs) - require runtime environments and complex setup

There's a gap for a **simple CLI tool** that:
- Accepts structured JSON input (easy for AI to generate)
- Produces high-quality PNG output (easy to share and view)
- Offers Excalidraw-like hand-drawn aesthetics
- Requires no interactive UI or browser

## Target Users

1. **Primary**: AI coding agents (Claude Code, GitHub Copilot, Cursor, etc.)
2. **Secondary**: Developers automating diagram generation in CI/CD pipelines
3. **Tertiary**: Power users who prefer JSON-based diagram specification

## Core Requirements

### 1. CLI Interface

```bash
# Basic usage
aidraw input.json -o output.png --width 1920 --height 1080

# With custom config
aidraw input.json -o output.png --width 800 --height 600 --config myconfig.json
```

**Required Options:**
- `-o, --output <file>` - Output PNG file path
- `--width <pixels>` - Output image width in pixels
- `--height <pixels>` - Output image height in pixels

**Optional:**
- `--config <file>` - Path to config JSON file (defaults to `aidraw.config.json` in current directory, then built-in defaults)

**Input Methods:**
- File path argument
- Stdin (piped JSON)

### 1.1 Config File

Rendering settings are stored in a separate config file (`aidraw.config.json`):

```json
{
  "background": "#ffffff",
  "padding": 20
}
```

**Config Properties:**

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `background` | string | "#ffffff" | Background color (hex or named) |
| `padding` | number | 20 | Padding around diagram in pixels |

**Note:** Unlike GUI tools, this CLI is designed for AI agents. There are minimal defaults - agents should explicitly specify styling (colors, stroke width, etc.) for each element.

### 1.2 Logical Units and Auto-Fit

Diagram coordinates use **logical units** (unitless values). The tool automatically scales and centers the diagram to fit the output image.

**Fitting Algorithm:**
1. Calculate the diagram's bounding box from all elements
2. Subtract padding from image dimensions (e.g., 1920 - 2×20 = 1880 available width)
3. Calculate scale factor: `min(availableWidth / diagramWidth, availableHeight / diagramHeight)`
4. Scale the entire scene uniformly
5. Center the scaled diagram in the image

**Example:**
- Output: 1920×1080 pixels, padding: 20px
- Diagram bounding box: 100×100 logical units
- Available space: 1880×1040 pixels
- Scale factor: min(1880/100, 1040/100) = min(18.8, 10.4) = 10.4
- Result: 1040×1040 pixel diagram, centered horizontally in 1920px width

### 2. JSON Input Schema

The input JSON uses a **hierarchical structure** where any shape can contain children. Child coordinates are always **relative to parent's top-left corner**.

```json
{
  "elements": [
    {
      "type": "rectangle",
      "id": "server",
      "x": 100,
      "y": 100,
      "width": 200,
      "height": 150,
      "label": "API Server",
      "style": {
        "fill": "#b2f2bb",
        "stroke": "#2f9e44",
        "strokeWidth": 2
      },
      "children": [
        {
          "type": "ellipse",
          "id": "db-icon",
          "x": 20,
          "y": 80,
          "width": 40,
          "height": 40,
          "label": "DB"
        },
        {
          "type": "ellipse",
          "id": "cache-icon",
          "x": 140,
          "y": 80,
          "width": 40,
          "height": 40,
          "label": "Cache"
        }
      ]
    },
    {
      "type": "rectangle",
      "id": "client",
      "x": 100,
      "y": 300,
      "width": 200,
      "height": 80,
      "label": "Client App"
    },
    {
      "type": "arrow",
      "id": "conn1",
      "start": "client",
      "end": "server",
      "label": "REST API"
    }
  ]
}
```

**Key Design Principles:**
- **Hierarchical**: Any 2D shape can have `children[]` - transforms cascade to children
- **Relative Coordinates**: Child x/y are relative to parent's top-left (0,0)
- **Anchored Arrows**: Arrows must connect to elements via `start`/`end` IDs (no free-floating arrows)

### 3. Supported Element Types

#### 3.1 Basic Shapes (Can Have Children)

All shapes support a `children[]` array for hierarchical composition.

| Type | Description | Key Properties |
|------|-------------|----------------|
| `rectangle` | Rectangular box | x, y, width, height, label, cornerRadius, children[] |
| `ellipse` | Circle or oval | x, y, width, height, label, children[] |
| `diamond` | Rhombus/decision shape | x, y, width, height, label, children[] |
| `container` | Invisible grouping element | x, y, width, height, children[] |
| `text` | Standalone text | x, y, text, fontSize, textAlign |

#### 3.2 Connectors

| Type | Description | Key Properties |
|------|-------------|----------------|
| `line` | Multi-point polyline | points[] (array of [x,y] coordinates) |
| `arrow` | Anchored connection | start (element ID), end (element ID), label, arrowheads |

**Note**: Arrows are always anchored - they must reference element IDs via `start` and `end`. The tool auto-calculates the optimal path between connected elements.

### 4. Element Properties Reference

#### 4.1 Common Properties (All Elements)

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `type` | string | required | Element type |
| `id` | string | auto | Unique identifier (required for arrow targets) |
| `x` | number | 0 | X position (relative to parent if nested) |
| `y` | number | 0 | Y position (relative to parent if nested) |
| `rotation` | number | 0 | Rotation in degrees (clockwise) |
| `children` | array | [] | Child elements (shapes only, not text/line/arrow) |

#### 4.2 Style Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `fill` | string | "transparent" | Fill color (hex or named) |
| `stroke` | string | "#1e1e1e" | Stroke color |
| `strokeWidth` | number | 2 | Stroke thickness (1-4) |
| `strokeStyle` | string | "solid" | "solid", "dashed", "dotted" |
| `fillStyle` | string | "hachure" | "solid", "hachure", "cross-hatch" |
| `roughness` | number | 1 | Hand-drawn effect (0=smooth, 2=rough) |
| `opacity` | number | 100 | Transparency (0-100) |

#### 4.3 Text Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `text` / `label` | string | "" | Text content |
| `fontSize` | number | 16 | Font size in pixels |
| `fontFamily` | string | "hand" | "hand", "normal", "code" |
| `textAlign` | string | "center" | "left", "center", "right" |
| `verticalAlign` | string | "middle" | "top", "middle", "bottom" |

#### 4.4 Line Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `points` | number[][] | required | Array of [x, y] coordinates (minimum 2 points) |

#### 4.5 Arrow Properties (Anchored Only)

Arrows automatically calculate their path between connected elements.

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `start` | string | required | ID of source element |
| `end` | string | required | ID of target element |
| `label` | string | "" | Text label on the arrow |
| `startArrowhead` | string | null | null, "arrow", "dot", "bar" |
| `endArrowhead` | string | "arrow" | null, "arrow", "dot", "bar" |

### 5. Color Palette

Provide a curated color palette (inspired by Open Colors) for consistency:

**Background Colors:**
| Name | Hex | Usage |
|------|-----|-------|
| `blue` | #a5d8ff | Primary containers |
| `green` | #b2f2bb | Success states |
| `yellow` | #ffec99 | Warnings/notes |
| `red` | #ffc9c9 | Errors/alerts |
| `purple` | #d0bfff | Special/unique |
| `gray` | #dee2e6 | Neutral |
| `orange` | #ffd8a8 | Highlights |
| `cyan` | #99e9f2 | Info/data |

**Stroke Colors:**
| Name | Hex | Usage |
|------|-----|-------|
| `black` | #1e1e1e | Default stroke |
| `blue` | #1971c2 | Primary |
| `green` | #2f9e44 | Success |
| `red` | #c92a2a | Error |
| `gray` | #495057 | Secondary |

### 6. Smart Features

#### 6.1 Arrow Auto-Routing
Since arrows are always anchored to elements:
- Automatically calculate optimal connection points on element edges
- Route around obstacles if needed (simple avoidance)
- Support for different connection sides (can be hinted via optional `startSide`/`endSide` properties: "top", "bottom", "left", "right", "auto")

#### 6.2 Auto-Sizing
- Text elements auto-size to content
- Shapes with labels auto-expand to fit label (unless explicit width/height provided)
- Container elements can auto-size to fit children (optional)

#### 6.3 Transform Inheritance
- Moving/rotating/scaling a parent transforms all children
- Children maintain relative positions within parent coordinate space
- Useful for creating reusable compound components

### 7. Error Handling

The CLI should provide clear, actionable error messages:

```bash
# Missing required field
Error: Element at index 0 missing required field 'type'

# Invalid element reference
Error: Arrow 'arrow1' references unknown element 'box3'

# Invalid color
Warning: Unknown color 'blu' for element 'box1', using default

# Schema validation
Error: Invalid JSON at line 15: Expected number for 'width', got string
```

### 8. SKILL.md File

The project includes a `SKILL.md` file to help AI agents use the tool effectively:

```markdown
# AI Diagram CLI Skill

## When to Use
Use this tool when the user asks to create:
- Architecture diagrams
- Flowcharts
- Sequence diagrams
- Mind maps
- Wireframes
- ER diagrams
- Any visual diagram

## Quick Start
1. Create a JSON file with diagram elements
2. Run: `aidraw diagram.json -o output.png`
3. Present the output.png to the user

## Element Templates
[Include copy-paste ready templates for common patterns]

## Best Practices
- Use consistent spacing (multiples of 20)
- Limit colors to 3-4 per diagram
- Keep text concise
- Use arrows to show flow direction
```

## Non-Requirements (Out of Scope for V1)

1. **Interactive editing** - This is a render-only tool
2. **SVG output** - PNG only for V1 (SVG can be added later)
3. **Animation** - Static images only
4. **Collaboration** - Single-user, local execution
5. **Image embedding** - No external image support in V1
6. **Custom fonts** - Limited font options for V1
7. **Undo/version history** - No state management needed

## Technical Considerations

### Rendering Approach
- Use **rough.js** for hand-drawn aesthetic (same as Excalidraw)
- Use **Node.js canvas** (node-canvas or skia-canvas) for PNG generation
- Consider **headless browser** approach if needed for complex rendering

### Technology Stack (Recommendations)
- **Language**: TypeScript (for type safety in JSON schema)
- **Runtime**: Node.js (widely available, good canvas support)
- **Libraries**:
  - `rough` - Hand-drawn rendering
  - `canvas` or `@napi-rs/canvas` - PNG generation
  - `commander` or `yargs` - CLI parsing
  - `ajv` - JSON schema validation

### Performance Targets
- Generate simple diagram (<20 elements): < 500ms
- Generate complex diagram (100+ elements): < 3s
- Memory usage: < 512MB for typical diagrams

## Success Metrics

1. **Usability**: AI agents can generate valid diagrams on first attempt 90%+ of the time
2. **Quality**: Output visually matches Excalidraw aesthetic
3. **Performance**: Meets performance targets above
4. **Error clarity**: Users/agents can fix errors without additional help 80%+ of the time

## Competitive Analysis

| Tool | Strengths | Weaknesses for AI |
|------|-----------|-------------------|
| Excalidraw | Beautiful output, rich features | GUI-only, needs browser |
| Mermaid | Text-based, easy syntax | Limited styling, specific diagrams only |
| PlantUML | Comprehensive diagram types | Complex syntax, Java dependency |
| D3.js | Highly customizable | Complex API, needs runtime |
| **AI Diagram CLI** | JSON input, CLI-native, hand-drawn | New tool, limited features initially |

## Appendix A: Example Diagrams

### A.1 Simple Flowchart

```json
{
  "elements": [
    { "type": "rectangle", "id": "start", "x": 100, "y": 50, "width": 120, "height": 60, "label": "Start", "style": { "fill": "#b2f2bb" } },
    { "type": "diamond", "id": "decision", "x": 100, "y": 150, "width": 120, "height": 80, "label": "Valid?" },
    { "type": "rectangle", "id": "process", "x": 260, "y": 165, "width": 120, "height": 60, "label": "Process" },
    { "type": "rectangle", "id": "end", "x": 100, "y": 280, "width": 120, "height": 60, "label": "End", "style": { "fill": "#ffc9c9" } },
    { "type": "arrow", "id": "a1", "start": "start", "end": "decision" },
    { "type": "arrow", "id": "a2", "start": "decision", "end": "process", "label": "Yes" },
    { "type": "arrow", "id": "a3", "start": "decision", "end": "end", "label": "No" }
  ]
}
```

### A.2 Architecture Diagram (Using Hierarchical Children)

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
        { "type": "rectangle", "id": "react", "x": 25, "y": 50, "width": 150, "height": 40, "label": "React App" },
        { "type": "rectangle", "id": "nginx", "x": 25, "y": 100, "width": 150, "height": 40, "label": "Nginx", "style": { "fill": "#dee2e6" } }
      ]
    },
    {
      "type": "rectangle",
      "id": "backend",
      "x": 300,
      "y": 50,
      "width": 200,
      "height": 150,
      "label": "Backend",
      "style": { "fill": "#b2f2bb", "fillStyle": "solid" },
      "children": [
        { "type": "rectangle", "id": "api", "x": 25, "y": 50, "width": 150, "height": 40, "label": "API Server" },
        { "type": "rectangle", "id": "db", "x": 25, "y": 100, "width": 150, "height": 40, "label": "PostgreSQL", "style": { "fill": "#ffec99" } }
      ]
    },
    { "type": "arrow", "id": "conn", "start": "nginx", "end": "api", "label": "REST" }
  ]
}
```

### A.3 Using Container for Invisible Grouping

```json
{
  "elements": [
    {
      "type": "container",
      "id": "service-group",
      "x": 100,
      "y": 100,
      "children": [
        { "type": "rectangle", "id": "svc1", "x": 0, "y": 0, "width": 100, "height": 60, "label": "Service 1" },
        { "type": "rectangle", "id": "svc2", "x": 120, "y": 0, "width": 100, "height": 60, "label": "Service 2" },
        { "type": "rectangle", "id": "svc3", "x": 240, "y": 0, "width": 100, "height": 60, "label": "Service 3" }
      ]
    }
  ]
}
```

## Appendix B: JSON Schema (Draft)

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["elements"],
  "properties": {
    "elements": {
      "type": "array",
      "items": { "$ref": "#/definitions/element" }
    }
  },
  "definitions": {
    "element": {
      "oneOf": [
        { "$ref": "#/definitions/shape" },
        { "$ref": "#/definitions/text" },
        { "$ref": "#/definitions/line" },
        { "$ref": "#/definitions/arrow" }
      ]
    },
    "shape": {
      "type": "object",
      "required": ["type"],
      "properties": {
        "type": { "enum": ["rectangle", "ellipse", "diamond", "container"] },
        "id": { "type": "string" },
        "x": { "type": "number" },
        "y": { "type": "number" },
        "width": { "type": "number" },
        "height": { "type": "number" },
        "rotation": { "type": "number" },
        "label": { "type": "string" },
        "style": { "$ref": "#/definitions/style" },
        "children": {
          "type": "array",
          "items": { "$ref": "#/definitions/element" }
        }
      }
    },
    "text": {
      "type": "object",
      "required": ["type", "text"],
      "properties": {
        "type": { "const": "text" },
        "id": { "type": "string" },
        "x": { "type": "number" },
        "y": { "type": "number" },
        "text": { "type": "string" },
        "fontSize": { "type": "number" },
        "fontFamily": { "enum": ["hand", "normal", "code"] },
        "textAlign": { "enum": ["left", "center", "right"] }
      }
    },
    "line": {
      "type": "object",
      "required": ["type", "points"],
      "properties": {
        "type": { "const": "line" },
        "id": { "type": "string" },
        "points": {
          "type": "array",
          "items": {
            "type": "array",
            "items": { "type": "number" },
            "minItems": 2,
            "maxItems": 2
          },
          "minItems": 2
        },
        "style": { "$ref": "#/definitions/style" }
      }
    },
    "arrow": {
      "type": "object",
      "required": ["type", "start", "end"],
      "properties": {
        "type": { "const": "arrow" },
        "id": { "type": "string" },
        "start": { "type": "string", "description": "ID of source element" },
        "end": { "type": "string", "description": "ID of target element" },
        "label": { "type": "string" },
        "startArrowhead": { "enum": [null, "arrow", "dot", "bar"] },
        "endArrowhead": { "enum": [null, "arrow", "dot", "bar"] },
        "style": { "$ref": "#/definitions/style" }
      }
    },
    "style": {
      "type": "object",
      "properties": {
        "fill": { "type": "string" },
        "stroke": { "type": "string" },
        "strokeWidth": { "type": "number", "minimum": 1, "maximum": 4 },
        "strokeStyle": { "enum": ["solid", "dashed", "dotted"] },
        "fillStyle": { "enum": ["solid", "hachure", "cross-hatch"] },
        "roughness": { "type": "number", "minimum": 0, "maximum": 2 },
        "opacity": { "type": "number", "minimum": 0, "maximum": 100 }
      }
    }
  }
}
```

## Appendix C: Config File Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "background": {
      "type": "string",
      "default": "#ffffff",
      "description": "Background color (hex or named)"
    },
    "padding": {
      "type": "number",
      "minimum": 0,
      "default": 20,
      "description": "Padding around diagram in pixels"
    }
  }
}
```

## References

- [Excalidraw](https://excalidraw.com/) - Visual inspiration
- [Excalidraw JSON Schema](https://docs.excalidraw.com/docs/codebase/json-schema) - Format reference
- [Excalidraw Element Types](https://deepwiki.com/excalidraw/excalidraw/3.1-element-binding-and-geometry) - Element system
- [Open Colors](https://yeun.github.io/open-color/) - Color palette
- [rough.js](https://roughjs.com/) - Hand-drawn rendering library
