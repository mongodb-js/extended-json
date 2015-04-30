var deflate = require('./deflate'),
  inflate = require('./inflate'),
  es = require('event-stream'),
  JSONStream = require('JSONStream');

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

  //else, what ever you like

  var first = true,
    anyData = false;

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
    if (!anyData) this.emit('data', op);
    this.emit('data', cl);
    this.emit('end');
  });
};

module.exports.createParseStream = function(path, map) {

  var parser = JSONStream.parse(path, map);
  var wrapper = es.through(function(data) {
    parser.write(data);
  }, function() {
    this.emit('end');
  });

  parser.on('data', function(data) {
    var parsed = deflate(data);

    if (!Array.isArray(parsed)) {
      parsed = [parsed];
    }

    for (var i = 0; i < parsed.length; i++) {
      wrapper.emit('data', parsed[i]);
    }
  })
  .on('error', wrapper.emit.bind(wrapper, 'error'))
  .on('end', wrapper.emit.bind(wrapper, 'end'));
  return wrapper;
};
