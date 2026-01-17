// Style properties for elements
export interface Style {
  fill?: string
  stroke?: string
  strokeWidth?: number
  strokeStyle?: 'solid' | 'dashed' | 'dotted'
  fillStyle?: 'solid' | 'hachure' | 'cross-hatch'
  roughness?: number
  opacity?: number
}

// Text styling properties
export interface TextStyle {
  fontSize?: number
  fontFamily?: 'hand' | 'normal' | 'code'
  textAlign?: 'left' | 'center' | 'right'
  verticalAlign?: 'top' | 'middle' | 'bottom'
}

// Base element interface
export interface BaseElement {
  type: string
  id?: string
  x?: number
  y?: number
  rotation?: number
}

// Shape elements (rectangle, ellipse, diamond, container)
export interface ShapeElement extends BaseElement {
  type: 'rectangle' | 'ellipse' | 'diamond' | 'container'
  width?: number
  height?: number
  label?: string
  style?: Style
  cornerRadius?: number
  children?: Element[]
}

// Text element
export interface TextElement extends BaseElement {
  type: 'text'
  text: string
  fontSize?: number
  fontFamily?: 'hand' | 'normal' | 'code'
  textAlign?: 'left' | 'center' | 'right'
  style?: Style
}

// Line element (multi-point polyline)
export interface LineElement extends BaseElement {
  type: 'line'
  points: [number, number][]
  style?: Style
}

// Arrow element (anchored connections)
export interface ArrowElement extends BaseElement {
  type: 'arrow'
  start: string
  end: string
  label?: string
  startArrowhead?: null | 'arrow' | 'dot' | 'bar'
  endArrowhead?: null | 'arrow' | 'dot' | 'bar'
  startSide?: 'top' | 'bottom' | 'left' | 'right' | 'auto'
  endSide?: 'top' | 'bottom' | 'left' | 'right' | 'auto'
  style?: Style
}

// Union type for all elements
export type Element = ShapeElement | TextElement | LineElement | ArrowElement

// Diagram input schema
export interface DiagramInput {
  elements: Element[]
}

// Config file schema
export interface Config {
  background?: string
  padding?: number
}

// Resolved element with absolute coordinates
export interface ResolvedElement {
  element: Element
  absoluteX: number
  absoluteY: number
  absoluteWidth: number
  absoluteHeight: number
}

// Bounding box
export interface BoundingBox {
  minX: number
  minY: number
  maxX: number
  maxY: number
  width: number
  height: number
}

// Element map for ID lookups
export type ElementMap = Map<string, ResolvedElement>
