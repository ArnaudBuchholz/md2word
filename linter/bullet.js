'use strict'

module.exports = {
  names: ['md2word/bullet'],
  description: 'Bullet validation',
  tags: ['md2word'],
  function: (params, onError) => {
    let bullets = []
    params.tokens.forEach(token => {
      if (token.type === 'bullet_list_open') {
        bullets.unshift({
          count: 0,
          start: token
        })

      } else if (token.type === 'list_item_open') {
        ++bullets[0].count

      } else if (token.type === 'bullet_list_close') {
        const { count, start } = bullets.shift()
        if (count < 2) {
          onError({
            lineNumber: start.lineNumber,
            detail: 'Bullet lists must be used with at least two items',
            context: start.line
          })
        }
      }
    })
  }
}
