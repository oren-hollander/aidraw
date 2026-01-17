#!/usr/bin/env node

import { Command } from 'commander'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { resolve, dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { render } from './renderer.js'
import { validateDiagram, validateConfig, formatValidationErrors } from './schema.js'
import type { DiagramInput, Config } from './types.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Read version from package.json
let version = '1.0.0'
try {
  const pkgPath = join(__dirname, '..', 'package.json')
  if (existsSync(pkgPath)) {
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'))
    version = pkg.version
  }
} catch {
  // Ignore errors reading package.json
}

const program = new Command()

program
  .name('aidraw')
  .description('AI-friendly CLI tool for creating hand-drawn style diagrams')
  .version(version)
  .argument('[input]', 'Input JSON file (or read from stdin)')
  .requiredOption('-o, --output <file>', 'Output PNG file path')
  .requiredOption('--width <pixels>', 'Output image width in pixels', parseInt)
  .requiredOption('--height <pixels>', 'Output image height in pixels', parseInt)
  .option('--config <file>', 'Path to config JSON file')
  .action(
    async (
      inputFile: string | undefined,
      options: {
        output: string
        width: number
        height: number
        config?: string
      },
    ) => {
      try {
        // Validate dimensions
        if (isNaN(options.width) || options.width <= 0) {
          console.error('Error: --width must be a positive number')
          process.exit(1)
        }
        if (isNaN(options.height) || options.height <= 0) {
          console.error('Error: --height must be a positive number')
          process.exit(1)
        }

        // Read input JSON
        let inputJson: string
        if (inputFile) {
          const inputPath = resolve(inputFile)
          if (!existsSync(inputPath)) {
            console.error(`Error: Input file not found: ${inputPath}`)
            process.exit(1)
          }
          inputJson = readFileSync(inputPath, 'utf-8')
        } else {
          // Read from stdin
          inputJson = await readStdin()
          if (!inputJson.trim()) {
            console.error('Error: No input provided. Specify a file or pipe JSON to stdin.')
            process.exit(1)
          }
        }

        // Parse input JSON
        let diagram: DiagramInput
        try {
          diagram = JSON.parse(inputJson)
        } catch (e) {
          const error = e as Error
          console.error(`Error: Invalid JSON: ${error.message}`)
          process.exit(1)
        }

        // Validate diagram
        if (!validateDiagram(diagram)) {
          console.error('Error: Invalid diagram schema:')
          console.error(formatValidationErrors(validateDiagram.errors))
          process.exit(1)
        }

        // Load config
        let config: Config = {}
        const configPath = options.config ? resolve(options.config) : findConfigFile()

        if (configPath && existsSync(configPath)) {
          try {
            const configJson = readFileSync(configPath, 'utf-8')
            config = JSON.parse(configJson)

            if (!validateConfig(config)) {
              console.error('Error: Invalid config schema:')
              console.error(formatValidationErrors(validateConfig.errors))
              process.exit(1)
            }
          } catch (e) {
            const error = e as Error
            console.error(`Error reading config file: ${error.message}`)
            process.exit(1)
          }
        }

        // Render diagram
        const pngBuffer = render(diagram, options.width, options.height, config)

        // Write output
        const outputPath = resolve(options.output)
        writeFileSync(outputPath, pngBuffer)

        console.log(`Diagram saved to: ${outputPath}`)
      } catch (e) {
        const error = e as Error
        console.error(`Error: ${error.message}`)
        process.exit(1)
      }
    },
  )

// Helper to find config file in current directory
function findConfigFile(): string | null {
  const defaultConfigPath = resolve('aidraw.config.json')
  if (existsSync(defaultConfigPath)) {
    return defaultConfigPath
  }
  return null
}

// Helper to read from stdin
function readStdin(): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = ''
    const stdin = process.stdin

    // Check if stdin has data
    if (stdin.isTTY) {
      resolve('')
      return
    }

    stdin.setEncoding('utf-8')
    stdin.on('data', (chunk) => {
      data += chunk
    })
    stdin.on('end', () => {
      resolve(data)
    })
    stdin.on('error', reject)
  })
}

program.parse()
