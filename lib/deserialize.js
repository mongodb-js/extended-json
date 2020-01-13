const { EJSON } = require('bson');
/**
 * Cast values from extended json objects to their BSON or JS types.
 *
 * @param {Any} data - A value which might be esjon encoded.
 * @return {Any}
 * @api private
 */
module.exports = function(data) {
  return EJSON.deserialize(data, { legacy: true, relaxed: false });
};
