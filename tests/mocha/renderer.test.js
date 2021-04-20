'use strict'

const assert = require('assert')
const md = require('markdown-it')()
const renderer = require('../../renderer')
const simulator = require('../simulator')
const { basename, extname, join } = require('path')
const { readdir, readFile } = require('fs').promises

const folder = join(__dirname, '../renderer')

async function main () {
  const tests = (await readdir(folder))
    .filter(name => extname(name) === '.md')

  describe('renderer', () => {
    tests.forEach(name => {
      const testName = basename(name, '.md')
      it(testName, async () => {
        const markdown = (await readFile(join(folder, name))).toString()
        const expected = (await readFile(join(folder, `${testName}.html`))).toString()
        const tokens = await md.parse(markdown)
        const commands = []
        renderer(tokens, command => commands.push(command))
        const html = simulator(commands.join('\n'))
        assert.strictEqual(html, expected + '<cursor/>')
      })
    })
  })
}

main()
