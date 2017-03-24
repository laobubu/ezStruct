'use strict'

const ezstruct = require('..')

// create context

var context = ezstruct `
typedef enum DAY {
  saturday,       /* Names day and declares a       */
  sunday = 0,     /* variable named workday with    */
  monday,         /* that type                      */
  tuesday,
  wednesday,      /* wednesday is associated with 3 */
  thursday,
  friday
} day_t;

enum PRIORITY {
  HIGH = 3, MIDDLE = 2, LOW = 1
};

typedef struct {
  day_t day;
  enum PRIORITY priority;
  char plan[32];
} todo;
`

// (optional) modify scheme. useful for char[]

context.todo.plan.default = "No Plan"
context.todo.plan.encoding = "utf-8"

// JS to binary

var raw = context.todo.toBinary({
  day: context.day_t.monday,
  priority: context["enum PRIORITY"].HIGH,
  plan: "做羞羞的事情"
})

// binary to JS

var unpacked = context.todo.fromBinary(raw)
console.log(unpacked)
