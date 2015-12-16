var assert = require('assert');
var EJSON = require('../');
var isFunction = require('lodash.isfunction');
var bson = require('bson');

/* eslint new-cap:0 */
describe('Regressions', function() {
  /**
   * NOTE (imlucas) sorry I missed this but
   * http://github.com/mongodb-js/extended-json/pulls/24
   * should have been a version bump to 2.x.
   */
  describe('TypeError: EJSON.inflate is not a function', function() {
    var doc = {
      _id: bson.ObjectID('5671d0902515a6bc614d5a79')
    };

    var serialized = {
      _id: {
        $oid: '5671d0902515a6bc614d5a79'
      }
    };

    it('should have an inflate alias function for serialize', function() {
      assert(isFunction(EJSON.inflate));
      assert.deepEqual(EJSON.inflate(doc), EJSON.serialize(doc));
    });

    it('should have a deflate alias function for deserialize', function() {
      assert(isFunction(EJSON.deflate));
      assert.deepEqual(EJSON.deflate(serialized), EJSON.deserialize(serialized));
    });
  });
});
