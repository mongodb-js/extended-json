const { EJSON } = require('bson');

module.exports = function(value, options) {
  // Current default in compass is strict ejson v1.
  options = Object.assign({}, { relaxed: false, legacy: true }, options);
  return EJSON.serialize(value, options);
};
