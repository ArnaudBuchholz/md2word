'use strict'

const POSSIBLE_TITLE = 1
const BOX_BODY = 2
const END_OF_BOX = 3

module.exports = {
  names: ['md2word/box'],
  description: 'Blockquote to box validation',
  tags: ['md2word'],
  function: (params, onError) => {
    let state = 0
    let possibleBox
    let formattedTitle
    params.tokens.forEach(token => {
      if (token.type === 'blockquote_open') {
        if (!state) {
          possibleBox = token
          state = POSSIBLE_TITLE
          formattedTitle = false
        } else {
          if (formattedTitle) {
            onError({
              lineNumber: possibleBox.lineNumber,
              detail: 'Box title must be a non-formatted one liner',
              context: possibleBox.line
            })
          }
          state = BOX_BODY
        }
      }
      if (token.type === 'inline') {
        if (state === POSSIBLE_TITLE) {
          formattedTitle = token.children.length !== 1
        } else if (state === END_OF_BOX) {
          onError({
            lineNumber: token.lineNumber,
            detail: 'Box title after box content',
            context: possibleBox.line
          })
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
