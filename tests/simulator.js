'use strict'

const actions = {
  text: function (text) {
    this.texts.push(text)
    this.pos += text.length
  },

  left: function (count) {
    this.pos -= parseInt(count, 10)
  },

  select: function (count) {
    this.start = this.pos
    this.pos += parseInt(count, 10)
  }
}

function html () {
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