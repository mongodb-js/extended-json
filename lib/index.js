var deflate = require('./deflate');
var inflate = require('./inflate');
var es = require('event-stream');
var JSONStream = require('JSONStream');
var raf = require('raf');

module.exports.parse = function(text, reviver) {
  return deflate(JSON.parse(text, reviver));
};

module.exports.stringify = function(value, replacer, space) {
  return JSON.stringify(inflate(value), replacer, space);
};

module.exports.deflate = deflate;
module.exports.inflate = inflate;
module.exports.reviver = require('./reviver');

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

  var emit = raf(function ejson_parse_emit(data) {
    wrapper.emit('data', data);
  });

  parser.on('data', function(data) {
    deflate.async(data, function(_, parsed) {
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

