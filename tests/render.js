const { body } = require('reserve')
const md = require('markdown-it')()
const renderer = require('../renderer')

module.exports = async (request, response) => {
  const markdown = await body(request)
  const instructions = []
  const tokens = await md.parse(markdown)
  renderer(tokens, instruction => instructions.push(instruction))
  const script = instructions.join('\n')
  const length = (new TextEncoder().encode(script)).length
  response.writeHead(200, {
    'content-type': 'text/plain; charset=utf-8',
    'content-length': length
  })
  response.end(script)
}