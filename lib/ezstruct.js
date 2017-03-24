'use strict'

/**
 * TBD: 2D array is not supported.
 * TBD: big-endian
 * TBD: nested struct
 * TBD: union
 */

var anonCounter = 0
function nextAnonName(type) { return "__ezs_anon_" + (anonCounter++) + "_" + type }

var stripString = require('./util').stripString
var generateTypeHandle = require('./type-util').generateTypeHandle
var defaultTypeContext = require('./stdtypes')

var Struct = require('./struct')
var Enum = require('./enum')

/**
 * @param {string} source
 * @param {typeHandleContext} [context]
 */
function createContext(source, context) {
  if (source.raw && typeof (source[0]) === 'string') // Support ES6 Template Tag Syntax
    source = source.raw.join()

  var ctx = { __ezs_typedef: [] }
  context = context || defaultTypeContext
  Object.keys(context).forEach(type => {
    if (type === '__ezs_typedef') ctx.__ezs_typedef.push(...context.__ezs_typedef)
    else ctx[type] = context[type]
  })

  /** @type {{struct: Struct, expression: string}[]} */
  var compileQueue = []
  source = stripString(source)

  // enum
  source = source.replace(/(\s*)(enum\s*[^{]*\s*){\s*([^{}]+)\s*}\s*(.)/g,
    function (full, lead, name, content, tail) {
      name = name.trim()
      if (name === "enum") name = nextAnonName("enum") // anonymous struct. give it a name

      ctx[name] = new Enum(ctx)
      ctx[name].compile(content)

      return lead + (tail == ";" ? "" : (name + " " + tail))
    }
  )

  // (nested) struct
  do {
    var before1 = source
    source = source.replace(/(\s*)(struct\s*[^{]*\s*){\s*([^{}]+)\s*}\s*(.)/g,
      function (full, lead, name, content, tail) {
        name = name.trim()
        if (name === "struct") name = nextAnonName("struct") // anonymous struct. give it a name

        ctx[name] = new Struct(ctx)
        compileQueue.push({ expression: content, struct: ctx[name] })

        return lead + (tail == ";" ? "" : (name + " " + tail))
      }
    )
  } while (before1 !== source)

  // typedef
  source = source.replace(/\s*typedef ((?:struct |enum )?\S+) ([^;\s]+)\s*;\s*/g,
    function (full, origin, target) {
      var h = generateTypeHandle(ctx, origin, target)
      ctx[h._name || target] = h
      ctx.__ezs_typedef.push(full)
      return ""
    }
  )

  // compile
  compileQueue.forEach(o => {
    o.struct.compile(o.expression)
  })

  return ctx
}

module.exports = createContext
