'use strict'

const nop = token => console.log(token) // () => {}

/*
const escape = text => text
  .replace(/%/g, '%%')
  .replace(/\n?\n/g, '%N')
*/

const renderers = {
  inline (token) {
    render.call(this, token.children)
  },

  heading_open (token) {
    this.format = token.tag
    this.text = []
  },

  heading_close (token) {
    const text = this.text.join('')
    this.output(`text ${text}`)
    this.output(`left ${text.length}`)
    this.output(`select ${text.length}`)
    this.output(`format ${this.format}`)
  },

  text (token) {
    this.text.push(token.content)
  }
}

// 

function render (tokens) {
  tokens.forEach((token, index) => (renderers[token.type] || nop).call(this, token, index, tokens))
}

module.exports = (tokens, output) => render.call({ output }, tokens)
