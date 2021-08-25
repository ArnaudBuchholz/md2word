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
      issues.forEach(issue => {
        error(mdFilename, issue.lineNumber, issue.errorDetail || issue.ruleDescription)
        if (verbose) {
          console.error(error)
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
  .then(async tokens => {
    const issues = await checkCode(basePath, tokens)
    if (issues.length) {
      issues.forEach(({ line, message }) => {
        error(mdFilename, line, message)
      })
      if (!serveAnyway) {
        process.exit(issues.length)
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
