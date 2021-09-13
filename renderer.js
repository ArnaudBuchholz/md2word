'use strict'

const { join } = require('path')

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

const reXrefToken = /\{\{xref:([a-z0-9_]+)\}\}/g

function _text ({ content }) {
  content = content.replace(reXrefToken, (match, id) => {
    ++this.uid
    const textToReplace = `{{${this.uid.toString(16).padStart(8, '0')}}}`
    this.xrefs.push({
      textToReplace,
      id
    })
    return textToReplace
  })
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
  const text = this.text.map(t => t === softbreak ? ' ' : t.replace(/%/g, '%%')).join('')
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

function _incLevel (member) {
  if (!this[member]) {
    this[member] = 1
  } else {
    ++this[member]
  }
  return this[member]
}

function _decLevel (member) {
  if (--this[member] === 0) {
    delete this[member]
    return 0
  }
  return this[member]
}

function _listItem () {
  _paragraph.call(this, length => {
    this.output(`left ${length}`)
    this.output(`select ${length}`)
    const type = this.lists[this.lists.length - 1]
    if (this._inBlockQuote === 2) {
      this.output(`format box_${type}_list ${this.lists.length}`)
    } else {
      this.output(`format ${type}_list ${this.lists.length}`)
    }
    this.output('right 1')
  })
  this.output('enter')
  _reset.call(this)
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
    if (_incLevel.call(this, '_inBlockQuote') === 2) {
      _format.call(this, 'box_header')
    }
  },

  blockquote_close () {
    if (this._nextIsCaption) {
      _format.call(this, `caption ${this._nextIsCaption}`)
      delete this._nextIsCaption
    }
    _decLevel.call(this, '_inBlockQuote')
  },

  paragraph_open () {
    _reset.call(this)
  },

  softbreak () {
    this.text.push(softbreak)
    ++this.length
  },

  paragraph_close () {
    if ((this.text.length === 1 && this.text[0] === softbreak) || this._inBlockQuote === 1 || this.lists.length) {
      return // ignore
    }
    if (this._inBlockQuote === 2) {
      _paragraph.call(this, length => {
        this.output(`left ${length}`)
        this.output(`select ${length}`)
        this.output('format box_content')
        this.output('right 1')
      })
    } else {
      _paragraph.call(this)
    }
    this.output('enter')
  },

  fence (token) {
    _reset.call(this)
    this.text = [token.content.trim()]
    _format.call(this, `code ${token.info}`)
    _reset.call(this)
    this._nextIsCaption = 'code'
  },

  image (token) {
    _reset.call(this)
    let src = token.attrs.reduce((result, [attribute, value]) => {
      if (attribute === 'src') {
        return value.trim()
      }
      return result
    }, '')
    if (this.basePath) {
      src = join(this.basePath, src)
    }
    this.text = [src]
    _format.call(this, 'image')
    _reset.call(this)
    this._nextIsCaption = 'image'
  },

  code_inline (token) {
    _startInlineFormatting.call(this, 'inline_code')
    _text.call(this, token)
    _endInlineFormatting.call(this)
  },

  bullet_list_open (token) {
    if (this.lists.length) {
      _listItem.call(this)
    }
    this.lists.push('bullet')
  },

  ordered_list_open (token) {
    if (this.lists.length) {
      _listItem.call(this)
    }
    this.lists.push('order')
  },

  list_item_open (token) {
  },

  list_item_close (token) {
    if (this.length) {
      _listItem.call(this)
    }
  },

  ordered_list_close (token) {
    this.lists.pop()
  },

  bullet_list_close (token) {
    this.lists.pop()
  },

  link_open (token) {
    this.url = token.attrs[0][1]
    _startInlineFormatting.call(this, 'url_title')
  },

  link_close (token) {
    _endInlineFormatting.call(this)
    _text.call(this, { content: ' (' })
    _startInlineFormatting.call(this, 'url')
    _text.call(this, { content: this.url })
    _endInlineFormatting.call(this)
    _text.call(this, { content: ')' })
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

module.exports = (tokens, output, settings = {}) => render.call({ output, ...settings, lists: [], xrefs: [], uid: 0 }, tokens)
