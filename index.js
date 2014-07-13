var bson = require('bson');

function isObject(val) {
  return type(val) === 'Object';
}

function type(val){
  if(val && val._bsontype) return val._bsontype;
  return /\[object (\w+)\]/.exec(Object.prototype.toString.call(val))[1];
}

var bsonTypes = ['ObjectID', 'Binary', 'DBRef', 'Timestamp', 'Long', 'MaxKey', 'MinKey'];
var jsTypes = ['Date', 'RegExp', 'Undefined'];

var bsonExpansions = ['$oid', '$binary', '$ref', '$timestamp', '$numberLong', '$maxKey', '$minKey'];
var jsExpansions = ['$date', '$regex', '$undefined'];

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
    MaxKey: function(v){
      return {'$maxKey': 1};
    },
    MinKey: function(v){
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
    Undefined: function(v){
      return {'$undefined': true};
    },
  },
  deflate: {

  }
};


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

exports.inflate = inflate;

exports.parse = function(value, replacer, stack, indent, gap){
  return JSON.parse(value, replacer, stack, indent, gap);
};

exports.stringify = function(value, replacer, space){
  return JSON.stringify(inflate(value), replacer, space);
};
