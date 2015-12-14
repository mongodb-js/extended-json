var types = require('./types');
var strict = require('./modes/strict');
var isObject = types.isObject;
var async = require('async');
var raf = require('raf');

/**
 * Cast values from extended json objects to their BSON or JS types.
 *
 * @param {Any} data - A value which might be esjon encoded.
 * @return {Any}
 * @api private
 */
module.exports = function deserialize(data) {
  if (Array.isArray(data)) {
    return data.map(deserialize);
  }
  if (!isObject(data)) {
    return data;
  }

  var keys = Object.keys(data);
  if (keys.length === 0) {
    return data;
  }

  var caster = strict.deserialize[keys[0]];
  if (!caster) {
    return keys.reduce(function(schema, key) {
      schema[key] = deserialize(data[key]);
      return schema;
    }, {});
  }

  return caster(data);
};

function deserializeAsync(data, fn) {
  if (Array.isArray(data) === true) {
    async.series(data.map(function(doc) {
      return function(cb) {
        raf(function() {
          deserializeAsync(doc, cb);
        });
      };
    }), fn);
  } else if (isObject(data) === false) {
    fn(null, data);
  } else {
    var keys = Object.keys(data);
    if (keys.length === 0) {
      fn(null, data);
    } else {
      var caster = strict.deserialize[keys[0]];
      if (caster) {
        fn(null, caster.call(null, data));
      } else {
        var res = {};
        async.series(keys.map(function(key) {
          return function(cb) {
            deserializeAsync(data[key], function(err, d) {
              if (err) {
                return cb(err);
              }
              res[key] = d;
              cb();
            });
          };
        }), function(err) {
          if (err) {
            return fn(err);
          }
          fn(null, res);
        });
      }
    }
  }
}

module.exports.async = deserializeAsync;
