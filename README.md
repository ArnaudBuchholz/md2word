# md2word

Markdown to word automation

## Concept

**Markdown** is easy to learn and write *(see this [guide](https://www.markdownguide.org/))*. It can be **validated** (using [markdownlint](https://www.npmjs.com/package/markdownlint)) and **automated** (using [markdown-it](https://www.npmjs.com/package/markdown-it)).

Hence this is the perfect syntax to **collaborate** when writing a book.

However, publishers are expecting to receive a Word document.

This tool was created to automate the rendering of a markdown page inside a word document using styles.

## Commands

Basically, the markdown file is parsed and broken down into a set of **instructions**.

For instance, the following markdown :

```
# This is an example

This text is **bolded and *italic***, so cool !
````

Would generate this list of instructions :
```
text This is an example
left 18
select 18
format header1
enter
text text is bolded and italic, so cool !
left 28
select 17
format bold
left 6
select 6
format italic
right 11
enter
```

### List of commands

| Command | Parameter | Explanation |
|---|---|---|
| text | escaped text (%N instead of carriage return) | type some text. Cursor is set after the text. |
| left | character count | Moves the cursor to the left |
| right | character count | Moves the cursor to the right |
| select | character count | Moves the cursor to the right and selects underlying text |
| format | style name | Format the current selection with the style |

### List of styles

| Style name | Effect |
|---|---|
| header1 | <h1>Header level 1</h1> |
| header2 | <h2>Header level 2</h2> |
| header3 | <h3>Header level 3</h3> |
| header4 | <h4>Header level 4</h4> |
| bold | **bold** |
| italic | *italic* |
| underline | <u>underline</u> |
| code | <code>code</code> |
| caption | <figcaption>code or figure caption</figcaption> |
| inline_code | <samp>inline code</samp> |