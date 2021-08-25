'use strict'

const { join } = require('path')

module.exports = async function checkCode (basePath, tokens) {
  const errors = []

  async function walk (tokens) {
    for await (const token of tokens) {
      if (token.type === 'fence') {
        const language = token.info
        try {
          const linter = require(join(basePath, `${language}.linter.js`))
          try {
            const results = await linter(basePath, token.content) || []
            results.forEach(({ line, message }) => {
              errors.push({
                line: line + token.map[0] + 1,
                message
              })
            })
          } catch (e) {
            console.error(`Error while invoking linter for ${language}`, e)
            process.exit(-1)
          }
        } catch (e) {
          // ignore error
        }
      } else if (token.children) {
        await walk(token.children)
      }
    }
  }

  await walk(tokens)

  return errors
}
