#!/usr/bin/env node

'use strict'

const { dirname, isAbsolute, join } = require('path')
const { markdownlint } = require('markdownlint').promises
const md = require('markdown-it')()
const { readdir, readFile } = require('fs').promises
const renderer = require('./renderer')
const { check, log, serve } = require('reserve')
const customRulesPath = join(__dirname, './linter')
const checkCode = require('./checkcode')
const { error } = require('./report')

const mdFilename = process.argv[2]
const verbose = process.argv.includes('-verbose')
const lintOnly = process.argv.includes('-lintOnly')
const serveAnyway = process.argv.includes('-serve')
let basePath

if (isAbsolute(mdFilename)) {
  basePath = dirname(mdFilename)
} else {
  basePath = dirname(join(process.cwd(), mdFilename))
}

let config
try {
  config = require(join(basePath, 'md2word.json'))
} catch (e) {
  // ignore
}

const errors = []

readdir(customRulesPath)
  .then(ruleNames => {
    const customRules = ruleNames.map(name => require(join(customRulesPath, name)))
    return markdownlint({
      files: [mdFilename],
      customRules,
      config
    })
  })
  .then(report => {
    report[mdFilename].forEach(issue => {
      errors.push({
        line: issue.lineNumber,
        message: `${issue.errorDetail || issue.ruleDescription} (${issue.ruleNames.join(', ')})`,
        details: issue
      })
    })
    return readFile(mdFilename)
  })
  .then(buffer => buffer.toString())
  .then(markdown => md.parse(markdown))
  .then(async tokens => {
    const issues = await checkCode(basePath, tokens)
    if (issues.length) {
      issues.forEach(({ line, message }) => {
        errors.push({
          line,
          message
        })
      })
    }
    if (errors.length) {
      errors
        .sort((err1, err2) => err1.line - err2.line)
        .forEach(({ line, message, details }) => {
          error(mdFilename, line, message)
          if (verbose && details) {
            console.error(details)
          }
        })
      if (!serveAnyway) {
        process.exit(errors.length)
      }
    }
    return tokens
  })
  .then(tokens => {
    if (lintOnly) {
      process.exit(0)
    }
    const instructions = []
    renderer(tokens, instruction => instructions.push(instruction), { basePath })
    const script = instructions.join('\n')
    if (verbose) {
      console.log(script)
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
