'use strict'

const check = (tokens, index, type) => {
  const token = tokens[index]
  if (token.type !== type) {
    throw new Error('Unepected token')
  }
  return token
}

function isValidCaption (tokens, from) {
  check(tokens, from + 1, 'paragraph_open')
  check(tokens, from + 3, 'paragraph_close')
  check(tokens, from + 4, 'blockquote_close')
  const inline = check(tokens, from + 2, 'inline')
  if (!inline.children.every(token => ['text', 'code_inline'].includes(token.type))) {
    throw new Error('Complex caption')
  }
}

module.exports = {
  names: ['md2word/caption'],
  description: 'Caption validation',
  tags: ['md2word'],
  function: (params, onError) => {
    params.tokens.forEach((token, index, tokens) => {
      let captionOffset = 0
      if (token.type === 'fence' && token.tag === 'code') {
        captionOffset = 1
      } else if (token.type === 'inline' && token.children.length === 1 && token.children[0].type === 'image') {
        captionOffset = 2
      }
      if (token.type === 'blockquote_open' && token.level === 0 && !token._isCaption) {
        try {
          isValidCaption(tokens, index)
          onError({
            lineNumber: token.lineNumber,
            detail: 'Standalone caption is useless',
            context: token.line
          })
          return
        } catch (e) {
          // Not a valid caption anyway
        }
      }
      if (captionOffset !== 0) {
        const next = tokens[index + captionOffset]
        if (!next || next.type !== 'blockquote_open') {
          onError({
            lineNumber: token.lineNumber,
            detail: 'Caption is required',
            context: token.line
          })
          return
        }
        next._isCaption = true
        try {
          isValidCaption(tokens, index + captionOffset)
        } catch (e) {
          onError({
            lineNumber: next.lineNumber,
            detail: 'Caption should be simple',
            context: next.line
          })
        }
      }
    })
  }
}
