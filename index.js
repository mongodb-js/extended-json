var bson = require('bson');

var types = {
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

function isObject(val) {
  return type(val) === 'Object';
}

function type(val){
  if(val && val._bsontype) return val._bsontype;
  return /\[object (\w+)\]/.exec(Object.prototype.toString.call(val))[1];
}

function inflateType(value){
  var caster = types.inflate[type(value)];
  if(!caster) return;
  return caster(value);
}

// bson -> extended json
function inflate(value){
  if(Array.isArray(value)) return value.map(inflate.bind(null));
  if(!isObject(value)) return inflateType(value) || value;

  return Object.keys(value).reduce(function(schema, key){
    var val = value[key];
    schema[key] = inflate(val);
    return schema;
  }, {});
}

function deflate(data){
  if(Array.isArray(data)) return data.map(deflate.bind(null));
  if(!isObject(data)) return data;

  var keys = Object.keys(data);
  if(keys.length === 0) return data;

  var caster = types.deflate[keys[0]];
  if(!caster){
    return keys.reduce(function(schema, key){
      schema[key] = deflate(data[key]);
      return schema;
    }, {});
  }

  return caster(data);
}

exports.inflate = inflate;
exports.deflate = deflate;

exports.parse = function(msg){
  return deflate(JSON.parse(msg));
};

exports.stringify = function(value, replacer, space){
  return JSON.stringify(inflate(value), replacer, space);
};
