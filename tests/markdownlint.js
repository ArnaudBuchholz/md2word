const { markdownlint } = require('markdownlint').promises
const { join } = require('path')
const { readdir } = require('fs').promises

const samples = join(__dirname, 'linter')
const rules = join(__dirname, '../linter')

const dump = {
  names: ['dump-tokens'],
  description: 'dump-tokens',
  tags: ['word'],
  function: (params, onError) => {
    if (params.tokens.some(token => token.line === 'debug')) {
      params.tokens.forEach(token => console.log(token))
    }
  }
}

const filter = process.argv[2]

Promise.all([
  readdir(samples),
  readdir(rules)
])
  .then(([sampleFiles, ruleFiles]) => markdownlint({
    files: sampleFiles.filter(name => !filter || name.includes(filter)).map(name => join(samples, name)),
    customRules: [dump].concat(ruleFiles.map(name => require(join(rules, name))))
  }))
  .then(console.log)
