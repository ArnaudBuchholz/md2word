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
  if (inline.children.length !== 1) {
    throw new Error('Complex caption')
  }
}

module.exports = {
  names: ['md2word/caption'],
  description: 'Caption validation',
  tags: ['md2word'],
  function: (params, onError) => {
    params.tokens.forEach((token, index, tokens) => {
      const needCaption = (token.type === 'fence' && token.tag === 'code') ||
        token.type === 'image'
      if (needCaption) {
        const next = tokens[index + 1]
        if (!next || next.type !== 'blockquote_open') {
          onError({
            lineNumber: token.lineNumber,
            detail: 'Caption is required',
            context: token.line
          })
          return
        }
        try {
          isValidCaption(tokens, index + 1)
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
