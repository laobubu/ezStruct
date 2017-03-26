'use strict'

/**
 *
 * @param {Buffer} buf
 * @param {string} encoding
 * @returns {string}
 */
function decode(buf, encoding) {
  try {
    return buf.toString(encoding || undefined).replace(/\0+$/, '')
  } catch (e) {
    // nodejs failed to decode
    let iconv = require('iconv-lite')
    return iconv.decode(buf, encoding).replace(/\0+$/, '')
  }
}

/**
 *
 * @param {string} str
 * @param {string} encoding
 * @returns {Buffer}
 */
function encode(str, encoding) {
  try {
    return Buffer.from(str, encoding || undefined)
  } catch (e) {
    // nodejs failed to encode
    let iconv = require('iconv-lite')
    return iconv.encode(str, encoding)
  }
}

module.exports = {
  decode, encode,
}
