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
      24: 'invalid double blockquote',
      30: 'formatted titles',
      35: 'multiline titles',
      50: 'title after content',
      54: 'invalid double blockquote'
    },
    'formatted header': {
      1: 'formatted header'
    },
    'header levels': {
      9: 'header with level > 4'
    },
    'missing caption in code': {
      5: 'missing caption for code example',
      25: 'formatted caption'
    },
    bullets: {
      10: 'unique first level bullet',
      15: 'unique second level bullet',
      20: 'unique first level numbered bullet',
      25: 'unique second level numbered bullet'
    },
    url: {
      9: 'bare URL (markdownlint)',
      13: 'URL title formatting'
    },
    xref: {
      5: 'invalid xref (no PREVIOUS)',
      27: 'invalid xref id',
      28: 'invalid xref id',
      29: 'invalid xref id',
      30: 'invalid xref id',
      34: 'unknown xref id',
      36: 'xref in a box title',
      39: 'xref in a header',
      43: 'invalid xref (no NEXT)',
      45: 'invalid xref (no NEXT)',
      47: 'invalid token'
    },
    caption: {
      15: 'image without caption',
      21: 'image with empty caption',
      25: 'code without caption'
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
    if (errorsFound !== expectedErrorCount) {
      console.log(found)
    }
    assert.strictEqual(errorsFound, expectedErrorCount)
  })
})
