const { readdir } = require('fs').promises
const { join } = require('path')

module.exports = readdir(__dirname)
  .then(rules => rules
    .filter(name => !['index.js', 'tools.js'].includes(name))
    .map(name => join(__dirname, name))
    .map(filename => require(filename))
  )
