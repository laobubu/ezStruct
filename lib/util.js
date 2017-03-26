'use strict'

/**
 * strip CRLF, comments, and collapse spaces
 * @param {string} str
 */
function stripString(str) {
  return str
    .replace(/(?:^|[\r\n]+)\s*#([^\r\n]+\\[\r\n]+)*[^\r\n]+(?=[\r\n]|$)/g, '') // #macro
    .replace(/\s*\/\/.*$/gm, '') // comments like // this
    .replace(/[\s\r\n]+/g, ' ')  // collapse CR, LF, spaces
    .replace(/\s*\/\*.*?\*\/\s*/g, '')  // comments like /* this */
    .trim()
}

module.exports.stripString = stripString
