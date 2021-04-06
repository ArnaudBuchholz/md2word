'use strict'

require('colors')
const marked = require('marked')
const { readFile } = require('fs').promises
const renderer = require('./renderer')

readFile(process.argv[2])
  .then(buffer => buffer.toString())
  .then(markdown => {
    const tokens = marked.lexer(markdown)
    renderer(tokens, function (command, ...parameters) {
      if (command.startsWith('end-')) {
        --this.indent
      }
      let formattedCommand = command.magenta
      if (command.endsWith('-caption')) {
        formattedCommand = formattedCommand.underline
      }
      console.log(' '.repeat(2 * this.indent), formattedCommand, ...parameters.map(parameter => {
        if (typeof parameter === 'string') {
          return parameter.gray
        }
        if (typeof parameter === 'object') {
          return parameter
        }
        return parameter.toString().yellow
      }))
      if (command.startsWith('begin-')) {
        ++this.indent
      }
    }.bind({ indent: 0 }))
  })
