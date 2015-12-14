var strict = require('./modes/strict');
var types = require('./types');
var isObject = types.isObject;
var isFunction = require('lodash.isfunction');
var transform = require('lodash.transform');
var type = types.type;

/* eslint no-use-before-define:0 */

function serializeArray(arr) {
  return arr.map(serialize.bind(null));
}

function serializeTransformer(res, val, key) {
  res[key] = serialize(val);
  return res;
}

function serializeObject(obj) {
  var value = obj;
  if (isFunction(obj.serialize)) {
    value = obj.serialize();
  }
  return transform(value, serializeTransformer, {});
}

function serializePrimitive(value) {
  var t = type(value);
  if (strict.serialize.hasOwnProperty(t) === false) {
    return value;
  }

  var caster = strict.serialize[t];
  return caster(value);
}

/**
 * Format values with extra extended json type data.
 *
 * @param {Any} value - What to wrap as a `{$<type>: <encoded>}` object.
 * @return {Any}
 * @api private
 */
function serialize(value) {
  if (Array.isArray(value) === true) {
    return serializeArray(value);
  }
  if (isObject(value) === false) {
    return serializePrimitive(value);
  }
  return serializeObject(value);
}

module.exports = serialize;
