// jsdom does not provide these, and react-router needs them as soon as it is imported
const { TextEncoder, TextDecoder } = require("node:util")

Object.assign(globalThis, { TextEncoder, TextDecoder })
