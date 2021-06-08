'use strict'

const assert = require('assert')
const simulator = require('../simulator')

const test = (source, expected) => {
  let label = source.replace(/\n/g, ',')
  if (label.length > 70) {
    label = label.substring(0, 67) + '...'
  }
  it(label, () => {
    const html = simulator(source)
    assert.strictEqual(html, expected)
  })
}

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
format bold`, 'Hello <b><selected>World</selected></b><cursor/>')

  test(`text Hello World
left 5
select 5
format bold
right 1`, 'Hello <b>World</b><cursor/>')

  test(`text Hello World
left 11
select 11
format bold
left 5
select 5
format italic
right 1`, '<b>Hello <i>World</i></b><cursor/>')

  test(`text Chapter 1
left 9
select 9
format header1
enter
text Hello World
left 5
select 5
format bold
left 3
select 2
format italic
select 1
format underline
right 1`, '<h1>Chapter 1</h1>Hello <b>Wo<i>rl</i><u>d</u></b><cursor/>')

  test(`text Chapter 1
left 9
select 9
format header1
enter
text Hello World
left 5
select 5
format bold
left 3
select 2
format italic
select 1
format underline
enter`, '<h1>Chapter 1</h1>Hello <b>Wo<i>rl</i><u>d</u></b><br><cursor/>')
})
