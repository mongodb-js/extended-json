var assert = require('assert'),
  parse = require('../').parse,
  bson = require('bson');

describe('Parse', function(){
  it('should work', function(){
    assert.deepEqual(parse('{"_id":{"$oid":"53c2b570c15c457669f481f7"}}'), {
       _id: bson.ObjectID('53c2b570c15c457669f481f7')
     });
  });
});
