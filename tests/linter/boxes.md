# Boxes

debug

## Valid box description

> This is an unformatted title
>> This is a content that can be **formatted**
>> with any other *content*

## Not a box

> This is not a *box* because not followed by a deeper blockquote

Another example :

> This is not a *box* because not immediately followed by a deeper blockquote
<!-- markdownlint-disable-next-line -->

>> Test

## Invalid boxes

### Formatted title

> This is an **invalid** box
>> Because the title is formatted

### Title is split on two lines

> This is an invalid box
> because the title is split on two lines
>> I don't think we will need it

### Content after the body

> This is an invalid box
>> This is the formatted content
> Back to level 1... should not be allowed

**NOTE** : the above seems to be parsed incorrectly by markdown-it (it is merged with the formatted content)

## Last valid box description

To assess that previous errors does not alter parsing

> This is an unformatted title
>> This is a content that can be **formatted**
>> with any other *content*
