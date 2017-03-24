# ezStruct for Node.js

Easiest way to pack/unpack struct data with three steps in Node.js.

1. Provide C-style struct declarations (intact C source code) and get the context
2. Fetch the struct Schema from the context
3. Pack / Unpack data.

## Quickstart

```js
const ezstruct = require('ezstruct')

// create context

var context = ezstruct `
typedef uint32_t uid_t;

typedef struct {
  uid_t id;
  int age;
  char name[32];
} student;

// then you can use context.student
`

// (optional) modify scheme. useful for char[]

context.student.name.default = "Unknown"
context.student.name.encoding = "utf-8"

// JS to binary

var raw = context.student.toBinary({
  id: 12345678,
  age: 19,
})

// binary to JS

var unpacked = context.student.fromBinary(raw)
```

## To-Do

- enum
- union
- big-endian
- set char encoding at `typedef`
