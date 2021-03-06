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

## Markdown linter

The [markdown linter](https://www.npmjs.com/package/markdownlint) can be tweaked with a configuration file as described [here](https://github.com/DavidAnson/markdownlint#optionsconfig).
The file must be named `md2word.json` and be placed in the same folder than the markdown file.

Example file :

```json
{
  "default": true,
  "MD013": false,
  "no-hard-tabs": true
}
```

## Code linters

Code linting is made possible through dedicated scripts *(not included)*.

For each language that requires validation, create a file named `<language>.linter.js` in the folder containing the markdown file.

The module is loaded using [`require`](https://nodejs.org/api/modules.html#modules_require_id) and it must only exports one **asynchronous** function taking two parameters :

* `basePath` the folder containing the markdown file being parsed
* `text` the code to validate

The function should resolve to an array of messages containing :

* `line` the line number where the message is generated *(0 based, relative to the text content)*
* `message` the error message

```javascript
module.exports = async function (basePath, text) {
  return [{
    line: 0,
    message: 'Any error'
  }]
}
```

An example of a javascript linter *(based on [standard](https://www.npmjs.com/package/standard))* is provided in [in the repository](https://github.com/ArnaudBuchholz/md2word/blob/main/tests/javascript.linter.js).

## Commands

Basically, the markdown file is parsed and broken down into a set of **commands**.

For instance, the following markdown :

```
# This is an example

This text is **bolded and *italic***, so cool !
````

Is translated into this list of commands :
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
| caption | code / image | <figcaption>code or image caption</figcaption> |
| inline_code | <i><small>n/a</small></i> | <samp>inline code</samp> |
| box_header | <i><small>n/a</small></i> | Box header |
| box_content | <i><small>n/a</small></i> | Box content |
| image | <i><small>n/a</small></i> |??Convert the selected path into an image path |
| bullet_list |??level (1-based) |??* bullet list item |
| order_list |??level (1-based) |??1. order list item |
| box_bullet_list |??level (1-based) |??* bullet list item (in a box) |
| box_order_list |??level (1-based) |??1. order list item (in a box) |
| url_title | <i><small>n/a</small></i> | url name |
| url | <i><small>n/a</small></i> | [url](https://www.npmjs.com/package/md2word) |

**NOTE** : Only URLs using the following link syntax are accepted :
```text
[url name](url_address)
```

And are rendered like the following :

```html
url name (<a href="url_address">url address</a>)
```
