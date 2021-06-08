'use strict'

/*
**Hello *World***
{ b: ["Hello ", { i: [ "World" ] }]
*/

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
      handle('format-begin', format, {})
      process(block[format])
      blockContainers.shift()
      handle('format-end', format, {})
    } else {
      handle('text', block, { walkPos, blockContainer: blockContainers[0], blockContainerIndex })
      walkPos += block.length
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
    caption: 'caption',
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
    this.blocks.push(text)
    this.pos += text.length
    this.length += text.length
  },

  left (count) {
    delete this.selectFrom
    this.pos -= int(count)
  },

  select (count) {
    this.selectFrom = this.pos
    this.pos += int(count)
  },

  right (count) {
    delete this.selectFrom
    this.pos = Math.min(this.length, this.pos + int(count))
  },

  enter () {
    if (this.pos !== this.length) {
      throw new Error('enter allowed only at the end of the flow')
    }
    delete this.selectFrom
    this.blocks.push({ br: [] })
  },

  format,

  debug () { debugger } // eslint-disable-line
}

function html () {
  if (this.selectFrom !== undefined) {
    format.call(this, 'selected')
  }
  const result = []
  let lastFormat
  walk(this.blocks, (action, text, { walkPos }) => {
    if (action === 'format-begin') {
      if (text !== 'br' || !['h1', 'code'].includes(lastFormat)) {
        result.push(`<${text}>`)
      }
    } else if (action === 'format-end') {
      if (text !== 'br') {
        lastFormat = text
        result.push(`</${text}>`)
      }
    } else {
      // text
      const end = walkPos + text.length
      if (this.pos >= walkPos && this.pos < end) {
        const relPos = this.pos - walkPos
        result.push(text.substring(0, relPos), '<cursor/>', text.substring(relPos))
      } else {
        result.push(text)
      }
    }
  })
  if (this.pos === this.length) {
    result.push('<cursor/>')
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
