'use strict'

/*
**Hello *World***

[{
  tagName: 'bold',
  info: undefined,
  blocks: [
    'Hello',
    {
      tagName: 'italic',
      info: undefined,
      blocks: [
        'World'
      ]
    }
  ]
}]
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
      const { format, info, blocks } = block
      handle('format-begin', { format, info }, { walkPos })
      process(blocks)
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

function applyFormat (specifier) {
  const [, format, info] = /(\w+)(?: (.*))?/.exec(specifier)
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
      newBlocks.push({ format, info, blocks: [text.substring(relSelectFrom, relPos)] })
      if (relPos < text.length) {
        newBlocks.push(text.substring(relPos))
      }
      blockContainer.splice(blockContainerIndex, 1, ...newBlocks)
    }
  })
}

const int = value => parseInt(value, 10)

const actions = {
  type (text) {
    if (this.pos !== this.length) {
      throw new Error('type allowed only at the end of the flow')
    }
    delete this.selectFrom
    const unescaped = text.replace(/%N/g, '\n').replace(/%%/g, '%')
    if (unescaped.length === 0) {
      throw new Error('empty text detected')
    }
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

  format: applyFormat,

  xref (specifier) {
    const [, xref, type, index] = specifier.match(/([^ ]+) (code|image) (\d+)/)
    const label = type.charAt(0).toUpperCase() + type.substring(1) + ' ' + index
    const name = `${type}_${index}`
    this.xrefs[xref] = { label, name }
  },

  debug () { debugger } // eslint-disable-line
}

function html () {
  const cursor = '<cursor/>'
  const mappings = {
    header1: { tagName: 'h1', block: true },
    header2: { tagName: 'h2', block: true },
    header3: { tagName: 'h3', block: true },
    header4: { tagName: 'h4', block: true },
    bold: { tagName: 'b' },
    italic: { tagName: 'i' },
    underline: { tagName: 'u' },
    code: { tagName: 'code', block: true },
    caption: { tagName: 'figcaption', block: true },
    inline_code: { tagName: 'samp' },
    selected: { tagName: 'selected' },
    box_header: { tagName: 'div', block: true },
    box_content: { tagName: 'div', block: true },
    image: { tagName: 'img', block: true },
    bullet_list: { tagName: 'li', listType: 'ul', block: true },
    order_list: { tagName: 'li', listType: 'ol', block: true },
    box_bullet_list: { tagName: 'li', listType: 'ul', className: 'box', block: true },
    box_order_list: { tagName: 'li', listType: 'ol', className: 'box', block: true },
    url_title: { tagName: 'span' },
    url: { tagName: 'a' }
  }
  const result = []
  let lastFormat
  const lists = []
  let isInFormat = 0

  function closeLists (level = 0) {
    while (lists.length > level) {
      const listType = lists.pop()
      result.push(`</${listType}>`)
    }
    lastFormat = undefined
  }

  if (this.selectFrom !== undefined) {
    applyFormat.call(this, 'selected')
  }
  walk(this.blocks, (action, data, { walkPos }) => {
    if (this.pos === walkPos && !result.includes(cursor)) {
      result.push(cursor)
    }
    if (action === 'format-begin') {
      const { format, info } = data
      const { tagName, listType, block, className } = mappings[format]
      ++isInFormat
      if (tagName === 'li') {
        const [level, index] = info.split(' ')
        const numericLevel = parseInt(level, 10)
        while (lists.length < numericLevel) {
          lists.push(listType)
          if (className) {
            result.push(`<${listType} class="${className}">`)
          } else {
            result.push(`<${listType}>`)
          }
        }
        closeLists(numericLevel)
        result.push(`<li data-index="${index}">`)
      } else {
        if (block && ['bullet_list', 'order_list', 'box_bullet_list', 'box_order_list'].includes(lastFormat)) {
          closeLists()
        }
        if (format === 'caption') {
          const [type, index] = info.split(' ')
          result.push(`<a name="${type}_${index}"></a>`)
        }
        if (['div', 'span'].includes(tagName)) {
          result.push(`<${tagName} class="${format}">`)
        } else if (!['img', 'a'].includes(tagName)) {
          result.push(`<${tagName}>`)
        }
        if (format === 'caption') {
          const [type, index] = info.split(' ')
          const label = type.charAt(0).toUpperCase() + type.substring(1) + ' ' + index
          result.push(label + ' : ')
        }
      }
    } else if (action === 'format-end') {
      const format = data
      const { tagName } = mappings[format]
      if (tagName === 'img') {
        const url = result.pop()
        result.push(`<img src="${url}">`)
      } else if (tagName === 'a') {
        const url = result.pop()
        result.push(`<a href="${url}">${url}</a>`)
      } else {
        result.push(`</${tagName}>`)
      }
      lastFormat = format
      --isInFormat
    } else {
      const text = data
      if (text === br) {
        if (lastFormat && lastFormat !== 'image' && mappings[lastFormat].block) {
          const last = result.pop()
          result.push('<enter/>', last)
        } else {
          result.push('<enter/>', '<br>')
        }
      } else {
        if (!isInFormat) {
          if (lists.length) {
            closeLists()
          } else {
            lastFormat = undefined
          }
        }
        const end = walkPos + text.length
        if (this.pos > walkPos && this.pos < end) {
          const relPos = this.pos - walkPos
          result.push(text.substring(0, relPos), cursor, text.substring(relPos))
        } else {
          let textWithXref = text
          Object.keys(this.xrefs).forEach(xref => {
            if (text.includes(xref)) {
              const { label, name } = this.xrefs[xref]
              textWithXref = textWithXref.replace(xref, `<a href="#${name}">${label}</a>`)
            }
          })
          result.push(textWithXref)
        }
      }
    }
  })
  closeLists()
  if (this.pos === this.length) {
    result.push(cursor)
  }
  return result.join('')
}

module.exports = commands => {
  const context = {
    blocks: [],
    pos: 0,
    length: 0,
    xrefs: {}
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
