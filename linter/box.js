'use strict'

const POSSIBLE_TITLE = 1
const BOX_BODY = 2
const END_OF_BOX = 3

function checkFormatOfTitle (inline) {
  return inline.children.every(token => ['text', 'code_inline'].includes(token.type))
}

module.exports = {
  names: ['md2word/box'],
  description: 'Blockquote to box validation',
  tags: ['md2word'],
  function: (params, onError) => {
    let state = 0
    let possibleBox
    let possibleTitle
    params.tokens.forEach(token => {
      if (token.type === 'blockquote_open') {
        if (!state) {
          possibleBox = token
          state = POSSIBLE_TITLE
          possibleTitle = null
        } else {
          if (!possibleTitle) {
            onError({
              lineNumber: possibleBox.lineNumber,
              detail: 'Missing box title',
              context: possibleBox.line
            })
          } else if (!checkFormatOfTitle(possibleTitle)) {
            onError({
              lineNumber: possibleBox.lineNumber,
              detail: 'Box title must be a one liner',
              context: possibleBox.line
            })
          }
          state = BOX_BODY
        }
      }
      if (token.type === 'inline') {
        if (state === POSSIBLE_TITLE) {
          possibleTitle = token
        }
      }
      if (token.type === 'blockquote_close') {
        if (state === BOX_BODY) {
          state = END_OF_BOX
        } else {
          state = 0
        }
      }
    })
  }
}
