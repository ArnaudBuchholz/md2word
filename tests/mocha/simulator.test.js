'use strict'

const assert = require('assert')
const simulator = require('../simulator')

const test = (index, source, expected) => {
  let label = source.replace(/\n/g, ',')
  if (label.length > 70) {
    label = label.substring(0, 67) + '...'
  }
  it(`[${index.toString().padStart(2, '0')}] ${label}`, () => {
    const html = simulator(source)
    assert.strictEqual(html, expected)
  })
}

describe('simulator', () => {
  test(0, 'text Hello World', 'Hello World<cursor/>')

  test(1, `text Hello World
left 11`, '<cursor/>Hello World')

  test(2, `text Hello World
left 5`, 'Hello <cursor/>World')

  test(3, `text Hello 
text World
left 5`, 'Hello <cursor/>World')

  test(4, `text Hello 
text Wor
text ld
left 5`, 'Hello <cursor/>World')

  test(5, `text Hello World
left 5
select 5`, 'Hello <selected>World</selected><cursor/>')

  test(6, `text Hello World
left 5
select 5
format bold`, 'Hello <b><selected>World</selected></b><cursor/>')

  test(7, `text Hello World
left 5
select 5
format bold
right 1`, 'Hello <b>World</b><cursor/>')

  test(8, `text Hello World
left 5
select 5
format bold
left 1`, 'Hello <cursor/><b>World</b>')

  test(9, `text Hello World
left 11
select 11
format bold
right 1
left 5
select 5
format italic
right 1`, '<b>Hello <i>World</i></b><cursor/>')

  test(10, `text Chapter 1
left 9
select 9
format header1
enter
text Hello World
left 5
select 5
format bold
left 1
right 2
select 2
format italic
right 1`, '<h1>Chapter 1</h1>Hello <b>Wo<i>rl</i><cursor/>d</b>')

  test(11, `text Chapter 1
left 9
select 9
format header1
enter
text Hello World
left 5
select 5
format bold
left 1
right 2
select 2
format italic
right 1
select 1`, '<h1>Chapter 1</h1>Hello <b>Wo<i>rl</i><selected>d</selected></b><cursor/>')

  test(12, `text Chapter 1
left 9
select 9
format header1
enter
text Hello World
left 5
select 5
format bold
left 1
right 2
select 2
format italic
right 1
select 1
format underline
right 1`, '<h1>Chapter 1</h1>Hello <b>Wo<i>rl</i><u>d</u></b><cursor/>')

  test(13, `text Chapter 1
left 9
select 9
format header1
enter
text Hello World
left 5
select 5
format bold
left 1
right 2
select 2
format italic
right 1
select 1
format underline
enter`, '<h1>Chapter 1</h1>Hello <b>Wo<i>rl</i><u>d</u></b><br><cursor/>')
})
