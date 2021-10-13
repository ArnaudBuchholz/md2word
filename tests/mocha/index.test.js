'use strict'

const assert = require('assert')
const { join } = require('path')
const tests = join(__dirname, '..')
const md2word = require('../../index')

describe('index', () => {
  it('reports on errors', async () => {
    const { errors } = await md2word(join(tests, 'linter/boxes.md'))
    assert.notStrictEqual(errors, undefined)
    assert.strictEqual(errors.length, 5)
  })

  describe('checks code', () => {
    it('validates code', async function () {
      this.timeout(10000)
      const { errors } = await md2word(join(tests, 'sample.md'))
      assert.strictEqual(errors, undefined)
    })

    it('generates errors on code', async function () {
      this.timeout(10000)
      const { errors } = await md2word(join(tests, 'bad_code.md'))
      assert.notStrictEqual(errors, undefined)
      assert.strictEqual(errors.length, 1)
    })

    it('generates errors on linter error', async function () {
      this.timeout(10000)
      const { errors } = await md2word(join(tests, 'bad_linter.md'))
      assert.notStrictEqual(errors, undefined)
      assert.strictEqual(errors.length, 1)
    })
  })
})
