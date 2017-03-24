'use strict'

const ezstruct = require('..')

// create context

var context = ezstruct `
typedef uint32_t uid_t;

typedef struct {
  uid_t id;
  int age;
  char name[32];
} student;
`

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
