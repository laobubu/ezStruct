'use strict'

const ezstruct = require('..')
ezstruct.setStringEncoding('utf-8')

// create context

var context = ezstruct`
typedef struct {
  char strs[4][16];
  char str_utf8[64];
  char str_gbk[64];
} item_t;
`
context.item_t.str_gbk.encoding = 'gbk'


var test_obj = {
  strs: ["Hello", "Welcome", "to use", "ezStruct"],
  str_utf8: "但愿毕设别出幺蛾子",
  str_gbk: "但愿毕设别出幺蛾子",
}
var test_raw = "48656c6c6f000000000000000000000057656c636f6d65000000000000000000746f2075736500000000000000000000657a5374727563740000000000000000e4bd86e684bfe6af95e8aebee588abe587bae5b9bae89bbee5ad9000000000000000000000000000000000000000000000000000000000000000000000000000b5abd4b8b1cfc9e8b1f0b3f6e7dbb6ead7d300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"

// JS to binary
var raw = context.item_t.toBinary(test_obj)

// binary to JS
var unpacked = context.item_t.fromBinary(Buffer.from(test_raw, 'hex'))

// assert
var assert = require('assert')
assert.equal(raw.toString('hex'), test_raw, "pack to binary")
assert.deepEqual(unpacked, test_obj, "decode from binary")
