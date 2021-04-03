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

  test(`text Hello 
text World
left 5`, 'Hello <cursor/>World')

  test(`text Hello 
text Wor
text ld
left 5`, 'Hello <cursor/>World')

  test(`text Hello World
left 5
select 5`, 'Hello <selected>World</selected><cursor/>')

  test(`text Hello World
left 5
select 5
format b`, 'Hello <b><selected>World</selected></b><cursor/>')

  test(`text Hello World
left 5
select 5
format b
right 1`, 'Hello <b>World</b><cursor/>')

  test(`text Hello World
left 11
select 11
format b
left 5
select 5
format i
right 1`, '<b>Hello <i>World</i></b><cursor/>')

})
