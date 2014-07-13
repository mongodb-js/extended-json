var assert = require('assert'),
  stringify = require('../').stringify,
  bson = require('bson');

describe('Stringify', function(){
  it('should work', function(){
    var doc = {
       _id: bson.ObjectID()
     };
     assert.equal(stringify(doc), '{"_id":{"$oid":"'+doc._id.toString()+'"}}');
  });
});
