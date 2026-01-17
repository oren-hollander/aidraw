import Ajv from 'ajv'
import type { ErrorObject } from 'ajv'

// JSON Schema for diagram validation
export const diagramSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  type: 'object',
  required: ['elements'],
  properties: {
    elements: {
      type: 'array',
      items: { $ref: '#/definitions/element' },
    },
  },
  definitions: {
    element: {
      oneOf: [
        { $ref: '#/definitions/shape' },
        { $ref: '#/definitions/text' },
        { $ref: '#/definitions/line' },
        { $ref: '#/definitions/arrow' },
      ],
    },
    shape: {
      type: 'object',
      required: ['type'],
      properties: {
        type: { enum: ['rectangle', 'ellipse', 'diamond', 'container'] },
        id: { type: 'string' },
        x: { type: 'number' },
        y: { type: 'number' },
        width: { type: 'number' },
        height: { type: 'number' },
        rotation: { type: 'number' },
        label: { type: 'string' },
        cornerRadius: { type: 'number' },
        style: { $ref: '#/definitions/style' },
        children: {
          type: 'array',
          items: { $ref: '#/definitions/element' },
        },
      },
      additionalProperties: false,
    },
    text: {
      type: 'object',
      required: ['type', 'text'],
      properties: {
        type: { const: 'text' },
        id: { type: 'string' },
        x: { type: 'number' },
        y: { type: 'number' },
        rotation: { type: 'number' },
        text: { type: 'string' },
        fontSize: { type: 'number' },
        fontFamily: { enum: ['hand', 'normal', 'code'] },
        textAlign: { enum: ['left', 'center', 'right'] },
        style: { $ref: '#/definitions/style' },
      },
      additionalProperties: false,
    },
    line: {
      type: 'object',
      required: ['type', 'points'],
      properties: {
        type: { const: 'line' },
        id: { type: 'string' },
        x: { type: 'number' },
        y: { type: 'number' },
        rotation: { type: 'number' },
        points: {
          type: 'array',
          items: {
            type: 'array',
            items: { type: 'number' },
            minItems: 2,
            maxItems: 2,
          },
          minItems: 2,
        },
        style: { $ref: '#/definitions/style' },
      },
      additionalProperties: false,
    },
    arrow: {
      type: 'object',
      required: ['type', 'start', 'end'],
      properties: {
        type: { const: 'arrow' },
        id: { type: 'string' },
        x: { type: 'number' },
        y: { type: 'number' },
        rotation: { type: 'number' },
        start: { type: 'string' },
        end: { type: 'string' },
        label: { type: 'string' },
        startArrowhead: { enum: [null, 'arrow', 'dot', 'bar'] },
        endArrowhead: { enum: [null, 'arrow', 'dot', 'bar'] },
        startSide: { enum: ['top', 'bottom', 'left', 'right', 'auto'] },
        endSide: { enum: ['top', 'bottom', 'left', 'right', 'auto'] },
        style: { $ref: '#/definitions/style' },
      },
      additionalProperties: false,
    },
    style: {
      type: 'object',
      properties: {
        fill: { type: 'string' },
        stroke: { type: 'string' },
        strokeWidth: { type: 'number', minimum: 1, maximum: 4 },
        strokeStyle: { enum: ['solid', 'dashed', 'dotted'] },
        fillStyle: { enum: ['solid', 'hachure', 'cross-hatch'] },
        roughness: { type: 'number', minimum: 0, maximum: 2 },
        opacity: { type: 'number', minimum: 0, maximum: 100 },
      },
      additionalProperties: false,
    },
  },
}

// Config schema
export const configSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  type: 'object',
  properties: {
    background: {
      type: 'string',
      default: '#ffffff',
    },
    padding: {
      type: 'number',
      minimum: 0,
      default: 20,
    },
  },
  additionalProperties: false,
}

// Create validator
const ajv = new Ajv.default({ allErrors: true, useDefaults: true })

export const validateDiagram = ajv.compile(diagramSchema)
export const validateConfig = ajv.compile(configSchema)

// Format validation errors
export function formatValidationErrors(errors: ErrorObject[] | null | undefined): string {
  if (!errors) return 'Unknown validation error'

  return errors
    .map((err: ErrorObject) => {
      const path = err.instancePath || 'root'
      return `${path}: ${err.message}`
    })
    .join('\n')
}
