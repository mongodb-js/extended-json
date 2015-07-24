var assert = require('assert');
var parse = require('../').parse;
var bson = require('bson');

/*eslint new-cap:0*/
describe('Parse', function() {
  it('should work', function() {
    assert.deepEqual(parse('{"_id":{"$oid":"53c2b570c15c457669f481f7"}}'), {
      _id: bson.ObjectID('53c2b570c15c457669f481f7')
    });
  });

  it('should throw an error when using an unknown mode', function() {
    assert.throws(parse('{"a": 1}', 'invalid_mode'), Error);
  });
});
