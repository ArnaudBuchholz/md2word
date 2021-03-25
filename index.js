'use strict'

const marked = require('marked')
const { readFile } = require('fs').promises

const renderer = {
  _check (next) {
    if (this._last === 'L' && next !== 'LC') {
      throw new Error('Missing caption for listing : ' + this._lastContent)
    }
  },

  _output (command, content) {
    this._check(command)
    this._last = command
    this._lastContent = content
    return `${command} ${content}\n`
  },

  heading (text, level) {
    this._output(`H${level}`, text)
  },

  paragraph (text) {
    this._output('P', text)
  },

  code (code, info, escaped) { 
    this._output('L', code
    .replace(/%/g, '%%')
    .replace(/\r?\n/g, '%N')
    )
  },

  blockquote (text) {
    if (this._last === 'L') {
      this._output('LC', text)
    }
    this._output('Q', text)
  }
}

marked.use({ renderer })

const input = process.argv[2]
console.log(input)
readFile(input)
  .then(md => md.toString())
  .then(md => {
    console.log(marked.lexer(md))
  })
