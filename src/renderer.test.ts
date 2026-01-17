import { describe, it, expect } from 'vitest'
import {
  buildElementMap,
  calculateBoundingBox,
  getConnectionPoint,
  styleToRoughOptions,
  DEFAULT_STYLE,
} from './renderer.js'
import type { Element, ResolvedElement } from './types.js'

describe('buildElementMap', () => {
  it('returns an empty map for empty elements', () => {
    const map = buildElementMap([])
    expect(map.size).toBe(0)
  })

  it('ignores elements without id', () => {
    const elements: Element[] = [{ type: 'rectangle', x: 0, y: 0, width: 100, height: 60 }]
    const map = buildElementMap(elements)
    expect(map.size).toBe(0)
  })

  it('adds elements with id to the map', () => {
    const elements: Element[] = [{ type: 'rectangle', id: 'rect1', x: 10, y: 20, width: 100, height: 60 }]
    const map = buildElementMap(elements)
    expect(map.size).toBe(1)
    expect(map.has('rect1')).toBe(true)
  })

  it('stores absolute coordinates correctly', () => {
    const elements: Element[] = [{ type: 'rectangle', id: 'rect1', x: 10, y: 20, width: 100, height: 60 }]
    const map = buildElementMap(elements)
    const resolved = map.get('rect1')!
    expect(resolved.absoluteX).toBe(10)
    expect(resolved.absoluteY).toBe(20)
    expect(resolved.absoluteWidth).toBe(100)
    expect(resolved.absoluteHeight).toBe(60)
  })

  it('handles elements without x/y coordinates', () => {
    const elements: Element[] = [{ type: 'rectangle', id: 'rect1', width: 100, height: 60 }]
    const map = buildElementMap(elements)
    const resolved = map.get('rect1')!
    expect(resolved.absoluteX).toBe(0)
    expect(resolved.absoluteY).toBe(0)
  })

  it('uses default dimensions for shapes without width/height', () => {
    const elements: Element[] = [{ type: 'rectangle', id: 'rect1', x: 0, y: 0 }]
    const map = buildElementMap(elements)
    const resolved = map.get('rect1')!
    expect(resolved.absoluteWidth).toBe(100)
    expect(resolved.absoluteHeight).toBe(60)
  })

  it('processes children with relative coordinates', () => {
    const elements: Element[] = [
      {
        type: 'container',
        id: 'parent',
        x: 100,
        y: 50,
        width: 200,
        height: 150,
        children: [{ type: 'rectangle', id: 'child', x: 10, y: 20, width: 50, height: 30 }],
      },
    ]
    const map = buildElementMap(elements)
    expect(map.size).toBe(2)

    const parent = map.get('parent')!
    expect(parent.absoluteX).toBe(100)
    expect(parent.absoluteY).toBe(50)

    const child = map.get('child')!
    expect(child.absoluteX).toBe(110) // 100 + 10
    expect(child.absoluteY).toBe(70) // 50 + 20
  })

  it('handles nested children recursively', () => {
    const elements: Element[] = [
      {
        type: 'container',
        id: 'outer',
        x: 50,
        y: 50,
        width: 300,
        height: 200,
        children: [
          {
            type: 'container',
            id: 'inner',
            x: 20,
            y: 30,
            width: 150,
            height: 100,
            children: [{ type: 'rectangle', id: 'deep', x: 10, y: 10, width: 50, height: 30 }],
          },
        ],
      },
    ]
    const map = buildElementMap(elements)
    expect(map.size).toBe(3)

    const deep = map.get('deep')!
    expect(deep.absoluteX).toBe(80) // 50 + 20 + 10
    expect(deep.absoluteY).toBe(90) // 50 + 30 + 10
  })

  it('handles parent offset parameters', () => {
    const elements: Element[] = [{ type: 'rectangle', id: 'rect1', x: 10, y: 20, width: 100, height: 60 }]
    const map = buildElementMap(elements, 100, 200)
    const resolved = map.get('rect1')!
    expect(resolved.absoluteX).toBe(110) // 100 + 10
    expect(resolved.absoluteY).toBe(220) // 200 + 20
  })

  it('handles text elements', () => {
    const elements: Element[] = [{ type: 'text', id: 'text1', text: 'Hello', x: 10, y: 20 }]
    const map = buildElementMap(elements)
    const resolved = map.get('text1')!
    expect(resolved.absoluteX).toBe(10)
    expect(resolved.absoluteY).toBe(20)
    expect(resolved.absoluteWidth).toBe(100)
    expect(resolved.absoluteHeight).toBe(20)
  })

  it('handles multiple elements', () => {
    const elements: Element[] = [
      { type: 'rectangle', id: 'rect1', x: 0, y: 0, width: 100, height: 60 },
      { type: 'ellipse', id: 'ellipse1', x: 150, y: 0, width: 80, height: 80 },
      { type: 'diamond', id: 'diamond1', x: 300, y: 0, width: 60, height: 60 },
    ]
    const map = buildElementMap(elements)
    expect(map.size).toBe(3)
    expect(map.has('rect1')).toBe(true)
    expect(map.has('ellipse1')).toBe(true)
    expect(map.has('diamond1')).toBe(true)
  })
})

