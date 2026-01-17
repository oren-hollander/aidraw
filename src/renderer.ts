import { createCanvas, SKRSContext2D } from '@napi-rs/canvas'
import roughModule from 'roughjs'
import type { RoughCanvas } from 'roughjs/bin/canvas.js'
import type { Options as RoughOptions } from 'roughjs/bin/core.js'
import {
  Element,
  ShapeElement,
  TextElement,
  LineElement,
  ArrowElement,
  DiagramInput,
  Config,
  BoundingBox,
  ResolvedElement,
  ElementMap,
  Style,
} from './types.js'

const rough = roughModule.default || roughModule

// Default configuration
export const DEFAULT_CONFIG: Required<Config> = {
  background: '#ffffff',
  padding: 20,
}

// Default style values
export const DEFAULT_STYLE: Required<Style> = {
  fill: 'transparent',
  stroke: '#1e1e1e',
  strokeWidth: 2,
  strokeStyle: 'solid',
  fillStyle: 'hachure',
  roughness: 1,
  opacity: 100,
}

// Font families mapping
const FONT_FAMILIES = {
  hand: 'Virgil, Segoe UI Emoji, sans-serif',
  normal: 'Arial, Helvetica, sans-serif',
  code: 'Courier New, monospace',
}

// Build element map with absolute coordinates
export function buildElementMap(elements: Element[], parentX = 0, parentY = 0): ElementMap {
  const map: ElementMap = new Map()

  for (const element of elements) {
    const absoluteX = parentX + (element.x ?? 0)
    const absoluteY = parentY + (element.y ?? 0)

    let width = 0
    let height = 0

    if (element.type !== 'arrow' && element.type !== 'line' && element.type !== 'text') {
      const shape = element as ShapeElement
      width = shape.width ?? 100
      height = shape.height ?? 60
    } else if (element.type === 'text') {
      // Text dimensions will be calculated during rendering
      width = 100
      height = 20
    }

    if (element.id) {
      map.set(element.id, {
        element,
        absoluteX,
        absoluteY,
        absoluteWidth: width,
        absoluteHeight: height,
      })
    }

    // Process children for shapes
    if (element.type !== 'arrow' && element.type !== 'line' && element.type !== 'text') {
      const shape = element as ShapeElement
      if (shape.children) {
        const childMap = buildElementMap(shape.children, absoluteX, absoluteY)
        childMap.forEach((value, key) => map.set(key, value))
      }
    }
  }

  return map
}

// Calculate bounding box for all elements
export function calculateBoundingBox(elements: Element[], elementMap: ElementMap, parentX = 0, parentY = 0): BoundingBox {
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity

  function processElement(el: Element, px: number, py: number) {
    const x = px + (el.x ?? 0)
    const y = py + (el.y ?? 0)

    if (el.type === 'line') {
      const line = el as LineElement
      for (const [pointX, pointY] of line.points) {
        minX = Math.min(minX, x + pointX)
        minY = Math.min(minY, y + pointY)
        maxX = Math.max(maxX, x + pointX)
        maxY = Math.max(maxY, y + pointY)
      }
    } else if (el.type === 'arrow') {
      const arrow = el as ArrowElement
      const startEl = elementMap.get(arrow.start)
      const endEl = elementMap.get(arrow.end)
      if (startEl) {
        minX = Math.min(minX, startEl.absoluteX)
        minY = Math.min(minY, startEl.absoluteY)
        maxX = Math.max(maxX, startEl.absoluteX + startEl.absoluteWidth)
        maxY = Math.max(maxY, startEl.absoluteY + startEl.absoluteHeight)
      }
      if (endEl) {
        minX = Math.min(minX, endEl.absoluteX)
        minY = Math.min(minY, endEl.absoluteY)
        maxX = Math.max(maxX, endEl.absoluteX + endEl.absoluteWidth)
        maxY = Math.max(maxY, endEl.absoluteY + endEl.absoluteHeight)
      }
    } else if (el.type === 'text') {
      const text = el as TextElement
      // Approximate text bounds
      const fontSize = text.fontSize ?? 16
      const textWidth = text.text.length * fontSize * 0.6
      const textHeight = fontSize * 1.2
      minX = Math.min(minX, x)
      minY = Math.min(minY, y)
      maxX = Math.max(maxX, x + textWidth)
      maxY = Math.max(maxY, y + textHeight)
    } else {
      const shape = el as ShapeElement
      const width = shape.width ?? 100
      const height = shape.height ?? 60
      minX = Math.min(minX, x)
      minY = Math.min(minY, y)
      maxX = Math.max(maxX, x + width)
      maxY = Math.max(maxY, y + height)

      // Process children
      if (shape.children) {
        for (const child of shape.children) {
          processElement(child, x, y)
        }
      }
    }
  }

  for (const element of elements) {
    processElement(element, parentX, parentY)
  }

  // Handle empty diagrams
  if (minX === Infinity) {
    minX = minY = 0
    maxX = maxY = 100
  }

  return {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX,
    height: maxY - minY,
  }
}

