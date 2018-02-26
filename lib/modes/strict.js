var bson = require('bson');

/**
 * Map of all extended types to serializers (stringify) and deserializers (parse).
 *
 * @api private
 */
module.exports = {
  serialize: {
    Code: function(v) {
      if (v.scope) {
        return {
          $code: v.code,
          $scope: v.scope
        };
      }
      return {
        $code: v.code
      };
    },
    ObjectID: function(v) {
      return {
        $oid: v.toHexString()
      };
    },
    Binary: function(v) {
      return {
        $binary: v.buffer.toString('base64'),
        $type: v.sub_type.toString(16)
      };
    },
    DBRef: function(v) {
      var id = typeof v.oid === 'object'
      && module.exports.serialize[v.oid.constructor.name] ? module.exports.serialize[v.oid.constructor.name](v.oid)
        : v.oid;
      return {
        $ref: v.namespace,
        $id: id
      };
    },
    Timestamp: function(v) {
      return {
        $timestamp: {
          t: v.low_,
          i: v.high_
        }
      };
    },
    Long: function(v) {
      return {
        $numberLong: v.toString()
      };
    },
    Decimal128: function(v) {
      return {
        $numberDecimal: v.toString()
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
      var timestamp = v.getTime();
      if (timestamp >= 32535215999000) {
        return {
          $date: {
            $numberLong: '' + timestamp
          }
        };
      }

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
  /* eslint new-cap:0 */
  deserialize: {
    $code: function(code) {
      return bson.Code(code.$code, code.$scope);
    },
    $oid: function(data) {
      return bson.ObjectID(data.$oid);
    },
    $binary: function(val) {
      return bson.Binary(new Buffer(val.$binary, 'base64'), parseInt(val.$type, 16));
    },
    $ref: function(val) {
      var id = typeof val.$id === 'object'
      && module.exports.deserialize[Object.keys(val.$id)[0]] ? module.exports.deserialize[Object.keys(val.$id)[0]](val.$id)
        : val.$id;
      return bson.DBRef(val.$ref, id);
    },
    $timestamp: function(val) {
      return bson.Timestamp(val.$timestamp.t, val.$timestamp.i);
    },
    $numberLong: function(val) {
      return bson.Long.fromString(val.$numberLong);
    },
    $numberDecimal: function(val) {
      return bson.Decimal128.fromString(val.$numberDecimal);
    },
    $maxKey: function() {
      return bson.MaxKey();
    },
    $minKey: function() {
      return bson.MinKey();
    },
    $date: function(val) {
      var d = new Date();
      var v;

      if (typeof val.$date === 'object') {
        v = val.$date.$numberLong;
      } else {
        v = val.$date;
      }
      // Kernel bug.  See #2 http://git.io/AEbmFg
      if (isNaN(d.setTime(v))) {
        d = new Date(v);
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
