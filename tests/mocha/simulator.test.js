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
  test(0, 'type Hello World', 'Hello World<cursor/>')

  test(1, `type Hello World
left 11`, '<cursor/>Hello World')

  test(2, `type Hello World
left 5`, 'Hello <cursor/>World')

  test(3, `type Hello 
type World
left 5`, 'Hello <cursor/>World')

  test(4, `type Hello 
type Wor
type ld
left 5`, 'Hello <cursor/>World')

  test(5, `type Hello World
left 5
select 5`, 'Hello <selected>World</selected><cursor/>')

  test(6, `type Hello World
left 5
select 5
format bold`, 'Hello <b><selected>World</selected></b><cursor/>')

  test(7, `type Hello World
left 5
select 5
format bold
right 1`, 'Hello <b>World</b><cursor/>')

  test(8, `type Hello World
left 5
select 5
format bold
left 1`, 'Hello <cursor/><b>World</b>')

  test(9, `type Hello World
left 11
select 11
format bold
right 1
left 5
select 5
format italic
right 1`, '<b>Hello <i>World</i></b><cursor/>')

  test(10, `type Chapter 1
left 9
select 9
format header1
enter
type Hello World
left 5
select 5
format bold
left 1
right 2
select 2
format italic
right 1`, '<h1>Chapter 1</h1>Hello <b>Wo<i>rl</i><cursor/>d</b>')

  test(11, `type Chapter 1
left 9
select 9
format header1
enter
type Hello World
left 5
select 5
format bold
left 1
right 2
select 2
format italic
right 1
select 1`, '<h1>Chapter 1</h1>Hello <b>Wo<i>rl</i><selected>d</selected></b><cursor/>')

  test(12, `type Chapter 1
left 9
select 9
format header1
enter
type Hello World
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

  test(13, `type Chapter 1
left 9
select 9
format header1
enter
type Hello World
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

  test(14, `type Box header
left 10
select 10
format box_header
enter
type This is some formatted box content
left 34
select 34
format box_content
left 1
right 13
select 9
format bold
right 13
enter`, '<div class="box_header">Box header</div><div class="box_content">This is some <b>formatted</b> box content</div><cursor/>')

  test(15, `type path.jpg
left 8
select 8
format image
enter
`, '<img src="path.jpg"><cursor/>')

  test(16, `type item 1
left 6
select 6
format bullet_list 1
enter
type item 2
left 6
select 6
format bullet_list 1
enter
`, '<ul><li>item 1</li><li>item 2</li></ul><cursor/>')

  test(17, `type item 1
left 6
select 6
format bullet_list 1
enter
type item 2
left 6
select 6
format bullet_list 1
enter
type title
left 5
select 5
format header1
enter
`, '<ul><li>item 1</li><li>item 2</li></ul><h1>title</h1><cursor/>')

  test(18, `type item 1
left 6
select 6
format bullet_list 1
enter
type item 2
left 6
select 6
format bullet_list 2
enter
`, '<ul><li>item 1</li><ul><li>item 2</li></ul></ul><cursor/>')

  test(19, `type item 1
left 6
select 6
format bullet_list 1
right 1
enter
type item 2
left 6
select 6
format bullet_list 2
right 1
enter
type item 3
left 6
select 6
format bullet_list 2
right 1
enter
type item 4
left 6
select 6
format bullet_list 1
right 1
enter`, '<ul><li>item 1</li><ul><li>item 2</li><li>item 3</li></ul><li>item 4</li></ul><cursor/>')

  test(20, `type A
left 1
select 1
format bullet_list 1
right 1
enter
type B
left 1
select 1
format bullet_list 2
right 1
enter
type C
left 1
select 1
format bullet_list 2
right 1
enter
type D
enter`, '<ul><li>A</li><ul><li>B</li><li>C</li></ul></ul>D<br><cursor/>')

  test(21, `type A
left 1
select 1
format order_list 1
right 1
enter
type B
left 1
select 1
format order_list 2
right 1
enter
type C
left 1
select 1
format order_list 2
right 1
enter
type D
left 1
select 1
format order_list 1
enter
type E
enter`, '<ol><li>A</li><ol><li>B</li><li>C</li></ol><li>D</li></ol>E<br><cursor/>')

  test(22, `type md2word (https://www.npmjs.com/package/md2word)
left 47
select 7
format url_title
right 3
select 37
format url
right 2
enter`, '<span class="url_title">md2word</span> (<a href="https://www.npmjs.com/package/md2word">https://www.npmjs.com/package/md2word</a>)<br><cursor/>')
})
