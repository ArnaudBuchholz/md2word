'use strict'

const md = require('markdown-it')()
const { readFile } = require('fs').promises
const renderer = require('./renderer')
const { check, log, serve } = require('reserve')

const instructions = []

readFile(process.argv[2])
  .then(buffer => buffer.toString())
  .then(markdown => {
    return md.parse(markdown)
  })
  .then(tokens => {
    renderer(tokens, instruction => instructions.push(instruction))
    return check({
      port: 53475,
      mappings: [{
        match: '\\/script$',
        custom: (request, response) => {
          const script = instructions.join('\n')
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
