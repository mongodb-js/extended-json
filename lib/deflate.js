var types = require('./types'),
  isObject = types.isObject;

/**
 * Cast values from extended json objects to their BSON or JS types.
 *
 * @param data {Mixed}
 * @returns {Mixed}
 * @api private
 */
module.exports = function deflate(data) {
  if (Array.isArray(data)) return data.map(deflate);
  if (!isObject(data)) return data;

  var keys = Object.keys(data);
  if (keys.length === 0) return data;

  var caster = types.deflate[keys[0]];
  if (!caster) {
    return keys.reduce(function(schema, key) {
      schema[key] = deflate(data[key]);
      return schema;
    }, {});
  }

  return caster(data);
};