// Convert style to rough.js options
export function styleToRoughOptions(style?: Style): RoughOptions {
  const s = { ...DEFAULT_STYLE, ...style }

  const options: RoughOptions = {
    fill: s.fill === 'transparent' ? undefined : s.fill,
    stroke: s.stroke,
    strokeWidth: s.strokeWidth,
    roughness: s.roughness,
  }

  // Fill style
  if (s.fillStyle === 'solid') {
    options.fillStyle = 'solid'
  } else if (s.fillStyle === 'cross-hatch') {
    options.fillStyle = 'cross-hatch'
  } else {
    options.fillStyle = 'hachure'
  }

  // Stroke style
  if (s.strokeStyle === 'dashed') {
    options.strokeLineDash = [8, 8]
  } else if (s.strokeStyle === 'dotted') {
    options.strokeLineDash = [2, 4]
  }

  return options
}

// Draw arrowhead
function drawArrowhead(
  ctx: SKRSContext2D,
  rc: RoughCanvas,
  x: number,
  y: number,
  angle: number,
  type: string | null,
  style?: Style,
) {
  if (!type) return

  const s = { ...DEFAULT_STYLE, ...style }
  const size = 10

  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(angle)

  if (type === 'arrow') {
    rc.line(-size, -size / 2, 0, 0, styleToRoughOptions(style))
    rc.line(-size, size / 2, 0, 0, styleToRoughOptions(style))
  } else if (type === 'dot') {
    rc.circle(0, 0, size, { ...styleToRoughOptions(style), fill: s.stroke })
  } else if (type === 'bar') {
    rc.line(0, -size / 2, 0, size / 2, styleToRoughOptions(style))
  }

  ctx.restore()
}

// Calculate connection point on element edge
export function getConnectionPoint(
  resolved: ResolvedElement,
  side: 'top' | 'bottom' | 'left' | 'right' | 'auto',
  targetX?: number,
  targetY?: number,
): { x: number; y: number } {
  const { absoluteX: x, absoluteY: y, absoluteWidth: w, absoluteHeight: h } = resolved
  const centerX = x + w / 2
  const centerY = y + h / 2

  if (side === 'top') return { x: centerX, y }
  if (side === 'bottom') return { x: centerX, y: y + h }
  if (side === 'left') return { x, y: centerY }
  if (side === 'right') return { x: x + w, y: centerY }

  // Auto: determine best side based on target position
  if (targetX !== undefined && targetY !== undefined) {
    const dx = targetX - centerX
    const dy = targetY - centerY

    if (Math.abs(dx) > Math.abs(dy)) {
      return dx > 0 ? { x: x + w, y: centerY } : { x, y: centerY }
    } else {
      return dy > 0 ? { x: centerX, y: y + h } : { x: centerX, y }
    }
  }

  return { x: centerX, y: centerY }
}

