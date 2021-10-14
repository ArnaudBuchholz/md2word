'use strict'

const assert = require('assert')
const simulator = require('../../simulator')
const { basename, extname, join } = require('path')
const { readdir, readFile } = require('fs').promises

const folder = join(__dirname, '../simulator')

async function main () {
  const tests = (await readdir(folder))
    .filter(name => extname(name) === '.txt')

  describe('simulator', () => {
    tests.forEach(name => {
      const testName = basename(name, '.txt')
      it(testName, async () => {
        const source = (await readFile(join(folder, name))).toString()
        let expected
        try {
          expected = (await readFile(join(folder, `${testName}.html`))).toString().replace(/\r\n/g, '\n')
        } catch (e) {
          // no HTML found, expects an error
        }
        try {
          const html = simulator(source)
          assert.strictEqual(html, expected)
        } catch (e) {
          // console.log(e)
          assert.strictEqual(expected, undefined)
        }
      })
    })
  })
}

main()
