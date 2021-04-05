const { markdownlint } = require('markdownlint').promises
const { join } = require('path')
const { readdir } = require('fs').promises

const samples = join(__dirname, 'linter')
const rules = join(__dirname, '../linter')

Promise.all([
  readdir(samples),
  readdir(rules)
])
  .then(([sampleFiles, ruleFiles]) => markdownlint({
    files: sampleFiles.map(name => join(samples, name)),
    customRules: ruleFiles.map(name => require(join(rules, name)))
  }))
  .then(console.log)