describe('calculateBoundingBox', () => {
  it('returns default box for empty elements', () => {
    const bbox = calculateBoundingBox([], new Map())
    expect(bbox.minX).toBe(0)
    expect(bbox.minY).toBe(0)
    expect(bbox.maxX).toBe(100)
    expect(bbox.maxY).toBe(100)
    expect(bbox.width).toBe(100)
    expect(bbox.height).toBe(100)
  })

  it('calculates bounding box for a single rectangle', () => {
    const elements: Element[] = [{ type: 'rectangle', id: 'rect1', x: 10, y: 20, width: 100, height: 60 }]
    const map = buildElementMap(elements)
    const bbox = calculateBoundingBox(elements, map)
    expect(bbox.minX).toBe(10)
    expect(bbox.minY).toBe(20)
    expect(bbox.maxX).toBe(110)
    expect(bbox.maxY).toBe(80)
    expect(bbox.width).toBe(100)
    expect(bbox.height).toBe(60)
  })

  it('calculates bounding box for multiple shapes', () => {
    const elements: Element[] = [
      { type: 'rectangle', x: 0, y: 0, width: 100, height: 60 },
      { type: 'rectangle', x: 200, y: 100, width: 100, height: 60 },
    ]
    const map = buildElementMap(elements)
    const bbox = calculateBoundingBox(elements, map)
    expect(bbox.minX).toBe(0)
    expect(bbox.minY).toBe(0)
    expect(bbox.maxX).toBe(300)
    expect(bbox.maxY).toBe(160)
    expect(bbox.width).toBe(300)
    expect(bbox.height).toBe(160)
  })

  it('calculates bounding box for line elements', () => {
    const elements: Element[] = [
      {
        type: 'line',
        x: 10,
        y: 20,
        points: [
          [0, 0],
          [100, 50],
          [200, 0],
        ],
      },
    ]
    const map = buildElementMap(elements)
    const bbox = calculateBoundingBox(elements, map)
    expect(bbox.minX).toBe(10) // 10 + 0
    expect(bbox.minY).toBe(20) // 20 + 0
    expect(bbox.maxX).toBe(210) // 10 + 200
    expect(bbox.maxY).toBe(70) // 20 + 50
  })

  it('calculates bounding box for text elements', () => {
    const elements: Element[] = [{ type: 'text', text: 'Hello World', x: 50, y: 30, fontSize: 20 }]
    const map = buildElementMap(elements)
    const bbox = calculateBoundingBox(elements, map)
    expect(bbox.minX).toBe(50)
    expect(bbox.minY).toBe(30)
    // Text width is approximated: 11 chars * 20 * 0.6 = 132
    expect(bbox.maxX).toBe(50 + 11 * 20 * 0.6)
    // Text height is approximated: 20 * 1.2 = 24
    expect(bbox.maxY).toBe(30 + 20 * 1.2)
  })

  it('calculates bounding box including children', () => {
    const elements: Element[] = [
      {
        type: 'container',
        id: 'parent',
        x: 0,
        y: 0,
        width: 100,
        height: 80,
        children: [{ type: 'rectangle', id: 'child', x: 150, y: 100, width: 50, height: 30 }],
      },
    ]
    const map = buildElementMap(elements)
    const bbox = calculateBoundingBox(elements, map)
    expect(bbox.minX).toBe(0)
    expect(bbox.minY).toBe(0)
    expect(bbox.maxX).toBe(200) // 0 + 150 + 50
    expect(bbox.maxY).toBe(130) // 0 + 100 + 30
  })

  it('calculates bounding box for arrows using element positions', () => {
    const elements: Element[] = [
      { type: 'rectangle', id: 'a', x: 0, y: 0, width: 100, height: 60 },
      { type: 'rectangle', id: 'b', x: 300, y: 200, width: 100, height: 60 },
      { type: 'arrow', start: 'a', end: 'b' },
    ]
    const map = buildElementMap(elements)
    const bbox = calculateBoundingBox(elements, map)
    expect(bbox.minX).toBe(0)
    expect(bbox.minY).toBe(0)
    expect(bbox.maxX).toBe(400)
    expect(bbox.maxY).toBe(260)
  })

  it('handles parentX and parentY offset', () => {
    const elements: Element[] = [{ type: 'rectangle', x: 10, y: 20, width: 100, height: 60 }]
    const map = buildElementMap(elements)
    const bbox = calculateBoundingBox(elements, map, 50, 30)
    expect(bbox.minX).toBe(60) // 50 + 10
    expect(bbox.minY).toBe(50) // 30 + 20
  })
})

