'use strict'

const nop = token => console.log(token) // () => {}

const softbreak = Symbol('softbreak')

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

function _format (format) {
  const text = this.text.map(t => t === softbreak ? '\n' : t).join('')
  const escaped = text
    .replace(/%/g, '%%')
    .replace(/\r?\n/g, '%N')
  this.output(`type ${escaped}`)
  this.output(`left ${text.length}`)
  this.output(`select ${text.length}`)
  this.output(`format ${format}`)
  this.output('enter')
}

function _paragraph (wrapper) {
  const text = this.text.map(t => t === softbreak ? '%N' : t.replace(/%/g, '%%')).join('')
  this.output(`type ${text}`)
  const length = this.length
  if (wrapper) {
    wrapper(length)
  }
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
    _format.call(this, this.format)
  },

  text: _text,

  blockquote_open () {
    if (!this._inBlockQuote) {
      this._inBlockQuote = 1
    } else {
      if (this._inBlockQuote === 1) {
        _format.call(this, 'box_header')
      }
      ++this._inBlockQuote
    }
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
    _paragraph.call(this)
    this.output('enter')
  },

  blockquote_close () {
    if (this._nextIsCaption) {
      _format.call(this, 'caption')
      delete this._nextIsCaption
    }
    if (this._inBlockQuote === 2) {
      _paragraph.call(this, length => {
        this.output(`left ${length}`)
        this.output(`select ${length}`)
        this.output('format box_content')
        this.output('right 1')
      })
    }
    if (--this._inBlockQuote === 0) {
      delete this._inBlockQuote
    }
  },

  fence (token) {
    _reset.call(this)
    this.text = [token.content.trim()]
    _format.call(this, `code ${token.info}`)
    _reset.call(this)
    this._nextIsCaption = true
  },

  image (token) {
    _reset.call(this)
    const src = token.attrs.reduce((result, [attribute, value]) => {
      if (attribute === 'src') {
        return value
      }
      return result
    }, '')
    this.text = [src.trim()]
    _format.call(this, 'image')
    _reset.call(this)
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
