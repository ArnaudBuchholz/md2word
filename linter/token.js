module.exports = {
  names: ['md2word/token'],
  description: 'Token validation',
  tags: ['md2word'],
  function: (params, onError) => {
    /*
      Allowed tokens (everywhere BUT caption, header)
        `<<xref:NEXT>>` references the next immediate code or image
        `<<xref:PREVIOUS>>` references the previous immediate code or image
        `<<xref:id>>` references the code or image flagged with `id`

      id syntax : [a-z0-9_]+

      only <<xref:id>> in a caption
    */
  }
}
