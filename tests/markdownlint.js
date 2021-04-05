const { markdownlint } = require('markdownlint').promises
const { join } = require('path')

markdownlint({
  files: join(__dirname, 'sample.md')
}).then(results => console.log(results))