'use strict'

const { dirname, isAbsolute, join } = require('path')
const md = require('markdown-it')()
const { readFile } = require('fs').promises
const renderer = require('./renderer')
const { check, log, serve } = require('reserve')

const instructions = []

const mdFilename = process.argv[2]
let basePath

if (isAbsolute(mdFilename)) {
  basePath = dirname(mdFilename)
} else {
  basePath = dirname(join(process.cwd(), mdFilename))
}

readFile(mdFilename)
  .then(buffer => buffer.toString())
  .then(markdown => {
    return md.parse(markdown)
  })
  .then(tokens => {
    renderer(tokens, instruction => instructions.push(instruction), { basePath })
    const script = instructions.join('\n')
    console.log(script)
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