// Render a shape element
function renderShape(
  ctx: SKRSContext2D,
  rc: RoughCanvas,
  shape: ShapeElement,
  offsetX: number,
  offsetY: number,
  scale: number,
  elementMap: ElementMap,
) {
  const x = (offsetX + (shape.x ?? 0)) * scale
  const y = (offsetY + (shape.y ?? 0)) * scale
  const width = (shape.width ?? 100) * scale
  const height = (shape.height ?? 60) * scale
  const options = styleToRoughOptions(shape.style)

  // Apply opacity
  const opacity = (shape.style?.opacity ?? 100) / 100
  ctx.globalAlpha = opacity

  // Apply rotation if needed
  if (shape.rotation) {
    ctx.save()
    ctx.translate(x + width / 2, y + height / 2)
    ctx.rotate((shape.rotation * Math.PI) / 180)
    ctx.translate(-(x + width / 2), -(y + height / 2))
  }

  // Draw shape based on type
  if (shape.type === 'rectangle') {
    const cornerRadius = (shape.cornerRadius ?? 0) * scale
    if (cornerRadius > 0) {
      // Draw rounded rectangle manually
      const path = `M ${x + cornerRadius} ${y}
        L ${x + width - cornerRadius} ${y}
        Q ${x + width} ${y} ${x + width} ${y + cornerRadius}
        L ${x + width} ${y + height - cornerRadius}
        Q ${x + width} ${y + height} ${x + width - cornerRadius} ${y + height}
        L ${x + cornerRadius} ${y + height}
        Q ${x} ${y + height} ${x} ${y + height - cornerRadius}
        L ${x} ${y + cornerRadius}
        Q ${x} ${y} ${x + cornerRadius} ${y}
        Z`
      rc.path(path, options)
    } else {
      rc.rectangle(x, y, width, height, options)
    }
  } else if (shape.type === 'ellipse') {
    rc.ellipse(x + width / 2, y + height / 2, width, height, options)
  } else if (shape.type === 'diamond') {
    const points: [number, number][] = [
      [x + width / 2, y],
      [x + width, y + height / 2],
      [x + width / 2, y + height],
      [x, y + height / 2],
    ]
    rc.polygon(points, options)
  }
  // Container type doesn't render anything visible

  // Draw label if present
  if (shape.label && shape.type !== 'container') {
    const fontSize = 16 * scale
    ctx.font = `${fontSize}px ${FONT_FAMILIES.hand}`
    ctx.fillStyle = shape.style?.stroke ?? DEFAULT_STYLE.stroke
    ctx.textAlign = 'center'

    // If shape has children, draw label at top; otherwise center it
    if (shape.children && shape.children.length > 0) {
      ctx.textBaseline = 'top'
      ctx.fillText(shape.label, x + width / 2, y + 8 * scale)
    } else {
      ctx.textBaseline = 'middle'
      ctx.fillText(shape.label, x + width / 2, y + height / 2)
    }
  }

  if (shape.rotation) {
    ctx.restore()
  }

  // Reset opacity
  ctx.globalAlpha = 1

  // Render children
  if (shape.children) {
    const childOffsetX = offsetX + (shape.x ?? 0)
    const childOffsetY = offsetY + (shape.y ?? 0)
    for (const child of shape.children) {
      renderElement(ctx, rc, child, childOffsetX, childOffsetY, scale, elementMap)
    }
  }
}

// Render a text element
function renderText(ctx: SKRSContext2D, text: TextElement, offsetX: number, offsetY: number, scale: number) {
  const x = (offsetX + (text.x ?? 0)) * scale
  const y = (offsetY + (text.y ?? 0)) * scale
  const fontSize = (text.fontSize ?? 16) * scale
  const fontFamily = FONT_FAMILIES[text.fontFamily ?? 'hand']

  const opacity = (text.style?.opacity ?? 100) / 100
  ctx.globalAlpha = opacity

  ctx.font = `${fontSize}px ${fontFamily}`
  ctx.fillStyle = text.style?.stroke ?? DEFAULT_STYLE.stroke
  ctx.textAlign = text.textAlign ?? 'left'
  ctx.textBaseline = 'top'

  // Handle rotation
  if (text.rotation) {
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate((text.rotation * Math.PI) / 180)
    ctx.fillText(text.text, 0, 0)
    ctx.restore()
  } else {
    ctx.fillText(text.text, x, y)
  }

  ctx.globalAlpha = 1
}

// Render a line element
function renderLine(
  ctx: SKRSContext2D,
  rc: RoughCanvas,
  line: LineElement,
  offsetX: number,
  offsetY: number,
  scale: number,
) {
  const baseX = (offsetX + (line.x ?? 0)) * scale
  const baseY = (offsetY + (line.y ?? 0)) * scale

  const scaledPoints: [number, number][] = line.points.map(([px, py]) => [baseX + px * scale, baseY + py * scale])

  const opacity = (line.style?.opacity ?? 100) / 100
  ctx.globalAlpha = opacity

  const options = styleToRoughOptions(line.style)
  rc.linearPath(scaledPoints, options)

  ctx.globalAlpha = 1
}

