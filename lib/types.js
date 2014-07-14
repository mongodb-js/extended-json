var bson = require('bson');

/**
 * Map of all extended types to inflaters (stingify) and defalters (parse).
 *
 * @api private
 */
module.exports = {
  inflate: {
    ObjectID: function(v){
      return {'$oid': v.toJSON()};
    },
    Binary: function(v){
      return {'$binary': v.buffer.toString('base64')};
    },
    DBRef: function(v){
      return {'$ref': v.namespace, '$id': v.oid.toJSON()};
    },
    Timestamp: function(v){
      return {'$timestamp': {$t: v.low_, $i: v.high_}};
    },
    Long: function(v){
      return {'$numberLong': v.toString()};
    },
    MaxKey: function(){
      return {'$maxKey': 1};
    },
    MinKey: function(){
      return {'$minKey': 1};
    },
    Date: function(v){
      return {'$date': v.getTime()};
    },
    RegExp: function(v){
      var o = '';

      if(v.global) o += 'g';
      if(v.ignoreCase) o += 'i';
      if(v.multiline) o += 'm';

      return {'$regex': v.source, '$options': o};
    },
    Undefined: function(){
      return {'$undefined': true};
    },
  },
  deflate: {
    '$oid': function(data){
      return bson.ObjectID(data.$oid);
    },
    '$binary': function(val){
      return bson.Binary(new Buffer(val.$binary, 'base64'));
    },
    '$ref': function(val){
      return bson.DBRef(val.$ref, val.$id);
    },
    '$timestamp': function(val){
      return bson.Timestamp(val.$timestamp.$t, val.$timestamp.$i);
    },
    '$numberLong': function(val){
      return bson.Long(val.$numberLong);
    },
    '$maxKey': function(){
      return bson.MaxKey();
    },
    '$minKey': function(){
      return bson.MinKey();
    },
    '$date': function(val){
      var d = new Date();
      d.setTime(val.$date);
      return d;
    },
    '$regex': function(val){
      return new RegExp(val.$regex, val.$options);
    },
    '$undefined': function(){
      return undefined;
    }
  }
};


/**
 * Gets the BSON or JS type of a value.
 *
 * @param value {Mixed}
 * @return String
 * @api private
 */
module.exports.type = function type(value){
  if(value && value._bsontype) return value._bsontype;
  return /\[object (\w+)\]/.exec(Object.prototype.toString.call(value))[1];
};

/**
 * @api private
 */
module.exports.isObject = function isObject(val){
  return module.exports.type(val) === 'Object';
};
