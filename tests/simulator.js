'use strict'

/*
**Hello *World***
{ b: ["Hello ", { i: [ "World" ] }]
*/

const br = Symbol('br')

function walk (blocks, handle) {
  let walkPos = 0
  const blockContainers = []
  let blockContainerIndex

  function process (block, parentIndex) {
    blockContainerIndex = parentIndex
    if (Array.isArray(block)) {
      blockContainers.unshift(block)
      block.forEach(process)
    } else if (typeof block === 'object') {
      const format = Object.keys(block)[0]
      handle('format-begin', format, { walkPos })
      process(block[format])
      blockContainers.shift()
      handle('format-end', format, {})
    } else {
      handle('text', block, { walkPos, blockContainer: blockContainers[0], blockContainerIndex })
      if (block === br) {
        ++walkPos
      } else {
        walkPos += block.length
      }
    }
  }

  process(blocks)
}

const int = value => parseInt(value, 10)

function format (specifier) {
  const [, name/*, info */] = /(\w+)(?: (.*))?/.exec(specifier)
  const tagName = {
    header1: 'h1',
    header2: 'h2',
    header3: 'h3',
    header4: 'h4',
    bold: 'b',
    italic: 'i',
    underline: 'u',
    code: 'code',
    caption: 'figcaption',
    inline_code: 'samp',
    selected: 'selected'
  }[name]
  walk(this.blocks, (action, text, { walkPos, blockContainer, blockContainerIndex }) => {
    const end = walkPos + text.length
    if (action === 'text' && this.selectFrom >= walkPos && this.selectFrom < end) {
      if (this.pos > end) {
        throw new Error('not able to format consecutive blocks')
      }
      const newBlocks = []
      const relSelectFrom = this.selectFrom - walkPos
      const relPos = this.pos - walkPos
      if (relSelectFrom > 0) {
        newBlocks.push(text.substring(0, relSelectFrom))
      }
      newBlocks.push({
        [tagName]: [text.substring(relSelectFrom, relPos)]
      })
      if (relPos < text.length) {
        newBlocks.push(text.substring(relPos))
      }
      blockContainer.splice(blockContainerIndex, 1, ...newBlocks)
    }
  })
}

const actions = {
  text (text) {
    if (this.pos !== this.length) {
      throw new Error('text allowed only at the end of the flow')
    }
    delete this.selectFrom
    const unescaped = text.replace(/%N/g, '\n').replace(/%%/g, '%')
    this.blocks.push(unescaped)
    this.pos += unescaped.length
    this.length += unescaped.length
  },

  left (count) {
    if (this.selectFrom !== undefined) {
      this.pos = this.selectFrom - count + 1
      delete this.selectFrom
    } else {
      this.pos -= int(count)
    }
  },

  select (count) {
    this.selectFrom = this.pos
    this.pos += int(count)
  },

  right (count) {
    if (this.selectFrom !== undefined) {
      this.pos += int(count) - 1
      delete this.selectFrom
    } else {
      this.pos += int(count)
    }
    if (this.pos > this.length) {
      throw new Error(`right going out of bound (pos: ${this.pos}, length: ${this.length})`)
    }
  },

  enter () {
    if (this.pos !== this.length) {
      throw new Error('enter allowed only at the end of the flow')
    }
    delete this.selectFrom
    ++this.pos
    ++this.length
    this.blocks.push(br)
  },

  format,

  debug () { debugger } // eslint-disable-line
}

const cursor = '<cursor/>'

function html () {
  if (this.selectFrom !== undefined) {
    format.call(this, 'selected')
  }
  const result = []
  let lastFormat
  walk(this.blocks, (action, text, { walkPos }) => {
    if (this.pos === walkPos && !result.includes(cursor)) {
      result.push(cursor)
    }
    if (action === 'format-begin') {
      result.push(`<${text}>`)
    } else if (action === 'format-end') {
      lastFormat = text
      result.push(`</${text}>`)
    } else if (text === br) {
      if (!['h1', 'code'].includes(lastFormat)) {
        result.push('<br>')
      } // else useless
    } else {
      // text
      const end = walkPos + text.length
      if (this.pos > walkPos && this.pos < end) {
        const relPos = this.pos - walkPos
        result.push(text.substring(0, relPos), cursor, text.substring(relPos))
      } else {
        result.push(text)
      }
    }
  })
  if (this.pos === this.length) {
    result.push(cursor)
  }
  return result.join('')
}

module.exports = commands => {
  const context = {
    blocks: [],
    pos: 0,
    length: 0
  }
  commands
    .split(/\r?\n/)
    .filter(command => !!command.trim())
    .forEach(command => {
      const [, action, parameter] = /(\w+) ?(.*)/.exec(command)
      actions[action].call(context, parameter)
    })
  return html.call(context)
}
