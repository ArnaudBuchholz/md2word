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
    },
    url: {
      9: 'detects bare URL (markdownlint)',
      13: 'detects URL title formatting'
    },
    xref: {
      5: 'detects invalid xref (no PREVIOUS)',
      27: 'detects invalid xref id',
      28: 'detects invalid xref id',
      29: 'detects invalid xref id',
      30: 'detects invalid xref id',
      34: 'detects unknown xref id',
      36: 'detects xref in a box title',
      39: 'detects xref in a header',
      43: 'detects invalid xref (no NEXT)',
      45: 'detects invalid xref (no NEXT)'
    }
  }

  let expectedErrorCount = 0

  Object.keys(expected).forEach(name => {
    const expectedLineNumbers = Object.keys(expected[name])
    expectedErrorCount += expectedLineNumbers.length

    describe(name, () => {
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

  it('Checking the total error count', () => {
    const errorsFound = Object.keys(found).reduce((total, name) => total + Object.keys(found[name]).length, 0)
    assert.strictEqual(errorsFound, expectedErrorCount)
  })
})
