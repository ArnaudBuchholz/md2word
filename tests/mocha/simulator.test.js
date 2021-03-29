'use strict'

const assert = require('assert')
const simulator = require('../simulator')

const test = (source, expected) => it(source.replace(/\n/g, ','), () => {
  const html = simulator(source)
  assert.strictEqual(html, expected)
})

describe('simulator', () => {

  test('text Hello World', 'Hello World<cursor/>')

})

