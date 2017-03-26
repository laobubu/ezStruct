# ezStruct for Node.js

Easiest way to pack/unpack struct data with three steps in Node.js.

1. Provide C-style struct declarations (intact C source code) and get the context
2. Fetch the struct Schema from the context
3. Pack / Unpack data.

## What's Supported

- typedef (also works for struct, enum and array)
- (multi-dimension) array
- (nested) struct
- enum
- anonymous enum/struct
- basic number types (little-endian {8,16,32}-bit integer, 32-bit float and double)
- `char something[64]` as string

## Quickstart

[![npm version](https://badge.fury.io/js/ezstruct.svg)](https://www.npmjs.com/package/ezstruct)

Install via: `npm install --save ezstruct`

```js
const ezstruct = require('ezstruct')

// create context
// ES6 template tag is supported.

var context = ezstruct `
typedef uint32_t uid_t;

typedef struct {
  uid_t id;
  int age;
  char name[32];
} student;
`

// then you can use `context.student` the schema

// (optional) modify schema. useful for char[]

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

## Document

### Context

Context is an object containing all data type declarations and handlers(parser/writer).
By default, it contains `int{8,16,32}`, `char[]`, `bool` and some common types.

Call `ezstruct = require('ezstruct')` and get the **context builder function**.

#### ezstruct(source[, context])

- `source: string` C-style declarations. You may get this from C header files.
- `context: Context` optional. The new Context can inherit types from another Context.
- (returns) Context

Once you get the Context, you may get data-type **Schema**s like `ctx["struct tm"]`,
or `ctx.timer_t` if it's declared.

### Schema

Every schema has these properties:

- `bytes: number` the length of one instance

And these methods:

#### read(buf, offset)

- `buf: Buffer` where ezStruct parses data from
- `offset: number` the offset (in bytes) of data
- (returns) data it read

#### write(buf, offset, value)

- `buf: Buffer` where data shall be written to
- `offset: number` the offset (in bytes) of data
- `value` your data

### Struct (Schema)

**Struct** comes from struct declarations. Plus, it provides these properties:

- `struct: StructItem[]` containing the sort of items.
- `fields: {your_var_name: StructItem}` the dict version of struct.
- *`your_var_name: StructItem`* same as `fields.your_var_names`. if not conflicted.

methods:

#### fromBinary(buf[, offset])

- `buf: Buffer` where ezStruct parses data from
- `offset: number` the offset in bytes. 0 by default.

#### toBinary(obj)

- `obj: object` the thing to be packed
- (returns) Buffer

#### toBinary(obj, buf, offset)

- `obj: object` the thing to be packed
- `buf: Buffer` which stores the binary
- `offset: number`

#### StructItem (sub-class from Struct)

Properties:

- `name: string`
- `type: string` like `"int"` or `"char[128]"`
- `default: any` (optional) default value
- `encoding: string` (optional) only for `char[]`, `char[3][128]` and so on

### Enum (Schema)

It is an alias of `int`, with extra properties:

- `dict: {enum_item_name: number}` a dict object
- *`enum_item_name: number`* same as `dict.enum_item_name`. if not conflicted.

## TO-DO

- union
- big-endian
- set char encoding with comments
