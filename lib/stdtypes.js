'use strict'

/** @typedef {{[type: string]: {
  bytes: number,
  read(buf: Buffer, offset: number): any,
  write(buf: Buffer, offset: number, value: any): number,
  readArray?(arrlen: number, buf: Buffer, offset: number): any[],
  writeArray?(arrlen: number, buf: Buffer, offset: number, value: any[]): number,
}}} typeHandleContext */

/** @type {typeHandleContext} */
const typeHandle = {}

typeHandle["int8_t"] = {
  bytes: 1,
  read(buf, offset) { return buf.readInt8(offset) },
  write(buf, offset, value) { return buf.writeInt8(value, offset) },
}
typeHandle["uint8_t"] = {
  bytes: 1,
  read(buf, offset) { return buf.readUInt8(offset) },
  write(buf, offset, value) { return buf.writeUInt8(value, offset) },
}
typeHandle["int16_t"] = {
  bytes: 2,
  read(buf, offset) { return buf.readInt16LE(offset) },
  write(buf, offset, value) { return buf.writeInt16LE(value, offset) },
}
typeHandle["uint16_t"] = {
  bytes: 2,
  read(buf, offset) { return buf.readUInt16LE(offset) },
  write(buf, offset, value) { return buf.writeUInt16LE(value, offset) },
}
typeHandle["int32_t"] = {
  bytes: 4,
  read(buf, offset) { return buf.readInt32LE(offset) },
  write(buf, offset, value) { return buf.writeInt32LE(value, offset) },
}
typeHandle["uint32_t"] = {
  bytes: 4,
  read(buf, offset) { return buf.readUInt32LE(offset) },
  write(buf, offset, value) { return buf.writeUInt32LE(value, offset) },
}
typeHandle["float"] = {
  bytes: 4,
  read(buf, offset) { return buf.readFloatLE(offset) },
  write(buf, offset, value) { return buf.writeFloatLE(value, offset) },
}
typeHandle["double"] = {
  bytes: 8,
  read(buf, offset) { return buf.readDoubleLE(offset) },
  write(buf, offset, value) { return buf.writeDoubleLE(value, offset) },
}

typeHandle["char"] = {
  bytes: 1,
  read: typeHandle.int8_t.read,
  write(buf, offset, value) {
    var otype = value >= 128 ? typeHandle.uint8_t : typeHandle.int8_t
    return otype.write(buf, offset, value)
  },
  readArray(arrlen, buf, offset) {
    if (this.encoding) {
      return buf.slice(offset, arrlen + offset)
        .toString(this.encoding)
        .replace(/\0+$/, '')
    }

    var retval = Buffer.alloc(arrlen)
    buf.copy(retval, 0, offset)
    return retval
  },
  writeArray(arrlen, buf, offset, val) {
    if (typeof val === 'string') buf.write(val, offset, arrlen, this.encoding)
    else Buffer.from(val, 0, arrlen).copy(buf, offset)
  },
}

typeHandle["signed char"] = typeHandle["int8_t"]
typeHandle["unsigned char"] = typeHandle["uint8_t"]

typeHandle["short"] = typeHandle["int16_t"]
typeHandle["signed short"] = typeHandle["int16_t"]
typeHandle["unsigned short"] = typeHandle["uint16_t"]

typeHandle["int"] = typeHandle["int32_t"]
typeHandle["signed int"] = typeHandle["int32_t"]
typeHandle["unsigned int"] = typeHandle["uint32_t"]

typeHandle["long"] = typeHandle["int32_t"]
typeHandle["signed long"] = typeHandle["int32_t"]
typeHandle["unsigned long"] = typeHandle["uint32_t"]

typeHandle["bool"] = {
  //FIXME: sizeof(bool) is not required to be 1.
  //http://stackoverflow.com/questions/4897844/is-sizeofbool-defined
  bytes: 1,
  read(buf, offset) { return !!buf[offset] },
  write(buf, offset, value) { return buf[offset] = value ? 1 : 0 },
}
typeHandle["_Bool"] = typeHandle["bool"]

module.exports = typeHandle
