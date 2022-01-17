#!/usr/bin/env node

'use strict'

const { dirname, isAbsolute, join } = require('path')
const { markdownlint } = require('markdownlint').promises
const md = require('markdown-it')()
const { readFile } = require('fs').promises
const renderer = require('./renderer')
const { check, log, serve } = require('reserve')
const checkCode = require('./checkcode')

async function main (mdFilename) {
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

  let errors = []
  const customRules = await require('./linter')
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
    errors = errors.sort((err1, err2) => err1.line - err2.line)
  }

  const instructions = []
  renderer(tokens, instruction => instructions.push(instruction), { basePath })
  const script = instructions.join('\n')

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
  return { errors, script, configuration }
}

module.exports = main

/* istanbul ignore if */ // Only used for command line
if (require.main === module) {
  const { argv } = process
  const verbose = argv.includes('-verbose')
  const lintOnly = argv.includes('-lintOnly')
  const serveAnyway = argv.includes('-serve')
  const [,, mdFilename] = argv
  main(mdFilename)
    .then(({ errors, script, configuration }) => {
      errors
        .forEach(({ line, message, details }) => {
          console.error(`${mdFilename}@${line}: ${message}`)
          if (verbose && details) {
            console.error(details)
          }
        })
      if (lintOnly || (errors.length && !serveAnyway)) {
        process.exit(errors.length)
      }
      log(serve(configuration))
    })
    .catch(reason => console.error(reason))
}
