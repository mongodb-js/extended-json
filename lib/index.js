var deserialize = require('./deserialize');
var serialize = require('./serialize');
var shell = require('./modes/shell');
var log = require('./modes/log');
var es = require('event-stream');
var JSONStream = require('JSONStream');
var raf = require('raf');
var util = require('util');
var format = util.format;
var deprecate = util.deprecate;

function preprocess(text, mode) {
  /* eslint indent:0 */
  mode = mode || 'strict';

  switch (mode) {
    case 'strict': return text;
    case 'shell': return shell.toStrict(text);
    case 'log': return log.toStrict(text);
    default:
      throw new Error(
        format('unknown mode `%s`. Use `strict` (default), `shell` or `log`.', mode)
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
module.exports.reviver = require('./reviver');

// Backwards compat for 1.x
module.exports.deflate = deprecate(deserialize,
  'mongodb-extended-json#deflate: Use deserialize(obj) instead');

module.exports.inflate = deprecate(serialize,
  'mongodb-extended-json#inflate: Use serialize(obj) instead');

// JSONStream.stringify
module.exports.createStringifyStream = function(op, sep, cl, indent) {
  indent = indent || 0;
  if (op === false) {
    op = '';
    sep = '\n';
    cl = '';
  } else if (op === null || op === undefined) {
    op = '[\n';
    sep = '\n,\n';
    cl = '\n]\n';
  }

  // else, what ever you like

  var first = true;
  var anyData = false;

  return es.through(function(data) {
    anyData = true;
    var json = module.exports.stringify(data, null, indent);
    if (first) {
      first = false;
      this.emit('data', op + json);
    } else {
      this.emit('data', sep + json);
    }
  }, function() {
    if (!anyData) {
      this.emit('data', op);
    }
    this.emit('data', cl);
    this.emit('end');
  });
};

module.exports.createParseStream = function(path, map) {
  var parser = JSONStream.parse(path, map);
  var wrapper = es.through(function(data) {
    raf(function() {
      parser.write(data);
    });
  }, function() {
    this.emit('end');
  });

  var emit = function ejsonParseEmit(data) {
    wrapper.emit('data', data);
  };

  parser.on('data', function(data) {
    deserialize.async(data, function(_, parsed) {
      if (!Array.isArray(parsed)) {
        emit(parsed);
      } else {
        for (var i = 0; i < parsed.length; i++) {
          emit(parsed[i]);
        }
      }
    });
  })
    .on('error', function(err) {
      wrapper.emit('error', err);
    })
    .on('end', function() {
      wrapper.emit('end');
    });
  return wrapper;
};
