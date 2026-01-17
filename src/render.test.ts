import { describe, it, expect } from 'vitest'
import { render } from './renderer.js'
import type { DiagramInput } from './types.js'

// PNG file signature (magic bytes)
const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])

function isPngBuffer(buffer: Buffer): boolean {
  if (buffer.length < 8) return false
  return buffer.subarray(0, 8).equals(PNG_SIGNATURE)
}

describe('render', () => {
  describe('basic rendering', () => {
    it('renders an empty diagram', () => {
      const diagram: DiagramInput = { elements: [] }
      const buffer = render(diagram, 800, 600)

      expect(buffer).toBeInstanceOf(Buffer)
      expect(isPngBuffer(buffer)).toBe(true)
      expect(buffer.length).toBeGreaterThan(0)
    })

    it('renders a diagram with specified dimensions', () => {
      const diagram: DiagramInput = { elements: [] }
      const buffer = render(diagram, 1920, 1080)

      expect(buffer).toBeInstanceOf(Buffer)
      expect(isPngBuffer(buffer)).toBe(true)
    })

    it('renders with custom background color', () => {
      const diagram: DiagramInput = { elements: [] }
      const buffer = render(diagram, 800, 600, { background: '#f0f0f0' })

      expect(buffer).toBeInstanceOf(Buffer)
      expect(isPngBuffer(buffer)).toBe(true)
    })

    it('renders with custom padding', () => {
      const diagram: DiagramInput = { elements: [] }
      const buffer = render(diagram, 800, 600, { padding: 50 })

      expect(buffer).toBeInstanceOf(Buffer)
      expect(isPngBuffer(buffer)).toBe(true)
    })
  })

  describe('shape rendering', () => {
    it('renders a rectangle', () => {
      const diagram: DiagramInput = {
        elements: [{ type: 'rectangle', id: 'rect1', x: 0, y: 0, width: 100, height: 60 }],
      }
      const buffer = render(diagram, 800, 600)

      expect(buffer).toBeInstanceOf(Buffer)
      expect(isPngBuffer(buffer)).toBe(true)
    })

    it('renders a rectangle with label', () => {
      const diagram: DiagramInput = {
        elements: [{ type: 'rectangle', id: 'rect1', x: 0, y: 0, width: 100, height: 60, label: 'Test Box' }],
      }
      const buffer = render(diagram, 800, 600)

      expect(buffer).toBeInstanceOf(Buffer)
      expect(isPngBuffer(buffer)).toBe(true)
    })

    it('renders a rectangle with corner radius', () => {
      const diagram: DiagramInput = {
        elements: [{ type: 'rectangle', id: 'rect1', x: 0, y: 0, width: 100, height: 60, cornerRadius: 10 }],
      }
      const buffer = render(diagram, 800, 600)

      expect(buffer).toBeInstanceOf(Buffer)
      expect(isPngBuffer(buffer)).toBe(true)
    })

    it('renders a rectangle with rotation', () => {
      const diagram: DiagramInput = {
        elements: [{ type: 'rectangle', id: 'rect1', x: 0, y: 0, width: 100, height: 60, rotation: 45 }],
      }
      const buffer = render(diagram, 800, 600)

      expect(buffer).toBeInstanceOf(Buffer)
      expect(isPngBuffer(buffer)).toBe(true)
    })

    it('renders an ellipse', () => {
      const diagram: DiagramInput = {
        elements: [{ type: 'ellipse', id: 'ellipse1', x: 0, y: 0, width: 100, height: 80 }],
      }
      const buffer = render(diagram, 800, 600)

      expect(buffer).toBeInstanceOf(Buffer)
      expect(isPngBuffer(buffer)).toBe(true)
    })

    it('renders a diamond', () => {
      const diagram: DiagramInput = {
        elements: [{ type: 'diamond', id: 'diamond1', x: 0, y: 0, width: 80, height: 80 }],
      }
      const buffer = render(diagram, 800, 600)

      expect(buffer).toBeInstanceOf(Buffer)
      expect(isPngBuffer(buffer)).toBe(true)
    })

    it('renders a container with children', () => {
      const diagram: DiagramInput = {
        elements: [
          {
            type: 'container',
            id: 'container1',
            x: 0,
            y: 0,
            width: 200,
            height: 150,
            children: [{ type: 'rectangle', id: 'child1', x: 10, y: 10, width: 50, height: 30 }],
          },
        ],
      }
      const buffer = render(diagram, 800, 600)

      expect(buffer).toBeInstanceOf(Buffer)
      expect(isPngBuffer(buffer)).toBe(true)
    })

    it('renders shapes with custom styles', () => {
      const diagram: DiagramInput = {
        elements: [
          {
            type: 'rectangle',
            id: 'styled',
            x: 0,
            y: 0,
            width: 100,
            height: 60,
            style: {
              fill: '#3498db',
              stroke: '#2980b9',
              strokeWidth: 3,
              fillStyle: 'solid',
              roughness: 0.5,
            },
          },
        ],
      }
      const buffer = render(diagram, 800, 600)

      expect(buffer).toBeInstanceOf(Buffer)
      expect(isPngBuffer(buffer)).toBe(true)
    })

    it('renders shapes with dashed stroke', () => {
      const diagram: DiagramInput = {
        elements: [
          {
            type: 'rectangle',
            id: 'dashed',
            x: 0,
            y: 0,
            width: 100,
            height: 60,
            style: { strokeStyle: 'dashed' },
          },
        ],
      }
      const buffer = render(diagram, 800, 600)

      expect(buffer).toBeInstanceOf(Buffer)
      expect(isPngBuffer(buffer)).toBe(true)
    })

    it('renders shapes with dotted stroke', () => {
      const diagram: DiagramInput = {
        elements: [
          {
            type: 'rectangle',
            id: 'dotted',
            x: 0,
            y: 0,
            width: 100,
            height: 60,
            style: { strokeStyle: 'dotted' },
          },
        ],
      }
      const buffer = render(diagram, 800, 600)

      expect(buffer).toBeInstanceOf(Buffer)
      expect(isPngBuffer(buffer)).toBe(true)
    })

    it('renders shapes with opacity', () => {
      const diagram: DiagramInput = {
        elements: [
          {
            type: 'rectangle',
            id: 'transparent',
            x: 0,
            y: 0,
            width: 100,
            height: 60,
            style: { opacity: 50, fill: '#ff0000' },
          },
        ],
      }
      const buffer = render(diagram, 800, 600)

      expect(buffer).toBeInstanceOf(Buffer)
      expect(isPngBuffer(buffer)).toBe(true)
    })
  })

  describe('text rendering', () => {
    it('renders a text element', () => {
      const diagram: DiagramInput = {
        elements: [{ type: 'text', text: 'Hello World', x: 0, y: 0 }],
      }
      const buffer = render(diagram, 800, 600)

      expect(buffer).toBeInstanceOf(Buffer)
      expect(isPngBuffer(buffer)).toBe(true)
    })

    it('renders text with custom font size', () => {
      const diagram: DiagramInput = {
        elements: [{ type: 'text', text: 'Big Text', x: 0, y: 0, fontSize: 32 }],
      }
      const buffer = render(diagram, 800, 600)

      expect(buffer).toBeInstanceOf(Buffer)
      expect(isPngBuffer(buffer)).toBe(true)
    })

    it('renders text with hand font family', () => {
      const diagram: DiagramInput = {
        elements: [{ type: 'text', text: 'Hand Written', x: 0, y: 0, fontFamily: 'hand' }],
      }
      const buffer = render(diagram, 800, 600)

      expect(buffer).toBeInstanceOf(Buffer)
      expect(isPngBuffer(buffer)).toBe(true)
    })

    it('renders text with normal font family', () => {
      const diagram: DiagramInput = {
        elements: [{ type: 'text', text: 'Normal Font', x: 0, y: 0, fontFamily: 'normal' }],
      }
      const buffer = render(diagram, 800, 600)

      expect(buffer).toBeInstanceOf(Buffer)
      expect(isPngBuffer(buffer)).toBe(true)
    })

    it('renders text with code font family', () => {
      const diagram: DiagramInput = {
        elements: [{ type: 'text', text: 'const x = 42;', x: 0, y: 0, fontFamily: 'code' }],
      }
      const buffer = render(diagram, 800, 600)

      expect(buffer).toBeInstanceOf(Buffer)
      expect(isPngBuffer(buffer)).toBe(true)
    })

    it('renders text with center alignment', () => {
      const diagram: DiagramInput = {
        elements: [{ type: 'text', text: 'Centered', x: 400, y: 300, textAlign: 'center' }],
      }
      const buffer = render(diagram, 800, 600)

      expect(buffer).toBeInstanceOf(Buffer)
      expect(isPngBuffer(buffer)).toBe(true)
    })

    it('renders text with rotation', () => {
      const diagram: DiagramInput = {
        elements: [{ type: 'text', text: 'Rotated', x: 100, y: 100, rotation: 45 }],
      }
      const buffer = render(diagram, 800, 600)

      expect(buffer).toBeInstanceOf(Buffer)
      expect(isPngBuffer(buffer)).toBe(true)
    })

    it('renders text with custom stroke color', () => {
      const diagram: DiagramInput = {
        elements: [{ type: 'text', text: 'Colored', x: 0, y: 0, style: { stroke: '#e74c3c' } }],
      }
      const buffer = render(diagram, 800, 600)

      expect(buffer).toBeInstanceOf(Buffer)
      expect(isPngBuffer(buffer)).toBe(true)
    })
  })

  describe('line rendering', () => {
    it('renders a simple line', () => {
      const diagram: DiagramInput = {
        elements: [
          {
            type: 'line',
            points: [
              [0, 0],
              [100, 100],
            ],
          },
        ],
      }
      const buffer = render(diagram, 800, 600)

      expect(buffer).toBeInstanceOf(Buffer)
      expect(isPngBuffer(buffer)).toBe(true)
    })

    it('renders a multi-point line', () => {
      const diagram: DiagramInput = {
        elements: [
          {
            type: 'line',
            points: [
              [0, 0],
              [50, 50],
              [100, 0],
              [150, 50],
            ],
          },
        ],
      }
      const buffer = render(diagram, 800, 600)

      expect(buffer).toBeInstanceOf(Buffer)
      expect(isPngBuffer(buffer)).toBe(true)
    })

    it('renders a line with offset', () => {
      const diagram: DiagramInput = {
        elements: [
          {
            type: 'line',
            x: 100,
            y: 100,
            points: [
              [0, 0],
              [100, 100],
            ],
          },
        ],
      }
      const buffer = render(diagram, 800, 600)

      expect(buffer).toBeInstanceOf(Buffer)
      expect(isPngBuffer(buffer)).toBe(true)
    })

    it('renders a line with custom style', () => {
      const diagram: DiagramInput = {
        elements: [
          {
            type: 'line',
            points: [
              [0, 0],
              [200, 0],
            ],
            style: { stroke: '#e74c3c', strokeWidth: 3, strokeStyle: 'dashed' },
          },
        ],
      }
      const buffer = render(diagram, 800, 600)

      expect(buffer).toBeInstanceOf(Buffer)
      expect(isPngBuffer(buffer)).toBe(true)
    })
  })

  describe('arrow rendering', () => {
    it('renders a simple arrow between two shapes', () => {
      const diagram: DiagramInput = {
        elements: [
          { type: 'rectangle', id: 'a', x: 0, y: 0, width: 100, height: 60 },
          { type: 'rectangle', id: 'b', x: 200, y: 0, width: 100, height: 60 },
          { type: 'arrow', start: 'a', end: 'b' },
        ],
      }
      const buffer = render(diagram, 800, 600)

      expect(buffer).toBeInstanceOf(Buffer)
      expect(isPngBuffer(buffer)).toBe(true)
    })

    it('renders an arrow with label', () => {
      const diagram: DiagramInput = {
        elements: [
          { type: 'rectangle', id: 'a', x: 0, y: 0, width: 100, height: 60 },
          { type: 'rectangle', id: 'b', x: 200, y: 0, width: 100, height: 60 },
          { type: 'arrow', start: 'a', end: 'b', label: 'connects to' },
        ],
      }
      const buffer = render(diagram, 800, 600)

      expect(buffer).toBeInstanceOf(Buffer)
      expect(isPngBuffer(buffer)).toBe(true)
    })

    it('renders an arrow with dot arrowhead', () => {
      const diagram: DiagramInput = {
        elements: [
          { type: 'rectangle', id: 'a', x: 0, y: 0, width: 100, height: 60 },
          { type: 'rectangle', id: 'b', x: 200, y: 0, width: 100, height: 60 },
          { type: 'arrow', start: 'a', end: 'b', startArrowhead: 'dot', endArrowhead: 'dot' },
        ],
      }
      const buffer = render(diagram, 800, 600)

      expect(buffer).toBeInstanceOf(Buffer)
      expect(isPngBuffer(buffer)).toBe(true)
    })

    it('renders an arrow with bar arrowhead', () => {
      const diagram: DiagramInput = {
        elements: [
          { type: 'rectangle', id: 'a', x: 0, y: 0, width: 100, height: 60 },
          { type: 'rectangle', id: 'b', x: 200, y: 0, width: 100, height: 60 },
          { type: 'arrow', start: 'a', end: 'b', startArrowhead: 'bar', endArrowhead: 'bar' },
        ],
      }
      const buffer = render(diagram, 800, 600)

      expect(buffer).toBeInstanceOf(Buffer)
      expect(isPngBuffer(buffer)).toBe(true)
    })

    it('renders an arrow with no arrowheads', () => {
      const diagram: DiagramInput = {
        elements: [
          { type: 'rectangle', id: 'a', x: 0, y: 0, width: 100, height: 60 },
          { type: 'rectangle', id: 'b', x: 200, y: 0, width: 100, height: 60 },
          { type: 'arrow', start: 'a', end: 'b', startArrowhead: null, endArrowhead: null },
        ],
      }
      const buffer = render(diagram, 800, 600)

      expect(buffer).toBeInstanceOf(Buffer)
      expect(isPngBuffer(buffer)).toBe(true)
    })

    it('renders an arrow with specified sides', () => {
      const diagram: DiagramInput = {
        elements: [
          { type: 'rectangle', id: 'a', x: 0, y: 0, width: 100, height: 60 },
          { type: 'rectangle', id: 'b', x: 0, y: 150, width: 100, height: 60 },
          { type: 'arrow', start: 'a', end: 'b', startSide: 'bottom', endSide: 'top' },
        ],
      }
      const buffer = render(diagram, 800, 600)

      expect(buffer).toBeInstanceOf(Buffer)
      expect(isPngBuffer(buffer)).toBe(true)
    })

    it('renders an arrow with custom style', () => {
      const diagram: DiagramInput = {
        elements: [
          { type: 'rectangle', id: 'a', x: 0, y: 0, width: 100, height: 60 },
          { type: 'rectangle', id: 'b', x: 200, y: 0, width: 100, height: 60 },
          { type: 'arrow', start: 'a', end: 'b', style: { stroke: '#e74c3c', strokeWidth: 2 } },
        ],
      }
      const buffer = render(diagram, 800, 600)

      expect(buffer).toBeInstanceOf(Buffer)
      expect(isPngBuffer(buffer)).toBe(true)
    })

    it('handles arrows rendered last (on top)', () => {
      const diagram: DiagramInput = {
        elements: [
          { type: 'arrow', start: 'a', end: 'b' },
          { type: 'rectangle', id: 'a', x: 0, y: 0, width: 100, height: 60 },
          { type: 'rectangle', id: 'b', x: 200, y: 0, width: 100, height: 60 },
        ],
      }
      const buffer = render(diagram, 800, 600)

      expect(buffer).toBeInstanceOf(Buffer)
      expect(isPngBuffer(buffer)).toBe(true)
    })
  })

  describe('complex diagrams', () => {
    it('renders a flowchart-style diagram', () => {
      const diagram: DiagramInput = {
        elements: [
          { type: 'rectangle', id: 'start', x: 0, y: 0, width: 100, height: 50, label: 'Start', cornerRadius: 10 },
          { type: 'diamond', id: 'decision', x: 0, y: 100, width: 120, height: 80, label: 'Yes?' },
          { type: 'rectangle', id: 'action', x: 0, y: 230, width: 100, height: 50, label: 'Do' },
          { type: 'rectangle', id: 'end', x: 0, y: 330, width: 100, height: 50, label: 'End', cornerRadius: 10 },
          { type: 'arrow', start: 'start', end: 'decision' },
          { type: 'arrow', start: 'decision', end: 'action', label: 'yes' },
          { type: 'arrow', start: 'action', end: 'end' },
        ],
      }
      const buffer = render(diagram, 800, 600)

      expect(buffer).toBeInstanceOf(Buffer)
      expect(isPngBuffer(buffer)).toBe(true)
    })

    it('renders a system architecture diagram', () => {
      const diagram: DiagramInput = {
        elements: [
          { type: 'rectangle', id: 'client', x: 0, y: 0, width: 120, height: 60, label: 'Client' },
          { type: 'rectangle', id: 'api', x: 200, y: 0, width: 120, height: 60, label: 'API' },
          { type: 'rectangle', id: 'db', x: 400, y: 0, width: 120, height: 60, label: 'Database' },
          { type: 'arrow', start: 'client', end: 'api', label: 'HTTP' },
          { type: 'arrow', start: 'api', end: 'db', label: 'SQL' },
        ],
      }
      const buffer = render(diagram, 1000, 400)

      expect(buffer).toBeInstanceOf(Buffer)
      expect(isPngBuffer(buffer)).toBe(true)
    })

    it('renders a diagram with nested containers', () => {
      const diagram: DiagramInput = {
        elements: [
          {
            type: 'container',
            id: 'outer',
            x: 0,
            y: 0,
            width: 300,
            height: 200,
            label: 'System',
            children: [
              { type: 'rectangle', id: 'service1', x: 20, y: 40, width: 100, height: 50, label: 'Service A' },
              { type: 'rectangle', id: 'service2', x: 180, y: 40, width: 100, height: 50, label: 'Service B' },
              { type: 'arrow', start: 'service1', end: 'service2' },
            ],
          },
        ],
      }
      const buffer = render(diagram, 800, 600)

      expect(buffer).toBeInstanceOf(Buffer)
      expect(isPngBuffer(buffer)).toBe(true)
    })

    it('renders diagram with all element types', () => {
      const diagram: DiagramInput = {
        elements: [
          { type: 'rectangle', id: 'rect', x: 0, y: 0, width: 100, height: 60 },
          { type: 'ellipse', id: 'ellipse', x: 150, y: 0, width: 80, height: 60 },
          { type: 'diamond', id: 'diamond', x: 280, y: 0, width: 70, height: 70 },
          { type: 'text', text: 'Label', x: 50, y: 80 },
          {
            type: 'line',
            x: 0,
            y: 120,
            points: [
              [0, 0],
              [350, 0],
            ],
          },
          { type: 'arrow', start: 'rect', end: 'ellipse' },
          { type: 'arrow', start: 'ellipse', end: 'diamond' },
        ],
      }
      const buffer = render(diagram, 800, 600)

      expect(buffer).toBeInstanceOf(Buffer)
      expect(isPngBuffer(buffer)).toBe(true)
    })
  })

  describe('edge cases', () => {
    it('handles very small dimensions', () => {
      const diagram: DiagramInput = {
        elements: [{ type: 'rectangle', x: 0, y: 0, width: 10, height: 10 }],
      }
      const buffer = render(diagram, 100, 100)

      expect(buffer).toBeInstanceOf(Buffer)
      expect(isPngBuffer(buffer)).toBe(true)
    })

    it('handles very large diagram scaled to fit', () => {
      const diagram: DiagramInput = {
        elements: [
          { type: 'rectangle', x: 0, y: 0, width: 1000, height: 1000 },
          { type: 'rectangle', x: 2000, y: 2000, width: 1000, height: 1000 },
        ],
      }
      const buffer = render(diagram, 400, 400)

      expect(buffer).toBeInstanceOf(Buffer)
      expect(isPngBuffer(buffer)).toBe(true)
    })

    it('handles negative coordinates', () => {
      const diagram: DiagramInput = {
        elements: [
          { type: 'rectangle', id: 'neg', x: -100, y: -100, width: 50, height: 50 },
          { type: 'rectangle', id: 'pos', x: 100, y: 100, width: 50, height: 50 },
        ],
      }
      const buffer = render(diagram, 800, 600)

      expect(buffer).toBeInstanceOf(Buffer)
      expect(isPngBuffer(buffer)).toBe(true)
    })

    it('handles zero-size elements gracefully', () => {
      const diagram: DiagramInput = {
        elements: [{ type: 'rectangle', x: 0, y: 0, width: 0, height: 0 }],
      }
      // Should not throw
      expect(() => render(diagram, 800, 600)).not.toThrow()
    })
  })
})
