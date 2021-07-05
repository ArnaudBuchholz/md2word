# md2word

Markdown to word automation

## Concept

**Markdown** is easy to learn and write *(see this [guide](https://www.markdownguide.org/))*. It can be **validated** (using [markdownlint](https://www.npmjs.com/package/markdownlint)) and **automated** (using [markdown-it](https://www.npmjs.com/package/markdown-it)).

Hence this is the perfect syntax to **collaborate** when writing a document.

However, some book publishers expect to receive a Word document.

This tool was created to automate the rendering of a markdown page inside a word document using styles that can be **customized**.

## Setup

* To install the tool use : `npm install md2word -global`
* To validate and serve a markdown file, simply use `md2word <md filename>`

When the markdown file is served, open Word and executes the formatting macro : an example is provided [here](https://github.com/ArnaudBuchholz/md2word/blob/main/vba/md2word.bas).

## Commands

Basically, the markdown file is parsed and broken down into a set of **instructions**.

For instance, the following markdown :

```
# This is an example

This text is **bolded and *italic***, so cool !
````

Is translated into this list of instructions :
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
| type | escaped text (%N instead of carriage return) | Type some text. Cursor is set after the text. |
| left | character count | Moves the cursor to the left |
| right | character count | Moves the cursor to the right |
| select | character count | Moves the cursor to the right and selects underlying text |
| format | style name | Format the current selection with the style |

### List of styles

| Style name | Style param | Effect |
|---|---|---|
| header1 | <i><small>n/a</small></i> | <h1>Header level 1</h1> |
| header2 | <i><small>n/a</small></i> | <h2>Header level 2</h2> |
| header3 | <i><small>n/a</small></i> | <h3>Header level 3</h3> |
| header4 | <i><small>n/a</small></i> | <h4>Header level 4</h4> |
| bold | <i><small>n/a</small></i> | **bold** |
| italic | <i><small>n/a</small></i> | *italic* |
| underline | <i><small>n/a</small></i> | <u>underline</u> |
| code | language | <code>code</code> |
| caption | <i><small>n/a</small></i> | <figcaption>code or figure caption</figcaption> |
| inline_code | <i><small>n/a</small></i> | <samp>inline code</samp> |
| box_header | <i><small>n/a</small></i> | Box header |
| box_content | <i><small>n/a</small></i> | Box content |
| image | <i><small>n/a</small></i> | Convert the selected path into an image path |
| bullet_list | level (1-based) | * bullet list item |
| order_list | level (1-based) | 1. order list item |
