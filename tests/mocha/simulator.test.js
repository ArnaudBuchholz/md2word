'use strict'

const assert = require('assert')
const simulator = require('../simulator')

const test = (source, expected) => it(source.replace(/\n/g, ','), () => {
  const html = simulator(source)
  assert.strictEqual(html, expected)
})

describe('simulator', () => {

  test('text Hello World', 'Hello World<cursor/>')

  test(`text Hello World
left 11`, '<cursor/>Hello World')

  test(`text Hello World
left 5`, 'Hello <cursor/>World')

  test(`text Hello World
left 5
select 5`, 'Hello <selected>World</selected><cursor/>')

})

