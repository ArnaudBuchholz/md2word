#!/usr/bin/env node

'use strict'

const { dirname, isAbsolute, join } = require('path')
const { markdownlint } = require('markdownlint').promises
const md = require('markdown-it')()
const { readdir, readFile } = require('fs').promises
const renderer = require('./renderer')
const { check, log, serve } = require('reserve')

const mdFilename = process.argv[2]
const dumpErrors = process.argv.includes('-dumpErrors')
const lintOnly = process.argv.includes('-lintOnly')
const serveAnyway = process.argv.includes('-serve')
const dumpScript = process.argv.includes('-dumpScript')
let basePath

if (isAbsolute(mdFilename)) {
  basePath = dirname(mdFilename)
} else {
  basePath = dirname(join(process.cwd(), mdFilename))
}

const customRulesPath = join(__dirname, './linter')
const instructions = []

readdir(customRulesPath)
  .then(ruleNames => {
    const customRules = ruleNames.map(name => require(join(customRulesPath, name)))
    return markdownlint({
      files: [mdFilename],
      customRules
    })
  })
  .then(report => {
    const issues = report[mdFilename]
    if (issues.length) {
      issues.forEach(error => {
        if (dumpErrors) {
          console.error(error)
        } else {
          console.log(`${mdFilename}@${error.lineNumber}: ${error.errorDetail || error.ruleDescription}`)
        }
      })
      if (!serveAnyway) {
        process.exit(issues.length)
      }
    }
    return readFile(mdFilename)
  })
  .then(buffer => buffer.toString())
  .then(markdown => md.parse(markdown))
  .then(tokens => {
    renderer(tokens, instruction => instructions.push(instruction), { basePath })
    const script = instructions.join('\n')
    if (dumpScript) {
      console.log(script)
    }
    if (lintOnly) {
      process.exit(0)
    }
    return check({
      port: 53475,
      mappings: [{
        match: '\\/script(?:\\?.*)?$',
        custom: (request, response) => {
          const length = (new TextEncoder().encode(script)).length
          response.writeHead(200, {
            'content-type': 'text/plain; charset=utf-8',
            'content-length': length
          })
          response.end(script)
        }
      }]
    })
  })
  .then(configuration => {
    log(serve(configuration))
  })
  .catch(reason => console.error(reason))
