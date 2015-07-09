var bson = require('bson');

/**
 * Map of all extended types to inflaters (stingify) and defalters (parse).
 *
 * @api private
 */
module.exports = {
  inflate: {
    ObjectID: function(v) {
      return {
        $oid: v.toString()
      };
    },
    Binary: function(v) {
      return {
        $binary: v.buffer.toString('base64')
      };
    },
    DBRef: function(v) {
      return {
        $ref: v.namespace,
        $id: v.oid.toString()
      };
    },
    Timestamp: function(v) {
      return {
        $timestamp: {
          $t: v.low_,
          $i: v.high_
        }
      };
    },
    Long: function(v) {
      return {
        $numberLong: v.toString()
      };
    },
    MaxKey: function() {
      return {
        $maxKey: 1
      };
    },
    MinKey: function() {
      return {
        $minKey: 1
      };
    },
    Date: function(v) {
      return {
        $date: v.toISOString()
      };
    },
    RegExp: function(v) {
      var o = '';

      if (v.global) {
        o += 'g';
      }
      if (v.ignoreCase) {
        o += 'i';
      }
      if (v.multiline) {
        o += 'm';
      }

      return {
        $regex: v.source,
        $options: o
      };
    },
    Undefined: function() {
      return {
        $undefined: true
      };
    }
  },
  /*eslint new-cap:0*/
  deflate: {
    $oid: function(data) {
      return bson.ObjectID(data.$oid);
    },
    $binary: function(val) {
      return bson.Binary(new Buffer(val.$binary, 'base64'));
    },
    $ref: function(val) {
      return bson.DBRef(val.$ref, val.$id);
    },
    $timestamp: function(val) {
      return bson.Timestamp(val.$timestamp.$t, val.$timestamp.$i);
    },
    $numberLong: function(val) {
      return bson.Long.fromString(val.$numberLong);
    },
    $maxKey: function() {
      return bson.MaxKey();
    },
    $minKey: function() {
      return bson.MinKey();
    },
    $date: function(val) {
      var d = new Date();

      // Kernel bug.  See #2 http://git.io/AEbmFg
      if (isNaN(d.setTime(val.$date))) {
        d = new Date(val.$date);
      }
      return d;
    },
    $regex: function(val) {
      return new RegExp(val.$regex, val.$options);
    },
    $undefined: function() {
      return undefined;
    }
  }
};

var OBJECT_REGEX = /\[object (\w+)\]/;
/**
 * Gets the BSON or JS type of a value.
 *
 * @param {Any} value - Value to check.
 * @return {String}
 * @api private
 */
module.exports.type = function type(value) {
  if (value && value._bsontype) return value._bsontype;
  return OBJECT_REGEX.exec(Object.prototype.toString.call(value))[1];
};

/**
 * @api private
 */
module.exports.special = {
  types: Object.keys(module.exports.inflate),
  keys: Object.keys(module.exports.deflate)
};

/**
 * @param {Any} value - Value to check.
 * @return {Boolean}
 * @api private
 */
module.exports.isSpecial = function isSpecial(value) {
  return module.exports.special.types.indexOf(module.exports.type(value)) > -1;
};

/**
 * @param {Any} value - Value to check.
 * @return {Boolean}
 * @api private
 */
module.exports.isObject = function isObject(value) {
  return module.exports.type(value) === 'Object';
};
