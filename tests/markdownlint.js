const { markdownlint } = require('markdownlint').promises
const { join } = require('path')

markdownlint({
  files: join(__dirname, 'linter', 'formatted header.md'),
  customRules: [
      require('../linter/non-formatted-header')
  ]
}).then(results => console.log(results))