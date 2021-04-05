'use strict'

const nop = () => {}

const isTextOnly = ({ tokens }) => tokens.length === 1 && tokens[0].type === 'text'
const isTextOnlyBlockquote = ({ tokens }) => tokens.length === 1 && tokens[0].type === 'paragraph' && isTextOnly(tokens[0])

const linters = {

  heading (token) {
    if (token.depth > 4) {
      throw new Error('Invalid heading depth')
    }
    if (!isTextOnly(token)) {
      throw new Error('Invalid formatted heading')
    }
  },

  code (token, index, tokens) {
    // Expect the next token to be the caption using the blockquote syntax
    const caption = tokens[index + 1]
    if (!caption || caption.type !== 'blockquote') {
      throw new Error('Missing caption for code listing')
    }
    if (!isTextOnlyBlockquote(caption)) {
      throw new Error('Invalid formatted caption on code listing')
    }
    caption._ignore = true
  },

  blockquote (token) {
    if (token._ignore) {
      return
    }
    const title = token.tokens[0]
    if (!isTextOnly(title) || title.text.includes('\n')) {
      throw new Error('Invalid formatted title on box')
    }
    if (token.tokens.length !== 2) {
      throw new Error('Invalid box format')
    }
  }

}

module.exports = tokens => {
  tokens.forEach((token, index) => (linters[token.type] || nop)(token, index, tokens))
}
