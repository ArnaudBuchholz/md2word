'use strict'

const nop = token => console.log(token) // () => {}

const escape = text => text
  .replace(/%/g, '%%')
  .replace(/\n?\n/g, '%N')

const renderers = {
  heading ({ depth, text }) { this.output('heading', depth, text) },
  paragraph ({ tokens }) {
    this.output('begin-paragraph')
    render.call(this, tokens)
    this.output('end-paragraph')
  },
  text ({ text }) { this.output('text', escape(text)) },
  space () {},
  code ({ text }, index, tokens) {
    const next = tokens[index + 1]
    this.output('code-block', escape(text))
    this.output('code-block-caption', next.tokens[0].tokens[0].text)
  },
  blockquote (token) {
    if (token._ignore) {
      return
    }
    const [title, ...contentBlockquotes] = token.tokens
    this.output('begin-box')
    this.output('box-title', title.tokens[0].text)
    contentBlockquotes.forEach(({ tokens }) => {
      render.call(this, tokens)
    })
    this.output('end-box')
  },
  strong ({ text }) { this.output('bold', text) },
  em ({ text }) { this.output('italic', text) },
  codespan ({ text }) { this.output('code-span', text) }
}

function render (tokens) {
  tokens.forEach((token, index) => (renderers[token.type] || nop).call(this, token, index, tokens))
}

module.exports = (tokens, output) => render.call({ output }, tokens)
