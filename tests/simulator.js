'use strict'

/*

**Hello *World***

{ b: ["Hello ", { i: [ "World" ] }]

*/

/*
function format (tagName) {
  const from = 0
  this.texts.every(text => {
    const end = text.length
    if (end < this.selectFrom) {
      return true
    }
    if (this.pos)



  })
}
*/

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
  // if (this.selectFrom !== undefined) {
  //   format.call(this, 'selected')
  // }
  const result = []
  const pos = this.pos
  let current = 0

  function walk (block) {
    if (Array.isArray(block)) {
      block.forEach(walk)
    } else if (typeof block === 'object') {
      const format = Object.keys(block)[0]
      result.push(`<${format}>`)
      walk(block[format])
      result.push(`</${format}>`)
    } else {
      // text
      const end = current + block.length
      if (pos >= current && pos < end) {
        const relPos = pos - current
        result.push(block.substring(0, relPos), '<cursor/>', block.substring(relPos))
      } else {
        result.push(block)
      }
      current = end
    }
  }

  walk(this.blocks)
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