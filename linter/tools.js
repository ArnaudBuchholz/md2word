class TokensExtensions {
  constructor () {
    this._tokens = []
    this._extensions = []
  }

  set (token, name, value) {
    let index = this._tokens.indexOf(token)
    let extensions
    if (index === -1) {
      index = this._tokens.length
      this._tokens.push(token)
      extensions = {}
      this._extensions.push(extensions)
    } else {
      extensions = this._extensions[index]
    }
    extensions[name] = value
  }

  get (token, name) {
    const index = this._tokens.indexOf(token)
    if (index === -1) {
      return undefined
    }
    return this._extensions[index][name]
  }
}

module.exports = {
  TokensExtensions
}
