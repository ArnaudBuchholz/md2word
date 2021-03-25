'use strict'

const assert = require('assert')
const marked = require('marked')
const linter = require('../../linter')

const pass = markdown => { return () => linter(marked.lexer(markdown)) }
const fail = markdown => { return () => assert.throws(() => linter(marked.lexer(markdown))) }

describe('linter', () => {
  describe('listings', () => {
    const code = '```'
    it('fails when no caption', fail(`
${code}
This is a sample listing
${code}
`))
  })
})