const standard = require('standard')

const configuration = `
/* eslint semi: ["error", "always"] */
/* global assert */
`

const offset = configuration.split('\n').length - 1

module.exports = async function (basePath, text) {
  return new Promise((resolve, reject) => {
    standard.lintText(configuration + text, {
      cwd: basePath,
      fix: false,
      globals: [],
      plugins: [],
      envs: [],
      parser: ''
    }, (err, output) => {
      if (err) {
        reject(err)
      } else {
        const results = output.results[0].messages
        resolve(results.map(({ ruleId, message, line }) => {
          return {
            line: line - offset,
            message: `${message} (${ruleId})`
          }
        }))
      }
    })
  })
}
