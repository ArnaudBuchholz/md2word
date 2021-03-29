'use strict'

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

const actions = {
  text: function (text) {
    delete selectFrom
    this.texts.push(text)
    this.pos += text.length
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
  const text = this.texts[0]
  if (this.pos < text.length) {
    return text.substring(0, this.pos)
      + '<cursor/>'
      + text.substring(this.pos)
  }
  return text + '<cursor/>'
}

module.exports = commands => {
  const context = {
    formats : [],
    texts: [],
    pos: 0
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