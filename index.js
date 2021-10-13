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

async function main (mdFilename, ...argv) {
  const verbose = argv.includes('-verbose')
  const lintOnly = argv.includes('-lintOnly')
  const serveAnyway = argv.includes('-serve')
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
  const ruleNames = await readdir(customRulesPath)
  const customRules = ruleNames.map(name => require(join(customRulesPath, name)))
  const report = await markdownlint({
    files: [mdFilename],
    customRules,
    config
  })
  report[mdFilename].forEach(issue => {
    errors.push({
      line: issue.lineNumber,
      message: `${issue.errorDetail || issue.ruleDescription} (${issue.ruleNames.join(', ')})`,
      details: issue
    })
  })
  const markdown = (await readFile(mdFilename)).toString()
  const tokens = await md.parse(markdown)
  const codeIssues = await checkCode(basePath, tokens)
  codeIssues.forEach(({ line, message }) => {
    errors.push({
      line,
      message
    })
  })

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
      return { errors }
    }
  }
  if (lintOnly) {
    return { errors: [] }
  }

  const instructions = []
  renderer(tokens, instruction => instructions.push(instruction), { basePath })
  const script = instructions.join('\n')
  if (verbose) {
    console.log(script)
  }

  const configuration = await check({
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
  return { configuration }
}

module.exports = main

/* istanbul ignore if */ // Only used for command line
if (require.main === module) {
  const [,, mdFilename, ...argv] = process.argv
  main(mdFilename, ...argv)
    .then(({ errors, configuration }) => {
      if (errors) {
        process.exit(errors.length)
      }
      log(serve(configuration))
    })
    .catch(reason => console.error(reason))
}
