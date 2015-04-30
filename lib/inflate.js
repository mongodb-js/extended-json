var types = require('./types'),
  isObject = types.isObject,
  type = types.type;

/**
 * Format values with extra extended json type data.
 *
 * @param value {Mixed}
 * @returns {Mixed}
 * @api private
 */
var inflate = module.exports = function(value) {
  if (Array.isArray(value)) return value.map(inflate.bind(null));
  if (!isObject(value)) {
    var caster = types.inflate[type(value)];
    if (!caster) return value;
    return caster(value);
  }

  return Object.keys(value).reduce(function(schema, key) {
    var val = value[key];
    schema[key] = inflate(val);
    return schema;
  }, {});
};
