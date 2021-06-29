'use strict'

module.exports = {
  names: ['md2word/header'],
  description: 'Headers validation',
  tags: ['md2word'],
  function: (params, onError) => {
    let inHeading = false
    params.tokens.forEach(token => {
      if (token.type === 'heading_open') {
        if (!['h1', 'h2', 'h3', 'h4'].includes(token.tag)) {
          onError({
            lineNumber: token.lineNumber,
            detail: 'Headers are limited to 4',
            context: token.line
          })
        }
        inHeading = true
      } else if (token.type === 'heading_close') {
        inHeading = false
      } else if (inHeading) {
        if (token.children.length !== 1) {
          onError({
            lineNumber: token.lineNumber,
            detail: 'Formatted headers are forbidden',
            context: token.line
          })
        }
      }
    })
  }
}
