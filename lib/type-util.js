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
 * [^1]: note that it returns the same Struct/Enum instance,
 * if you just want to create an alias for the Struct/Enum.
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
  var arrS = /^(\S+)\s*\[(\d+)\]$/.exec(newName)

  if (!handler) {
    var originNotFound = "origin type " + origin + " not found."
    throw new Error(originNotFound)
  }

  var readFunc = handler.read
  var writeFunc = handler.write
  var ibytes = handler.bytes

  var ret = {
    _name: newName,
    _origin: origin,
    bytes: ibytes,
    read: readFunc,
    write: writeFunc,
  }

  if (arrS) {
    var arrlen = ~~arrS[2]
    ret._name = arrS[1]
    ret._origin += '[' + arrlen + ']'

    if (typeof handler.readArray !== 'function') {
      readFunc = createReadArray(readFunc, arrlen, ibytes)
    } else {
      var readArrayFunc = handler.readArray
      readFunc = function (buf, off) { return readArrayFunc.call(this, arrlen, buf, off) }
    }

    if (typeof handler.writeArray !== 'function') {
      writeFunc = createWriteArray(writeFunc, arrlen, ibytes)
    } else {
      var writeArrayFunc = handler.writeArray
      writeFunc = function (buf, off, val) { return writeArrayFunc.call(this, arrlen, buf, off, val) }
    }

    ibytes = handler.bytes * arrlen

    ret.bytes = ibytes
    ret.read = readFunc
    ret.write = writeFunc

  } else if (
    handler instanceof Enum ||
    handler instanceof Struct
  ) {
    // direct alias to a struct. return the struct directly.
    return handler
    // ret.toBinary = handler.toBinary.bind(handler)
    // ret.fromBinary = handler.fromBinary.bind(handler)
  }

  return ret
}

function createReadArray(read_handle, arrlen, unit_bytes) {
  return function (buf, offset) {
    var retval = new Array(arrlen)
    for (var i = 0; i < arrlen; i++) {
      retval[i] = read_handle(buf, offset)
      offset += unit_bytes
    }
    return retval
  }
}

function createWriteArray(write_handle, arrlen, unit_bytes) {
  return function (buf, offset, value) {
    for (var i = 0; i < arrlen; i++) {
      write_handle(buf, offset, value[i])
      offset += unit_bytes
    }
    return offset
  }
}

module.exports.generateTypeHandle = generateTypeHandle
module.exports.createReadArray = createReadArray
module.exports.createWriteArray = createWriteArray
