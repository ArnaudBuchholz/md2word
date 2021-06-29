'use strict'

const assert = require('assert')
const { markdownlint } = require('markdownlint').promises
const { basename, join } = require('path')
const { readdir } = require('fs').promises

const samples = join(__dirname, '../linter')
const rules = join(__dirname, '../../linter')

describe('linter', () => {
  let found

  before(() => Promise.all([
    readdir(samples),
    readdir(rules)
  ])
    .then(([sampleFiles, ruleFiles]) => markdownlint({
      files: sampleFiles.map(name => join(samples, name)),
      customRules: ruleFiles.map(name => require(join(rules, name)))
    }))
    .then(results => {
      found = Object.keys(results).reduce((dictionay, name) => {
        const array = results[name]
        dictionay[basename(name, '.md')] = array.reduce((errors, error) => {
          errors[error.lineNumber] = error
          return errors
        }, {})
        return dictionay
      }, {})
    })
  )

  const expected = {
    boxes: {
      24: 'detects formatted titles',
      29: 'detects multiline titles'
    },
    'formatted header': {
      1: 'detects formatted header'
    },
    'header levels': {
      9: 'detects header with level > 4'
    },
    'missing caption in code': {
      5: 'detects missing caption for code example',
      25: 'detects formatted caption'
    },
    bullets: {
      10: 'detects unique first level bullet',
      15: 'detects unique second level bullet',
      20: 'detects unique first level numbered bullet',
      25: 'detects unique second level numbered bullet'
    }
  }

  Object.keys(expected).forEach(name => {
    describe(name, () => {
      const expectedLineNumbers = Object.keys(expected[name])
      expectedLineNumbers.forEach(lineNumber => {
        it(expected[name][lineNumber], () => {
          assert.ok(found[name][lineNumber])
        })
      })
      it('found the right number of errors', () => {
        const lineNumbers = Object.keys(found[name])
        if (expectedLineNumbers.length !== lineNumbers.length) {
          lineNumbers.forEach(lineNumber => {
            if (!expectedLineNumbers.includes(lineNumber)) {
              console.log(found[name][lineNumber])
            }
          })
        }
        assert.strictEqual(expectedLineNumbers.length, lineNumbers.length)
      })
    })
  })
})
