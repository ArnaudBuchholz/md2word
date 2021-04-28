'use strict'

const nop = token => console.log(token) // () => {}

const softbreak = Symbol('softbreak')

const escape = text => text
  .replace(/%/g, '%%')
  .replace(/\n?\n/g, '%N')

function _reset () {
  this.text = []
}

const renderers = {
  inline (token) {
    render.call(this, token.children)
  },

  heading_open (token) {
    this.format = token.tag
    _reset.call(this)
  },

  heading_close (token) {
    const text = this.text.join('')
    this.output(`text ${text}`)
    this.output(`left ${text.length}`)
    this.output(`select ${text.length}`)
    this.output(`format ${this.format}`)
    this.output('enter')
  },

  text (token) {
    this.text.push(token.content)
  },

  blockquote_open () {
    this._inBlockQuote = true
  },

  paragraph_open () {
    _reset.call(this)
  },

  softbreak () {
    this.text.push(softbreak)
  },

  paragraph_close () {
    if ((this.text.length === 1 && this.text[0] === softbreak) || this._inBlockQuote) {
      return // ignore
    }
    const text = this.text.map(t => t === softbreak ? '%N' : t).join('')
    this.output(`text ${text}`)
    // Process formatting (if any)
    this.output('enter')
  },

  blockquote_close () {
    if (this._nextIsCaption) {
      const text = this.text.map(t => t === softbreak ? '%N' : t).join('')
      this.output(`text ${text}`)
      this.output(`left ${text.length}`)
      this.output(`select ${text.length}`)
      this.output('format caption')
      this.output('enter')
      delete this._nextIsCaption
    }
  },

  fence (token) {
    _reset.call(this)
    const text = escape(token.content.trim())
    this.output(`text ${text}`)
    this.output(`left ${text.length}`)
    this.output(`select ${text.length}`)
    this.output(`format code ${token.info}`)
    this.output('enter')
    this._nextIsCaption = true
  }

}

function render (tokens) {
  tokens.forEach((token, index) => (renderers[token.type] || nop).call(this, token, index, tokens))
}

module.exports = (tokens, output) => render.call({ output }, tokens)
