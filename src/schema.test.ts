import { describe, it, expect } from 'vitest'
import { validateDiagram, validateConfig, formatValidationErrors } from './schema.js'

describe('validateDiagram', () => {
  describe('valid diagrams', () => {
    it('accepts an empty diagram', () => {
      const diagram = { elements: [] }
      expect(validateDiagram(diagram)).toBe(true)
    })

    it('accepts a diagram with a rectangle', () => {
      const diagram = {
        elements: [{ type: 'rectangle', id: 'rect1', x: 0, y: 0, width: 100, height: 60 }],
      }
      expect(validateDiagram(diagram)).toBe(true)
    })

    it('accepts a diagram with an ellipse', () => {
      const diagram = {
        elements: [{ type: 'ellipse', id: 'ellipse1', x: 10, y: 20, width: 80, height: 40 }],
      }
      expect(validateDiagram(diagram)).toBe(true)
    })

    it('accepts a diagram with a diamond', () => {
      const diagram = {
        elements: [{ type: 'diamond', id: 'diamond1', x: 0, y: 0, width: 60, height: 60 }],
      }
      expect(validateDiagram(diagram)).toBe(true)
    })

    it('accepts a diagram with a container', () => {
      const diagram = {
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
      expect(validateDiagram(diagram)).toBe(true)
    })

    it('accepts a diagram with a text element', () => {
      const diagram = {
        elements: [{ type: 'text', text: 'Hello World', x: 0, y: 0 }],
      }
      expect(validateDiagram(diagram)).toBe(true)
    })

    it('accepts a diagram with text styling options', () => {
      const diagram = {
        elements: [
          {
            type: 'text',
            text: 'Styled Text',
            x: 0,
            y: 0,
            fontSize: 24,
            fontFamily: 'code',
            textAlign: 'center',
          },
        ],
      }
      expect(validateDiagram(diagram)).toBe(true)
    })

    it('accepts a diagram with a line element', () => {
      const diagram = {
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
      expect(validateDiagram(diagram)).toBe(true)
    })

    it('accepts a diagram with a multi-point line', () => {
      const diagram = {
        elements: [
          {
            type: 'line',
            points: [
              [0, 0],
              [50, 25],
              [100, 0],
              [150, 25],
            ],
          },
        ],
      }
      expect(validateDiagram(diagram)).toBe(true)
    })

    it('accepts a diagram with an arrow', () => {
      const diagram = {
        elements: [
          { type: 'rectangle', id: 'a', x: 0, y: 0, width: 100, height: 60 },
          { type: 'rectangle', id: 'b', x: 200, y: 0, width: 100, height: 60 },
          { type: 'arrow', start: 'a', end: 'b' },
        ],
      }
      expect(validateDiagram(diagram)).toBe(true)
    })

    it('accepts an arrow with all options', () => {
      const diagram = {
        elements: [
          { type: 'rectangle', id: 'a', x: 0, y: 0, width: 100, height: 60 },
          { type: 'rectangle', id: 'b', x: 200, y: 0, width: 100, height: 60 },
          {
            type: 'arrow',
            id: 'arrow1',
            start: 'a',
            end: 'b',
            label: 'connects',
            startArrowhead: 'dot',
            endArrowhead: 'arrow',
            startSide: 'right',
            endSide: 'left',
          },
        ],
      }
      expect(validateDiagram(diagram)).toBe(true)
    })

    it('accepts a shape with style options', () => {
      const diagram = {
        elements: [
          {
            type: 'rectangle',
            id: 'styled',
            x: 0,
            y: 0,
            width: 100,
            height: 60,
            style: {
              fill: '#ff0000',
              stroke: '#000000',
              strokeWidth: 2,
              strokeStyle: 'dashed',
              fillStyle: 'hachure',
              roughness: 1,
              opacity: 80,
            },
          },
        ],
      }
      expect(validateDiagram(diagram)).toBe(true)
    })

    it('accepts a shape with rotation', () => {
      const diagram = {
        elements: [{ type: 'rectangle', id: 'rotated', x: 0, y: 0, width: 100, height: 60, rotation: 45 }],
      }
      expect(validateDiagram(diagram)).toBe(true)
    })

    it('accepts a rectangle with cornerRadius', () => {
      const diagram = {
        elements: [{ type: 'rectangle', id: 'rounded', x: 0, y: 0, width: 100, height: 60, cornerRadius: 10 }],
      }
      expect(validateDiagram(diagram)).toBe(true)
    })

    it('accepts a shape with label', () => {
      const diagram = {
        elements: [{ type: 'rectangle', id: 'labeled', x: 0, y: 0, width: 100, height: 60, label: 'My Box' }],
      }
      expect(validateDiagram(diagram)).toBe(true)
    })
  })

  describe('invalid diagrams', () => {
    it('rejects a diagram without elements property', () => {
      const diagram = {}
      expect(validateDiagram(diagram)).toBe(false)
    })

    it('rejects an element with invalid type', () => {
      const diagram = {
        elements: [{ type: 'invalid', x: 0, y: 0 }],
      }
      expect(validateDiagram(diagram)).toBe(false)
    })

    it('rejects a text element without text property', () => {
      const diagram = {
        elements: [{ type: 'text', x: 0, y: 0 }],
      }
      expect(validateDiagram(diagram)).toBe(false)
    })

    it('rejects a line without points', () => {
      const diagram = {
        elements: [{ type: 'line', x: 0, y: 0 }],
      }
      expect(validateDiagram(diagram)).toBe(false)
    })

    it('rejects a line with only one point', () => {
      const diagram = {
        elements: [{ type: 'line', points: [[0, 0]] }],
      }
      expect(validateDiagram(diagram)).toBe(false)
    })

    it('rejects an arrow without start property', () => {
      const diagram = {
        elements: [{ type: 'arrow', end: 'b' }],
      }
      expect(validateDiagram(diagram)).toBe(false)
    })

    it('rejects an arrow without end property', () => {
      const diagram = {
        elements: [{ type: 'arrow', start: 'a' }],
      }
      expect(validateDiagram(diagram)).toBe(false)
    })

    it('rejects invalid strokeWidth', () => {
      const diagram = {
        elements: [
          {
            type: 'rectangle',
            x: 0,
            y: 0,
            style: { strokeWidth: 10 },
          },
        ],
      }
      expect(validateDiagram(diagram)).toBe(false)
    })

    it('rejects invalid roughness', () => {
      const diagram = {
        elements: [
          {
            type: 'rectangle',
            x: 0,
            y: 0,
            style: { roughness: 5 },
          },
        ],
      }
      expect(validateDiagram(diagram)).toBe(false)
    })

    it('rejects invalid opacity', () => {
      const diagram = {
        elements: [
          {
            type: 'rectangle',
            x: 0,
            y: 0,
            style: { opacity: 150 },
          },
        ],
      }
      expect(validateDiagram(diagram)).toBe(false)
    })

    it('rejects invalid fontFamily', () => {
      const diagram = {
        elements: [{ type: 'text', text: 'hello', fontFamily: 'invalid' }],
      }
      expect(validateDiagram(diagram)).toBe(false)
    })

    it('rejects invalid strokeStyle', () => {
      const diagram = {
        elements: [
          {
            type: 'rectangle',
            x: 0,
            y: 0,
            style: { strokeStyle: 'wavy' },
          },
        ],
      }
      expect(validateDiagram(diagram)).toBe(false)
    })

    it('rejects invalid fillStyle', () => {
      const diagram = {
        elements: [
          {
            type: 'rectangle',
            x: 0,
            y: 0,
            style: { fillStyle: 'gradient' },
          },
        ],
      }
      expect(validateDiagram(diagram)).toBe(false)
    })

    it('rejects invalid arrowhead type', () => {
      const diagram = {
        elements: [{ type: 'arrow', start: 'a', end: 'b', endArrowhead: 'triangle' }],
      }
      expect(validateDiagram(diagram)).toBe(false)
    })

    it('rejects additional properties on elements', () => {
      const diagram = {
        elements: [{ type: 'rectangle', x: 0, y: 0, unknownProp: 'value' }],
      }
      expect(validateDiagram(diagram)).toBe(false)
    })
  })

  describe('edge cases', () => {
    it('accepts null arrowheads', () => {
      const diagram = {
        elements: [
          { type: 'rectangle', id: 'a', x: 0, y: 0 },
          { type: 'rectangle', id: 'b', x: 100, y: 0 },
          { type: 'arrow', start: 'a', end: 'b', startArrowhead: null, endArrowhead: null },
        ],
      }
      expect(validateDiagram(diagram)).toBe(true)
    })

    it('accepts deeply nested children', () => {
      const diagram = {
        elements: [
          {
            type: 'container',
            id: 'outer',
            x: 0,
            y: 0,
            width: 300,
            height: 200,
            children: [
              {
                type: 'container',
                id: 'inner',
                x: 10,
                y: 10,
                width: 150,
                height: 100,
                children: [{ type: 'rectangle', id: 'deep', x: 5, y: 5, width: 50, height: 30 }],
              },
            ],
          },
        ],
      }
      expect(validateDiagram(diagram)).toBe(true)
    })

    it('accepts elements without optional x/y coordinates', () => {
      const diagram = {
        elements: [{ type: 'rectangle', id: 'no-coords', width: 100, height: 60 }],
      }
      expect(validateDiagram(diagram)).toBe(true)
    })
  })
})

describe('validateConfig', () => {
  describe('valid configs', () => {
    it('accepts an empty config', () => {
      const config = {}
      expect(validateConfig(config)).toBe(true)
    })

    it('accepts a config with background color', () => {
      const config = { background: '#f0f0f0' }
      expect(validateConfig(config)).toBe(true)
    })

    it('accepts a config with padding', () => {
      const config = { padding: 40 }
      expect(validateConfig(config)).toBe(true)
    })

    it('accepts a config with all options', () => {
      const config = { background: '#ffffff', padding: 20 }
      expect(validateConfig(config)).toBe(true)
    })

    it('accepts zero padding', () => {
      const config = { padding: 0 }
      expect(validateConfig(config)).toBe(true)
    })
  })

  describe('invalid configs', () => {
    it('rejects negative padding', () => {
      const config = { padding: -10 }
      expect(validateConfig(config)).toBe(false)
    })

    it('rejects additional properties', () => {
      const config = { unknownOption: 'value' }
      expect(validateConfig(config)).toBe(false)
    })

    it('rejects non-string background', () => {
      const config = { background: 123 }
      expect(validateConfig(config)).toBe(false)
    })

    it('rejects non-number padding', () => {
      const config = { padding: '20' }
      expect(validateConfig(config)).toBe(false)
    })
  })
})

describe('formatValidationErrors', () => {
  it('returns unknown error message for null errors', () => {
    expect(formatValidationErrors(null)).toBe('Unknown validation error')
  })

  it('returns unknown error message for undefined errors', () => {
    expect(formatValidationErrors(undefined)).toBe('Unknown validation error')
  })

  it('formats a single error', () => {
    const errors = [{ instancePath: '/elements/0/type', message: 'must be equal to one of the allowed values' }]
    const result = formatValidationErrors(errors as any)
    expect(result).toContain('/elements/0/type')
    expect(result).toContain('must be equal to one of the allowed values')
  })

  it('formats multiple errors', () => {
    const errors = [
      { instancePath: '/elements/0/type', message: 'invalid type' },
      { instancePath: '/elements/1/x', message: 'must be number' },
    ]
    const result = formatValidationErrors(errors as any)
    expect(result).toContain('/elements/0/type: invalid type')
    expect(result).toContain('/elements/1/x: must be number')
  })

  it('uses root for empty instancePath', () => {
    const errors = [{ instancePath: '', message: 'missing required field' }]
    const result = formatValidationErrors(errors as any)
    expect(result).toBe('root: missing required field')
  })
})
