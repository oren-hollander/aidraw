# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**aidraw** is a CLI tool that generates hand-drawn style PNG diagrams from JSON input. It's designed for AI coding agents to create visual diagrams programmatically without a GUI. The tool uses rough.js for Excalidraw-style aesthetics and @napi-rs/canvas for PNG generation.

## Commands

```bash
# Build TypeScript to dist/
npm run build

# Run in development mode (tsx)
npm run dev

# Run compiled version
npm start

# Example usage
npx tsx src/index.ts diagram.json -o output.png --width 1920 --height 1080
```

## Architecture

The codebase is a small TypeScript CLI with four main modules:

- **src/index.ts** - CLI entry point using Commander. Handles argument parsing, stdin support, config file loading, and orchestrates validation/rendering.

- **src/schema.ts** - JSON Schema definitions for diagram and config validation using Ajv. Defines the complete schema for elements (shapes, text, lines, arrows) and their properties.

- **src/renderer.ts** - Core rendering logic. Builds an element map with absolute coordinates, calculates bounding boxes for auto-scaling, and renders each element type using rough.js. Arrows are rendered last (on top).

- **src/types.ts** - TypeScript interfaces for all element types (ShapeElement, TextElement, LineElement, ArrowElement), styles, config, and internal structures like ResolvedElement and ElementMap.

### Key Concepts

- **Logical Units**: Diagram coordinates are unitless; the renderer auto-scales and centers to fit the output dimensions.
- **Hierarchical Elements**: Shapes can have `children[]` with coordinates relative to parent's top-left.
- **Anchored Arrows**: Arrows connect via element IDs (`start`/`end`), with automatic edge connection point calculation.
- **Element Map**: Internal structure (Map<string, ResolvedElement>) that stores absolute coordinates for all elements with IDs, enabling arrow routing.

## Documentation

- **PRD.md** - Product requirements with full JSON schema documentation, element types, style properties, and example diagrams.
- **SKILL.md** - Usage guide for AI agents with element templates, color palette, and best practices.
