'use strict'

module.exports = {
  names: ['header-limit'],
  description: 'Headers are limited to 4',
  tags: ['word'],
  function: (params, onError) => {
    params.tokens
      .filter(token => token.type === 'heading_open')
      .forEach(token => {
        if (!['h1', 'h2', 'h3', 'h4'].includes(token.tag)) {
          onError({
            lineNumber: token.lineNumber,
            detail: 'Headers are limited to 4',
            context: token.line
          })
        }
      })
  }
}
