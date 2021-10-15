'use strict'

const { join } = require('path')
const { constants, access: accessSync } = require('fs')
const { promisify } = require('util')
const access = promisify(accessSync)

module.exports = async function checkCode (basePath, tokens) {
  const errors = []

  async function walk (tokens) {
    for await (const token of tokens) {
      if (token.type === 'fence') {
        const language = token.info
        const linterPath = join(basePath, `${language}.linter.js`)
        const baseLine = token.map[0] + 1
        try {
          await access(linterPath, constants.R_OK)
          try {
            const linter = require(linterPath)
            const results = await linter(basePath, token.content) || []
            results.forEach(({ line, message }) => {
              errors.push({
                line: line + baseLine,
                message
              })
            })
          } catch (e) {
            errors.push({
              line: baseLine,
              message: `Error while invoking linter for ${language}`,
              details: e
            })
          }
        } catch (e) {
          // ignore
        }
      } else if (token.children) {
        await walk(token.children)
      }
    }
  }

  await walk(tokens)

  return errors
}
