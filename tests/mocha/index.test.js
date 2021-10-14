'use strict'

const assert = require('assert')
const { join, relative } = require('path')
const tests = join(__dirname, '..')
const md2word = require('../../index')
const { mock } = require('reserve')

describe('index', function () {
  this.timeout(10000)

  it('supports relative path', async () => {
    const cwd = process.cwd()
    const absolute = join(tests, 'linter/boxes.md')
    const relativePath = relative(cwd, absolute)
    const { errors } = await md2word(relativePath)
    assert.strictEqual(errors.length, 5)
  })

  it('exposes a web server', async () => {
    const { script, configuration } = await md2word(join(tests, 'sample.md'))
    const mocked = await mock(configuration)
    const response = await mocked.request('GET', '/script')
    assert.strictEqual(response.toString(), script)
  })

  it('reports on errors', async () => {
    const { errors } = await md2word(join(tests, 'linter/boxes.md'))
    assert.notStrictEqual(errors, undefined)
    assert.strictEqual(errors.length, 5)
  })

  describe('checks code', () => {
    it('validates code', async function () {
      const { errors } = await md2word(join(tests, 'sample.md'))
      assert.strictEqual(errors.length, 0)
    })

    it('generates errors on code', async function () {
      const { errors } = await md2word(join(tests, 'bad_code.md'))
      assert.notStrictEqual(errors, undefined)
      assert.strictEqual(errors.length, 1)
    })

    it('generates errors on linter error', async function () {
      const { errors } = await md2word(join(tests, 'bad_linter.md'))
      assert.notStrictEqual(errors, undefined)
      assert.strictEqual(errors.length, 1)
    })
  })
})
