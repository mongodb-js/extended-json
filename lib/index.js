const deserialize = require('./deserialize');
const serialize = require('./serialize');
const shell = require('./modes/shell');
const log = require('./modes/log');
const { format } = require('util');

function preprocess(text, mode) {
  /* eslint indent:0 */
  mode = mode || 'strict';

  switch (mode) {
    case 'strict':
      return text;
    case 'shell':
      return shell.toStrict(text);
    case 'log':
      return log.toStrict(text);
    default:
      throw new Error(
        format(
          'unknown mode `%s`. Use `strict` (default), `shell` or `log`.',
          mode
        )
      );
  }
}

/**
 * parses a string in strict, shell or log mode extended JSON and returns
 * object with BSON values.
 *
 * @param  {String} text  string to parse
 * @param  {Function}     reviver callback function for custom parsing, @see ./reviver.js
 * @param  {Enum} mode    one of `strict`, `shell`, `log`
 * @return {Object}       Object with native and/or BSON values
 */
module.exports.parse = function(text, reviver, mode) {
  var normalized = preprocess(text, mode);
  var parsed = JSON.parse(normalized, reviver);
  return deserialize(parsed);
};

/**
 * stringifies an object with native and/or BSON values back into
 * strict extended JSON.
 *
 * @param  {Object} value               Object or value to stringify
 * @param  {Function|Array} replacer    Custom replacement
 * @param  {Number|String} space        Custom spacing
 * @return {String}                     JSON representation of value
 *
 * @see http://mzl.la/1fms8sL  JSON.stringify() documentation
 */
module.exports.stringify = function(value, replacer, space) {
  return JSON.stringify(serialize(value), replacer, space);
};

module.exports.deserialize = deserialize;
module.exports.serialize = serialize;
