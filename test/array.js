'use strict'

const ezstruct = require('..')

// create context

var context = ezstruct`
typedef int int_arr_t[4];

typedef struct {
  int arr[4];
  int_arr_t aliasd;
  int arr_2d[4][4];
  int_arr_t arr_aliasd[3];

  char strs[4][16];
} item_t;
`

// you can set encoding for string[] (aka. char[][])

context.item_t.strs.encoding = 'utf-8'

var test_raw = "0100000002000000030000000400000005000000060000000700000008000000070000000c000000010000000e000000020000000d000000080000000b00000010000000030000000a0000000500000009000000060000000f000000040000000c000000010000000e000000070000000d000000080000000b00000002000000030000000a000000050000001000000048656c6c6f000000000000000000000057656c636f6d65000000000000000000746f2075736500000000000000000000657a5374727563740000000000000000"
var test_obj = {
  arr: [1, 2, 3, 4],
  aliasd: [5, 6, 7, 8],
  arr_2d: [
    [7, 12, 1, 14],
    [2, 13, 8, 11],
    [16, 3, 10, 5],
    [9, 6, 15, 4],
  ],
  arr_aliasd: [
    [12, 1, 14, 7],
    [13, 8, 11, 2],
    [3, 10, 5, 16],
  ],
  strs: [
    "Hello",
    "Welcome",
    "to use",
    "ezStruct"
  ]
}

// JS to binary
var raw = context.item_t.toBinary(test_obj)

// binary to JS
var unpacked = context.item_t.fromBinary(Buffer.from(test_raw, 'hex'))

// assert
var assert = require('assert')
assert.equal(raw.toString('hex'), test_raw, "pack to binary")
assert.deepEqual(unpacked, test_obj, "decode from binary")
