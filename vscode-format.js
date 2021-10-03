// Use CTRL+SHIFT+P and "Markdown: Change preview security settings"

const style = document.createElement('style')
style.appendChild(document.createTextNode(`

blockquote {
  background-color: unset;
  border: 0;
  padding: 0;
  margin: 0;
}

blockquote.caption {
  font-style: italic;
  color: gray;
  margin-bottom: 2rem;
}

blockquote.box-title {
  font-weight: bold;
  color: black;
  background-color: gray;
  margin-top: 1rem;
  margin-bottom: 1rem;
}

blockquote.box-content {
  font-weight: normal;
  padding: 4px;
  color: white;
  background-color: #444444;
}

`))
document.body.appendChild(style)

const listings = []
const figures = []
const bookmarks = {}

const blockquotes = [].slice.call(document.querySelectorAll('blockquote'))
blockquotes.forEach(blockquote => {
  if (blockquote.querySelector('blockquote')) {
    blockquote.classList.add('box-title')
    const p = blockquote.querySelector('p')
    p.innerHTML = '&nbsp;' + p.innerText
  } else if (blockquote.parentElement.tagName.toLowerCase() === 'blockquote') {
    blockquote.classList.add('box-content')
  } else {
    blockquote.classList.add('caption')
    const previousTag = blockquote.previousElementSibling.tagName.toLowerCase()
    let id
    let type
    if (previousTag === 'pre') {
      listings.push(blockquote)
      id = `Listing ${listings.length}`
      type = 'code'
    } else {
      figures.push(blockquote)
      id = `Figure ${figures.length}`
      type = 'image'
    }
    let label = blockquote.innerText
    const match = label.match(/\{\{xref:([a-z0-9_]+)\}\}/i)
    if (match) {
      const ref = match[1]
      label = label.replace(match[0], '').trim()
      bookmarks[ref] = id
    }
    const link = document.createElement('a')
    link.setAttribute('name', id)
    link.dataset.type = type
    blockquote.parentElement.insertBefore(link, blockquote)
    blockquote.innerText = `${id} : ${label}`
  }
})

const links = [].slice.call(document.querySelectorAll('a[href]'))
links.forEach(link => {
  const label = link.innerText
  const url = link.getAttribute('href')
  const span = document.createElement('span')
  span.appendChild(document.createTextNode(label))
  span.appendChild(document.createTextNode(' ('))
  const a = span.appendChild(document.createElement('a'))
  a.setAttribute('href', url)
  a.appendChild(document.createTextNode(url))
  span.appendChild(document.createTextNode(')'))
  link.parentElement.replaceChild(span, link)
})

function substituteCrossRefs () {
  const reSplitRef = /(\{\{xref:(?:NEXT|PREVIOUS|[a-z0-9_]+)\}\})/i
  const reExtractRef = /\{\{xref:(NEXT|PREVIOUS|[a-z0-9_]+)\}\}/i
  let previous
  let next
  function walk (node) {
    if (node.nodeType === 3) {
      const text = node.nodeValue
      const parts = text.split(reSplitRef)
      if (text.trim().length && parts.length > 1) {
        const parentElement = node.parentElement
        const span = document.createElement('span')
        parentElement.replaceChild(span, node)
        parts.forEach(part => {
          const match = part.match(reExtractRef)
          if (match) {
            const xref = match[1]
            const link = span.appendChild(document.createElement('a'))
            let id
            if (xref === 'NEXT') {
              next = link
              id = 'NEXT'
            } else if (xref === 'PREVIOUS') {
              id = previous
            } else {
              id = bookmarks[xref]
            }
            if (id) {
              link.setAttribute('href', `#${id}`)
              link.appendChild(document.createTextNode(id))
            }
          } else {
            span.appendChild(document.createTextNode(part))
          }
        })
      }
    }
    if (node.nodeType === 1) {
      if (node.tagName.toLowerCase() === 'a') {
        const id = node.getAttribute('name')
        if (id && node.dataset.type) {
          previous = id
          if (next) {
            next.setAttribute('href', `#${id}`)
            next.innerHTML = ''
            next.appendChild(document.createTextNode(id))
            next = undefined
          }
        }
      } else {
        [].slice.call(node.childNodes).forEach(walk)
      }
    }
  }
  walk(document.body)
}
substituteCrossRefs()
