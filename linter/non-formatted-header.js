'use strict'

module.exports = {
  names: ['non-formatted-header'],
  description: 'Formatted headers are forbidden',
  tags: ['word'],
  function: (params, onError) => {
    let inHeading = false
    params.tokens.forEach(token => {
      if (token.type === 'heading_open') {
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