describe('getConnectionPoint', () => {
  const createResolved = (x: number, y: number, w: number, h: number): ResolvedElement => ({
    element: { type: 'rectangle', id: 'test', x, y, width: w, height: h },
    absoluteX: x,
    absoluteY: y,
    absoluteWidth: w,
    absoluteHeight: h,
  })

  it('returns top center point for top side', () => {
    const resolved = createResolved(100, 100, 200, 100)
    const point = getConnectionPoint(resolved, 'top')
    expect(point.x).toBe(200) // 100 + 200/2
    expect(point.y).toBe(100)
  })

  it('returns bottom center point for bottom side', () => {
    const resolved = createResolved(100, 100, 200, 100)
    const point = getConnectionPoint(resolved, 'bottom')
    expect(point.x).toBe(200) // 100 + 200/2
    expect(point.y).toBe(200) // 100 + 100
  })

  it('returns left center point for left side', () => {
    const resolved = createResolved(100, 100, 200, 100)
    const point = getConnectionPoint(resolved, 'left')
    expect(point.x).toBe(100)
    expect(point.y).toBe(150) // 100 + 100/2
  })

  it('returns right center point for right side', () => {
    const resolved = createResolved(100, 100, 200, 100)
    const point = getConnectionPoint(resolved, 'right')
    expect(point.x).toBe(300) // 100 + 200
    expect(point.y).toBe(150) // 100 + 100/2
  })

  it('returns center point for auto without target', () => {
    const resolved = createResolved(100, 100, 200, 100)
    const point = getConnectionPoint(resolved, 'auto')
    expect(point.x).toBe(200) // center x
    expect(point.y).toBe(150) // center y
  })

  it('returns right point for auto when target is to the right', () => {
    const resolved = createResolved(100, 100, 200, 100)
    const point = getConnectionPoint(resolved, 'auto', 500, 150)
    expect(point.x).toBe(300) // right side: 100 + 200
    expect(point.y).toBe(150)
  })

  it('returns left point for auto when target is to the left', () => {
    const resolved = createResolved(100, 100, 200, 100)
    const point = getConnectionPoint(resolved, 'auto', 0, 150)
    expect(point.x).toBe(100) // left side
    expect(point.y).toBe(150)
  })

  it('returns bottom point for auto when target is below', () => {
    const resolved = createResolved(100, 100, 200, 100)
    const point = getConnectionPoint(resolved, 'auto', 200, 300)
    expect(point.x).toBe(200)
    expect(point.y).toBe(200) // bottom: 100 + 100
  })

  it('returns top point for auto when target is above', () => {
    const resolved = createResolved(100, 100, 200, 100)
    const point = getConnectionPoint(resolved, 'auto', 200, 0)
    expect(point.x).toBe(200)
    expect(point.y).toBe(100) // top
  })

  it('prefers horizontal connection when dx > dy', () => {
    const resolved = createResolved(0, 0, 100, 100)
    // Target is more to the right than below
    const point = getConnectionPoint(resolved, 'auto', 200, 60)
    expect(point.x).toBe(100) // right side
    expect(point.y).toBe(50) // center y
  })

  it('prefers vertical connection when dy > dx', () => {
    const resolved = createResolved(0, 0, 100, 100)
    // Target is more below than to the right
    const point = getConnectionPoint(resolved, 'auto', 60, 200)
    expect(point.x).toBe(50) // center x
    expect(point.y).toBe(100) // bottom
  })
})

