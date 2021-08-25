const standard = require('standard')

module.exports = async function (basePath, text) {
  return new Promise((resolve, reject) => {
    standard.lintText(text, {
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
            line,
            message: `${message} (${ruleId})`
          }
        }))
      }
    })
  })
}
