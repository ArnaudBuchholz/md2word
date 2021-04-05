'use strict'

const assert = require('assert')
const marked = require('marked')
const linter = require('../../linter')

const pass = (title, markdown) => it(`accepts ${title}`, () => linter(marked.lexer(markdown)))
const fail = (title, markdown) => it(`rejects ${title}`, () => assert.throws(() => linter(marked.lexer(markdown))))

describe('linter', () => {
  describe('heading', () => {
    pass('4 levels of depth', `
# depth 1
## depth 2
### depth 3
#### depth 4
`)

    fail('deeper than 4', '##### depth 5')
    fail('formatted content', '# *test*')
  })

  describe('listings', () => {
    const code = '```'

    pass('with caption', `
${code}
This is a sample listing
${code}
> This is the listing caption
`)

    fail('without caption', `
${code}
This is a sample listing
${code}
`)

    fail('with formatted caption', `
${code}
This is a sample listing
${code}
> This is *formatted*
`)
  })

  describe('boxes', () => {
    pass('box syntax', `
> title
>> content
`)

    fail('multiple titles', `
> title 1
> title 2
>> content
`)

    fail('formatted title', `
> *title* 1
>> content
`)
  })
})
