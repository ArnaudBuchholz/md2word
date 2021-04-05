module.exports = {
  'names': [ 'non-formatted-header' ],
  'description': 'Formatted headers are forbidden',
  'tags': [ 'word' ],
  'function': function rule(params, onError) {
    console.log(params.tokens)
/*
    params.tokens.filter(function filterToken(token) {
      return token.type === 'blockquote_open';
    }).forEach(function forToken(blockquote) {
      var lines = blockquote.map[1] - blockquote.map[0];
      onError({
        'lineNumber': blockquote.lineNumber,
        'detail': 'Blockquote spans ' + lines + ' line(s).',
        'context': blockquote.line.substr(0, 7)
      });
    });
*/
  }
}