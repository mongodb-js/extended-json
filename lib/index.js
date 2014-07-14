var deflate = require('./deflate'),
  inflate = require('./inflate');

module.exports.parse = function(text, reviver){
  return deflate(JSON.parse(text, reviver));
};

module.exports.stringify = function(value, replacer, space){
  return JSON.stringify(inflate(value), replacer, space);
};

module.exports.deflate = deflate;
module.exports.inflate = inflate;
module.exports.reviver = require('./reviver');