describe('styleToRoughOptions', () => {
  it('returns default options when no style provided', () => {
    const options = styleToRoughOptions()
    expect(options.fill).toBeUndefined()
    expect(options.stroke).toBe(DEFAULT_STYLE.stroke)
    expect(options.strokeWidth).toBe(DEFAULT_STYLE.strokeWidth)
    expect(options.roughness).toBe(DEFAULT_STYLE.roughness)
    expect(options.fillStyle).toBe('hachure')
  })

  it('handles custom fill color', () => {
    const options = styleToRoughOptions({ fill: '#ff0000' })
    expect(options.fill).toBe('#ff0000')
  })

  it('handles transparent fill', () => {
    const options = styleToRoughOptions({ fill: 'transparent' })
    expect(options.fill).toBeUndefined()
  })

  it('handles custom stroke color', () => {
    const options = styleToRoughOptions({ stroke: '#0000ff' })
    expect(options.stroke).toBe('#0000ff')
  })

  it('handles custom strokeWidth', () => {
    const options = styleToRoughOptions({ strokeWidth: 4 })
    expect(options.strokeWidth).toBe(4)
  })

  it('handles custom roughness', () => {
    const options = styleToRoughOptions({ roughness: 0 })
    expect(options.roughness).toBe(0)
  })

  it('handles solid fillStyle', () => {
    const options = styleToRoughOptions({ fillStyle: 'solid' })
    expect(options.fillStyle).toBe('solid')
  })

  it('handles cross-hatch fillStyle', () => {
    const options = styleToRoughOptions({ fillStyle: 'cross-hatch' })
    expect(options.fillStyle).toBe('cross-hatch')
  })

  it('handles hachure fillStyle', () => {
    const options = styleToRoughOptions({ fillStyle: 'hachure' })
    expect(options.fillStyle).toBe('hachure')
  })

  it('handles dashed strokeStyle', () => {
    const options = styleToRoughOptions({ strokeStyle: 'dashed' })
    expect(options.strokeLineDash).toEqual([8, 8])
  })

  it('handles dotted strokeStyle', () => {
    const options = styleToRoughOptions({ strokeStyle: 'dotted' })
    expect(options.strokeLineDash).toEqual([2, 4])
  })

  it('handles solid strokeStyle (no dash)', () => {
    const options = styleToRoughOptions({ strokeStyle: 'solid' })
    expect(options.strokeLineDash).toBeUndefined()
  })

  it('merges multiple style options', () => {
    const options = styleToRoughOptions({
      fill: '#ff0000',
      stroke: '#0000ff',
      strokeWidth: 3,
      roughness: 2,
      fillStyle: 'solid',
      strokeStyle: 'dashed',
    })
    expect(options.fill).toBe('#ff0000')
    expect(options.stroke).toBe('#0000ff')
    expect(options.strokeWidth).toBe(3)
    expect(options.roughness).toBe(2)
    expect(options.fillStyle).toBe('solid')
    expect(options.strokeLineDash).toEqual([8, 8])
  })
})
