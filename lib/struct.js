'use strict'

var defaultTypeContext = require('./stdtypes')
var generateTypeHandle = require('./type-util').generateTypeHandle
var stripString = require('./util').stripString

/**
 * You might need `ezstruct.js`
 */

class Struct {
  /**
   *
   * @param {typeHandleContext} [context]
   */
  constructor(context) {
    this.context = context || defaultTypeContext
  }

  /**
   * generate `struct` type from C++ source code.
   *
   *  an example of accepted expression:
   *
      ```c
      int uid;
      float xmin, ymin, xmax, ymax;
      float map_origin_x,map_origin_y;
      float resolution;
      int floor;
      char name[92];
      ```

   * @param {string} expression
   */
  compile(expression) {
    var context = this.context

    var list = []
    var fields = {}
    var bytes = 0
    stripString(expression)
      .split(';')
      .forEach((line, i) => {
        line = line.trim()
        var type1 = /^(?:(?:unsigned|signed|struct|union|enum) )?\S+/.exec(line)
        if (!type1) return

        var type = type1[0]
        var handler = context[type]
        if (!handler) throw new Error("Not supported type: " + type)

        line.substr(type.length + 1).split(/,\s*/)
          .forEach(varname => {
            var arrS = /^(\S+)\s*\[(\d+)\]$/.exec(varname)
            var varhandler = handler
            var vartype = type
            if (arrS) {
              varname = arrS[1]
              var arrlen = ~~arrS[2]

              vartype += '[' + arrlen + ']'
              varhandler = generateTypeHandle(context, type, vartype)
            }
            var readFunc = varhandler.read
            var writeFunc = varhandler.write
            var ibytes = varhandler.bytes

            bytes += ibytes

            var field = {
              name: varname,
              type: vartype,
              arrlen: arrlen,
              read: readFunc,
              write: writeFunc,
              bytes: ibytes,
            }
            list.push(field)
            fields[varname] = field
            this[varname] = field
          })
      })

    this.context = context
    this.bytes = bytes
    this.struct = list
    this.fields = fields
    this.read = (buf, offset) => this.fromBinary(buf, offset)
    this.write = (buf, offset, value) => this.toBinary(value, buf, offset)
  }

  /**
   *
   * @param {Buffer} buf
   * @param {number} offset
   * @returns {object}
   */
  fromBinary(buf, offset = 0) {
    if (buf.byteLength < this.bytes) {
      var noEnoughDataMsg = "No enough binary data. Expect " + this.bytes + " bytes, got " + buf.byteLength + " bytes"
      throw new Error(noEnoughDataMsg)
    }

    var retval = {}
    this.struct.forEach(ii => {
      retval[ii.name] = ii.read(buf, offset)
      offset += ii.bytes
    })

    return retval
  }

  /**
   *
   * @param {object} obj
   * @param {Buffer} [buf]
   * @param {number} [offset]
   * @returns {number|Buffer} new offset, or Buffer if buf is not given
   */
  toBinary(obj, buf, offset = 0) {
    var targetBuf = buf || Buffer.alloc(this.bytes)
    this.struct.forEach(ii => {
      var val = obj[ii.name]

      if (typeof val === 'undefined' && typeof ii.default !== 'undefined')
        val = ii.default

      if (typeof val !== 'undefined')
        ii.write(targetBuf, offset, val)

      offset += ii.bytes
    })
    return buf ? offset : targetBuf
  }
}

module.exports = Struct
