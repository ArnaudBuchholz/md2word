'use strict'

/*
**Hello *World***
{ b: ["Hello ", { i: [ "World" ] }]
*/

function walk (blocks, callback) {
  let walkPos = 0
  let blockContainer
  let blockContainerIndex

  function process (block, parentIndex) {
    blockContainerIndex = parentIndex
    if (Array.isArray(block)) {
      blockContainer = block
      block.forEach(process)
    } else if (typeof block === 'object') {
      const format = Object.keys(block)[0]
      callback('format-begin', format)
      process(block[format])
      callback('format-end', format)
    } else {
      callback('text', block, { walkPos, blockContainer, blockContainerIndex })
      walkPos += block.length
    }
  }

  process(blocks)
}

function format (tagName) {
  walk(this.blocks, (action, text, { walkPos, blockContainer, blockContainerIndex }) => {
    const end = walkPos + text.length
    if (action === 'text' && this.selectFrom >= walkPos && this.selectFrom < end) {
      if (this.pos >= end) {
        throw new Error('not able to format consecutive blocks')
      }
      const newBlocks = []
      const 
      if (selectFrom > current) {
        newBlocks.push(block.substring(0, selectFrom - current))
      }
      const text = 


      if (pos < end) {
        newBlocks.push(block.substring(), selectFrom - current)
      }


    }
  })
}

const actions = {
  text: function (text) {
    if (this.pos !== this.length) {
      throw new Error('text allowed only at the end of the flow')
    }
    delete this.selectFrom
    this.blocks.push(text)
    this.pos += text.length
    this.length += text.length
  },

  left: function (count) {
    delete this.selectFrom
    this.pos -= parseInt(count, 10)
  },

  select: function (count) {
    this.selectFrom = this.pos
    this.pos += parseInt(count, 10)
  }
}

function html () {
  if (this.selectFrom !== undefined) {
    format.call(this, 'selected')
  }
  const result = []
  walk(this.blocks, (action, text, { walkPos }) => {
    if (action === 'format-begin') {
      result.push(`<${text}>`)
    } else if (action === 'format-end') {
      result.push(`</${text}>`)
    } else {
      // text
      const end = walkPos + block.length
      if (this.pos >= walkPos && this.pos < end) {
        const relPos = this.pos - walkPos
        result.push(block.substring(0, relPos), '<cursor/>', block.substring(relPos))
      } else {
        result.push(block)
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
    .filter(command => command)
    .forEach(command => {
      const [, action, parameter] = /(\w+) ?(.*)/.exec(command)
      actions[action].call(context, parameter)
    })
  return html.call(context)
}