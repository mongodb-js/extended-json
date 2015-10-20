var strict = require('./modes/strict');
var types = require('./types');
var isObject = types.isObject;
var isFunction = require('lodash.isfunction');
var reduce = require('lodash.reduce');
var type = types.type;

/* eslint no-use-before-define:0 */

function inflateArray(arr) {
  return arr.map(inflate.bind(null));
}

function inflateReducer(res, val, key) {
  res[key] = inflate(val);
  return res;
}

function inflateObject(obj) {
  var value = obj;
  if (isFunction(obj.serialize)) {
    value = obj.serialize();
  }
  return reduce(value, inflateReducer, {});
}

function inflatePrimitive(value) {
  var t = type(value);
  if (strict.inflate.hasOwnProperty(t) === false) {
    return value;
  }

  var caster = strict.inflate[t];
  return caster(value);
}

/**
 * Format values with extra extended json type data.
 *
 * @param {Any} value - What to wrap as a `{$<type>: <encoded>}` object.
 * @return {Any}
 * @api private
 */
function inflate(value) {
  if (Array.isArray(value) === true) {
    return inflateArray(value);
  }
  if (isObject(value) === false) {
    return inflatePrimitive(value);
  }
  return inflateObject(value);
}

module.exports = inflate;
