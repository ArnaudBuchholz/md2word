const reToken = /\{\{([a-z]+)(?::([^}]*))?\}\}/g
const reXrefData = /^[a-z0-9_]+$/i

module.exports = {
  names: ['md2word/token'],
  description: 'Token validation',
  tags: ['md2word'],
  function: (params, onError) => {
    const xrefs = []
    let inHeading = false
    let inBlock = 0
    let possibleCaption = false
    let atLeastOneCaption = false
    const xrefNextTokens = []
    const check = token => {
      if (token.type === 'heading_open') {
        inHeading = true
      } else if (token.type === 'heading_close') {
        inHeading = false
      } else if (token.type === 'blockquote_open') {
        if (++inBlock === 2) {
          if (xrefs[0] && xrefs[0].possibleBoxHeader) {
            const xrefToken = xrefs[0].token
            onError({
              lineNumber: xrefToken.lineNumber,
              detail: 'Invalid use of xref (in box header)',
              context: xrefToken.line
            })
            xrefs.shift()
          }
        } else {
          possibleCaption = true
        }
      } else if (token.type === 'blockquote_close') {
        if (--inBlock === 0) {
          if (xrefs[0] && xrefs[0].possibleBoxHeader) {
            delete xrefs[0].possibleBoxHeader
            xrefs[0].id = true
          }
          if (possibleCaption) {
            atLeastOneCaption = true
            xrefNextTokens.length = 0
          }
        }
      } else if (token.type === 'text') {
        token.content.replace(reToken, (match, type, data) => {
          if (type !== 'xref') {
            onError({
              lineNumber: token.lineNumber,
              detail: 'Unknown token type',
              context: token.line
            })
          }
          if (inHeading) {
            onError({
              lineNumber: token.lineNumber,
              detail: 'Invalid use of xref (in header)',
              context: token.line
            })
            return
          }
          if (data === 'PREVIOUS') {
            if (!atLeastOneCaption) {
              onError({
                lineNumber: token.lineNumber,
                detail: 'Invalid xref (no PREVIOUS)',
                context: token.line
              })
            }
          } else if (data === 'NEXT') {
            xrefNextTokens.push(token)
          } else {
            if (!data || !data.match(reXrefData)) {
              onError({
                lineNumber: token.lineNumber,
                detail: 'Invalid xref id',
                context: token.line
              })
            }
            xrefs.unshift({ token, data, possibleBoxHeader: inBlock === 1 })
          }
        })
      }
      if (token.children) {
        token.children.forEach(check)
      }
    }
    params.tokens.forEach(check)
    xrefNextTokens.forEach(token => {
      onError({
        lineNumber: token.lineNumber,
        detail: 'Unknown xref (no NEXT)',
        context: token.line
      })
    })
    const xrefIds = xrefs.reduce((dictionary, xref) => {
      if (xref.id) {
        dictionary[xref.data] = true
      }
      return dictionary
    }, {})
    xrefs.forEach(({ token, data, id }) => {
      if (!id && !xrefIds[data]) {
        onError({
          lineNumber: token.lineNumber,
          detail: 'Unknown xref id',
          context: token.line
        })
      }
    })
  }
}
