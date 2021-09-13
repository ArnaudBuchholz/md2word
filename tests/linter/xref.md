# XREF tokens

## Edge case

This {{xref:PREVIOUS}} does not exist

## Valid use case

The {{xref:NEXT}} is a JavaScript example

```javascript
// This is a javascript comment
function div (a, b) {
  return a / b;
}

assert.strictEqual(div(1, 1), 1);
```

> {{xref:JS_SAMPLE}} JavaScript example

The {{xref:PREVIOUS}} can also be referenced **after** it was used.
Or it can be referenced in any part in the document, as shown in {{xref:JS_SAMPLE}}

## Invalid syntaxes

{{xref}}
{{xref:}}
{{xref:A^B}}
{{xref:A-B}}

## Invalid use cases

Pointing to a non existing xref should be an error : {{xref:NOT_EXISTING}}

> In a box title, no {{xref:NOT_HERE}}
>> Because this is a box (where it is {{xref:JS_SAMPLE}})

### In a subtitle {{xref:NOT_HERE}}

### Final edge case

This {{xref:NEXT}} does not exist
