'use strict'

module.exports = {
  error (mdFileName, lineNumber, label) {
    console.error(`${mdFileName}@${lineNumber}: ${label}`)
  }
}
