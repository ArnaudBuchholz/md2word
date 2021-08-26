# How to use this 'converter'

You can find the most important and useful features of the converter in this sample.
Now let’s see what you can do with the converter.

![Markdown](markdown.png)

> Markdown logo

## Heading Styles

The converter supports up to 4 heading styles.

```text
# Level 1
## Level 2
### Level 3
#### Level 4
```

> Example of heading styles

The next is a note

> Note title (unformatted)
>> This is the note content. You may use *formatting* as well

## Text styles

The styles are distinguished by font and paragraph styles.
A font style is only assigned to a single word within a paragraph
(e.g., “**Bold**,” “*Italic*,” or “`Programming Element`”),
while a paragraph style is assigned to an entire paragraph
(e.g., "Normal" or "Bullet List").

```text
**Bold**
*Italic*
`Programming Element`
```

> Examples of word formatting

It is possible to combine them : **Hello *World***

### Paragraph Styles

No good, entertaining publication will only consist of standard paragraphs
like this one. To present your content and to make your E-Bite look more
interesting, you want to use lists, tables, boxes, code listings, and more.

### Lists

All lists are created from the styles under the Lists button in the
Publishing tab. Your first option is the bullet list. Bullet lists are used
for listing items that come in no particular order.

* Bullet lists are created via the Bullet List style.
* And they must have at least two items

A second paragraph within a bulleted list is **not** indented and gets its own style
assigned to it: Bullet List Indent. If a bullet list item is accompanied by
a Bullet List Indent style, the main bulleted item should appear in bold
(as it is above).

```text
Listing code within bulleted lists should be tagged with the Bullet List
Listing style in the Listing section.
```

> A listing should have a Listing Caption

* Some lists have sub-bullets.
  * Sub-bullets are created using the Bullet List Under style.
  * However, if you use one sub-bullet, there must always be a second (or third).
* But a list must always have two bullets

We also have the option for numbered lists. Numbered lists should be used for
steps in a process; they imply that steps are being performed in a particular order.

1. The first item in the list has its own style: Numbered List 1st.
2. The second and all following items have all the same style:
Numbered List 2.-n. (Don’t worry: The final typeset version of the book will
show the correct numbering.) You can use the Bullet List Listing style
(from the Listing section) with numbered lists.

You can use the Bullet List Indent style to start a new paragraph within numbered
lists.

* Numbered Lists can also have sub-bullets. Use Bullet List Under for this.
  You can use the Bullet List Under Indent style to start a new paragraph within
  numbered lists.
* And in case you need a really deeply structured list, you can even have sub-sub-bullets:
  * This is a Bullet List Under Under.
  * And another one.

### Code

```javascript
// This is a javascript comment
function div (a, b) {
  return a / b;
}

assert.strictEqual(div(1, 1), 1);
```

> JavaScript example

This is a very long line that goes way beyond the expected eighty characters. It is done on purpose to enable rule configuration.
