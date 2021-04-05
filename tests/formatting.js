'use strict'

require('colors')

const tty = process.stdout
const write = text => tty.write(text)
const moveCursor = (x, y = 0) => new Promise(resolve => tty.moveCursor(x, y, resolve))

async function main () {
  console.log(`
${'First heading'.inverse.underline}
${'Second heading'.underline}
This is an ${'example'.bold} of ${'text'.italic}
`)

  write('Hello World')
  await moveCursor(-5)
  write('World'.bold)
  write('\n')
  await moveCursor(0, -1)
  write('Hello'.italic)
  await moveCursor(-5, 1)
  write('.\n')
}

main()
