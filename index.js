'use strict'

const md = require('markdown-it')()
const { readFile } = require('fs').promises
const renderer = require('./renderer')

readFile(process.argv[2])
  .then(buffer => buffer.toString())
  .then(markdown => {
    return md.parse(markdown)
  })
  .then(tokens => {
    renderer(tokens, console.log)
  })