// Render an arrow element
function renderArrow(ctx: SKRSContext2D, rc: RoughCanvas, arrow: ArrowElement, scale: number, elementMap: ElementMap) {
  const startEl = elementMap.get(arrow.start)
  const endEl = elementMap.get(arrow.end)

  if (!startEl) {
    console.warn(`Arrow '${arrow.id ?? 'unnamed'}' references unknown start element '${arrow.start}'`)
    return
  }
  if (!endEl) {
    console.warn(`Arrow '${arrow.id ?? 'unnamed'}' references unknown end element '${arrow.end}'`)
    return
  }

  // Get connection points
  const endCenter = {
    x: endEl.absoluteX + endEl.absoluteWidth / 2,
    y: endEl.absoluteY + endEl.absoluteHeight / 2,
  }
  const startCenter = {
    x: startEl.absoluteX + startEl.absoluteWidth / 2,
    y: startEl.absoluteY + startEl.absoluteHeight / 2,
  }

  const startPoint = getConnectionPoint(startEl, arrow.startSide ?? 'auto', endCenter.x, endCenter.y)
  const endPoint = getConnectionPoint(endEl, arrow.endSide ?? 'auto', startCenter.x, startCenter.y)

  // Scale points
  const sx = startPoint.x * scale
  const sy = startPoint.y * scale
  const ex = endPoint.x * scale
  const ey = endPoint.y * scale

  const opacity = (arrow.style?.opacity ?? 100) / 100
  ctx.globalAlpha = opacity

  // Draw line
  const options = styleToRoughOptions(arrow.style)
  rc.line(sx, sy, ex, ey, options)

  // Draw arrowheads
  const angle = Math.atan2(ey - sy, ex - sx)
  drawArrowhead(ctx, rc, sx, sy, angle + Math.PI, arrow.startArrowhead ?? null, arrow.style)
  drawArrowhead(ctx, rc, ex, ey, angle, arrow.endArrowhead ?? 'arrow', arrow.style)

  // Draw label if present
  if (arrow.label) {
    const midX = (sx + ex) / 2
    const midY = (sy + ey) / 2
    const fontSize = 14 * scale
    ctx.font = `${fontSize}px ${FONT_FAMILIES.hand}`
    ctx.fillStyle = arrow.style?.stroke ?? DEFAULT_STYLE.stroke
    ctx.textAlign = 'center'
    ctx.textBaseline = 'bottom'

    // Offset label slightly above the line
    const offset = 5 * scale
    const perpAngle = angle - Math.PI / 2
    ctx.fillText(arrow.label, midX + Math.cos(perpAngle) * offset, midY + Math.sin(perpAngle) * offset)
  }

  ctx.globalAlpha = 1
}

// Render a single element
function renderElement(
  ctx: SKRSContext2D,
  rc: RoughCanvas,
  element: Element,
  offsetX: number,
  offsetY: number,
  scale: number,
  elementMap: ElementMap,
) {
  switch (element.type) {
    case 'rectangle':
    case 'ellipse':
    case 'diamond':
    case 'container':
      renderShape(ctx, rc, element as ShapeElement, offsetX, offsetY, scale, elementMap)
      break
    case 'text':
      renderText(ctx, element as TextElement, offsetX, offsetY, scale)
      break
    case 'line':
      renderLine(ctx, rc, element as LineElement, offsetX, offsetY, scale)
      break
    case 'arrow':
      renderArrow(ctx, rc, element as ArrowElement, scale, elementMap)
      break
  }
}

// Main render function
export function render(diagram: DiagramInput, width: number, height: number, config?: Config): Buffer {
  const cfg = { ...DEFAULT_CONFIG, ...config }

  // Create canvas
  const canvas = createCanvas(width, height)
  const ctx = canvas.getContext('2d')

  // Fill background
  ctx.fillStyle = cfg.background
  ctx.fillRect(0, 0, width, height)

  // Build element map
  const elementMap = buildElementMap(diagram.elements)

  // Calculate bounding box
  const bbox = calculateBoundingBox(diagram.elements, elementMap)

  // Calculate scaling and offset
  const availableWidth = width - 2 * cfg.padding
  const availableHeight = height - 2 * cfg.padding

  const scaleX = availableWidth / bbox.width
  const scaleY = availableHeight / bbox.height
  const scale = Math.min(scaleX, scaleY)

  // Calculate offset to center the diagram
  const scaledWidth = bbox.width * scale
  const scaledHeight = bbox.height * scale
  const offsetX = (width - scaledWidth) / 2 / scale - bbox.minX
  const offsetY = (height - scaledHeight) / 2 / scale - bbox.minY

  // Create rough canvas
  const rc = rough.canvas(canvas as unknown as HTMLCanvasElement)

  // Render all elements (arrows last)
  const arrows: ArrowElement[] = []

  function collectAndRender(elements: Element[], parentOffsetX: number, parentOffsetY: number) {
    for (const element of elements) {
      if (element.type === 'arrow') {
        arrows.push(element as ArrowElement)
      } else {
        renderElement(ctx, rc, element, offsetX + parentOffsetX, offsetY + parentOffsetY, scale, elementMap)
      }
    }
  }

  collectAndRender(diagram.elements, 0, 0)

  // Render arrows last (on top)
  for (const arrow of arrows) {
    renderArrow(ctx, rc, arrow, scale, elementMap)
  }

  return canvas.toBuffer('image/png')
}
