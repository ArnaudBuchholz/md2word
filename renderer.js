'use strict'

const nop = token => console.log(token) // () => {}

const softbreak = Symbol('softbreak')

const escape = text => text
  .replace(/%/g, '%%')
  .replace(/\n?\n/g, '%N')

function _reset () {
  this.text = []
  this.length = 0
  this.stylesInProgress = []
  this.stylesToApply = []
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

  text ({ content }) {
    this.text.push(content)
    this.length += content.length
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
    const length = text.length
    let pos = length
    this.stylesToApply.forEach(({ from, to, style }) => {
      if (from < pos) {
        this.output(`left ${pos - from}`)
      } else {
        this.output(`right ${from - pos}`)
      }
      const length = to - from
      this.output(`select ${length}`)
      pos = to
      this.output(`format ${style}`)
    })
    if (pos < length) {
      this.output(`right ${length - pos}`)
    }
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

function handleInlineFormatting (tokenPrefix, style) {
  renderers[`${tokenPrefix}_open`] = function () {
    this.stylesInProgress.push({
      style,
      from: this.length
    })
  }

  renderers[`${tokenPrefix}_close`] = function () {
    const style = this.stylesInProgress.pop()
    style.to = this.length
    this.stylesToApply.unshift(style)
  }
}

handleInlineFormatting('em', 'i')
handleInlineFormatting('strong', 'b')

function render (tokens) {
  tokens.forEach((token, index) => (renderers[token.type] || nop).call(this, token, index, tokens))
}

module.exports = (tokens, output) => render.call({ output }, tokens)
