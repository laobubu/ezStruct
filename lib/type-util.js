'use strict'

/**
 * generate type handle. can be added to context.
 *
 * ```c
 * typedef uint32_t something[16];
 * typedef struct something sshort;
 * // turns to javascript:
 * handler = generateTypeHandle(xxx, "uint32_t", "something[16]");
 * handler = generateTypeHandle(xxx, "struct xx", "xx_t"); //[^1]
 * ```
 *
 * [^1]: note that it returns the same Schema,
 * if this is not an array.
 *
 * @param {typeHandleContext} context
 * @param {string} origin
 * @param {string} newName
 */
function generateTypeHandle(context, origin, newName) {
  const Struct = require('./struct')
  const Enum = require('./enum')

  newName = newName.replace(/^\s+|\s*;?\s*$/g, '')

  var handler = context[origin]
  var arrS = /^([^\s\[]+)\s*\[(\d+(?:\]\s*\[\d+)*)\]$/.exec(newName)

  if (!handler) {
    var originNotFound = "origin type " + origin + " not found."
    throw new Error(originNotFound)
  }

  if (arrS) {
    // get the dimensions. eg. int sth[2][5][6] ==>
    var _name = arrS[1]  // sth
    var _origin = origin + '[' + arrS[2] + ']' // int[2][5][6]
    var arrlens = arrS[2].split(/\]\s*\[/).map(i => ~~i).reverse() // [6,5,2]  low-level first

    for (let ii = 0; ii < arrlens.length; ii++) {
      let arrlen = arrlens[ii]
      let readFunc, writeFunc
      let ibytes = handler.bytes

      if (typeof handler.readArray !== 'function') {
        readFunc = createReadArray(handler.read, arrlen, ibytes)
      } else {
        let readArrayFunc = handler.readArray
        readFunc = function (buf, off) { return readArrayFunc.call(this, arrlen, buf, off) }
      }

      if (typeof handler.writeArray !== 'function') {
        writeFunc = createWriteArray(handler.write, arrlen, ibytes)
      } else {
        let writeArrayFunc = handler.writeArray
        writeFunc = function (buf, off, val) { return writeArrayFunc.call(this, arrlen, buf, off, val) }
      }

      handler = {
        _name: _name,
        _origin: _origin,
        bytes: handler.bytes * arrlen,
        read: readFunc,
        write: writeFunc,
      }
    }
  }

  return handler
}

function createReadArray(read_handle, arrlen, unit_bytes) {
  return function (buf, offset) {
    var retval = new Array(arrlen)
    for (var i = 0; i < arrlen; i++) {
      retval[i] = read_handle.call(this, buf, offset)
      offset += unit_bytes
    }
    return retval
  }
}

function createWriteArray(write_handle, arrlen, unit_bytes) {
  return function (buf, offset, value) {
    var al = value.length
    if (al > arrlen) al = arrlen
    for (var i = 0; i < al; i++) {
      write_handle.call(this, buf, offset, value[i])
      offset += unit_bytes
    }
    return offset
  }
}

module.exports.generateTypeHandle = generateTypeHandle
module.exports.createReadArray = createReadArray
module.exports.createWriteArray = createWriteArray
