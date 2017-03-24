'use strict'

var defaultTypeContext = require('./stdtypes')

class Enum {
  /**
   *
   * @param {typeHandleContext} [context]
   */
  constructor(context) {
    this.context = context || defaultTypeContext
    this.bytes = 4
    this.read = this.context['int'].read
    this.write = this.context['int'].write
    this.dict = {}
  }

  /**
   * generate `struct` type from C++ source code.
   *
   *  an example of accepted expression:
   *
      ```c
      saturday,
      sunday = 0,
      monday,
      tuesday,
      wednesday,
      thursday,
      friday
      ```

   * @param {string} expression
   */
  compile(expression) {
    var dict = {}, i = 0
    Object.keys(this.dict).forEach(name => {
      if (
        !/^(dict|context|bytes|read|write|compile|constructor)$/.test(name) &&
        this.hasOwnProperty(name)
      )
        delete this[name]
    })
    expression.replace(/[\s\r\n]+/g, '').split(',').forEach(name => {
      var sp = name.indexOf('=')
      if (sp > 0) {
        i = parseInt(name.substr(sp + 1))
        name = name.substr(0, sp)
      }
      dict[name] = i
      if (typeof this[name] === 'undefined') this[name] = i
      i++
    })
    this.dict = dict
  }
}

module.exports = Enum
