'use strict'

module.exports = {
  names: ['md2word/url'],
  description: 'URL validation',
  tags: ['md2word'],
  function: (params, onError) => {
    let inUrl = false
    const check = token => {
      if (token.type === 'link_open') {
        inUrl = true
      } else if (token.type === 'link_close') {
        inUrl = false
      } else if (inUrl) {
        if (token.type !== 'text') {
          onError({
            lineNumber: token.lineNumber,
            detail: 'Formatted URLs are forbidden',
            context: token.line
          })
        }
      } else if (token.children) {
        token.children.forEach(check)
      }
    }
    params.tokens.forEach(check)
  }
}
