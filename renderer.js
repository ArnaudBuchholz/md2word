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

function _startInlineFormatting (style) {
  this.stylesInProgress.push({
    style,
    from: this.length
  })
}

function _endInlineFormatting () {
  const style = this.stylesInProgress.pop()
  style.to = this.length
  this.stylesToApply.unshift(style)
}

function _text ({ content }) {
  this.text.push(content)
  this.length += content.length
}

const renderers = {
  inline (token) {
    render.call(this, token.children)
  },

  heading_open (token) {
    this.format = {
      h1: 'header1',
      h2: 'header2',
      h3: 'header3',
      h4: 'header4'
    }[token.tag]
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

  text: _text,

  blockquote_open () {
    this._inBlockQuote = true
  },

  paragraph_open () {
    _reset.call(this)
  },

  softbreak () {
    this.text.push(softbreak)
    ++this.length
  },

  paragraph_close () {
    if ((this.text.length === 1 && this.text[0] === softbreak) || this._inBlockQuote) {
      return // ignore
    }
    const text = this.text.map(t => t === softbreak ? '%N' : t.replace(/%/g, '%%')).join('')
    this.output(`text ${text}`)
    const length = this.length
    let leftPos = length
    let rightPos = length
    let selectionOffset = 0
    this.stylesToApply.forEach(({ from, to, style }) => {
      if (from < leftPos) {
        this.output(`left ${leftPos - from + selectionOffset}`)
      } else if (from > rightPos) {
        this.output(`right ${from - rightPos + selectionOffset}`)
      } else {
        this.output('left 1') // removes selection
        this.output(`right ${from - leftPos}`)
      }
      leftPos = from
      rightPos = from
      const length = to - from
      this.output(`select ${length}`)
      rightPos = to
      this.output(`format ${style}`)
      selectionOffset = 1
    })
    if (rightPos < length) {
      this.output(`right ${length - rightPos + selectionOffset}`)
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
    delete this._inBlockQuote
  },

  fence (token) {
    _reset.call(this)
    const trimed = token.content.trim()
    const text = escape(trimed)
    this.output(`text ${text}`)
    this.output(`left ${trimed.length}`)
    this.output(`select ${trimed.length}`)
    this.output(`format code ${token.info}`)
    this.output('enter')
    this._nextIsCaption = true
  },

  code_inline (token) {
    _startInlineFormatting.call(this, 'inline_code')
    _text.call(this, token)
    _endInlineFormatting.call(this)
  }
}

function handleInlineFormatting (tokenPrefix, style) {
  renderers[`${tokenPrefix}_open`] = function () {
    _startInlineFormatting.call(this, style)
  }
  renderers[`${tokenPrefix}_close`] = _endInlineFormatting
}

handleInlineFormatting('em', 'italic')
handleInlineFormatting('strong', 'bold')

function render (tokens) {
  tokens.forEach((token, index) => (renderers[token.type] || nop).call(this, token, index, tokens))
}

module.exports = (tokens, output) => render.call({ output }, tokens)
