var getSchema = require('mongodb-schema');
var assert = require('assert');
var BSON = require('bson');
var EJSON = require('../');

/* eslint new-cap: 0, quote-props: 0 */
describe('Important integrations we dont want to break', function() {
  describe('mongodb-schema', function() {
    var schema;
    var docs = [
      {
        _id: new BSON.ObjectID('55e6484748f15136d28b6e76')
      },
      {
        _id: new BSON.ObjectID('55f0a1ca62510c0b042b59e8'),
        arr1: [1, 2, 3],
        arr2: [true, false],
        arr3: [
          {
            c: 1,
            d: 2
          },
          {
            c: 1,
            e: 3
          },
          {
            e: 3
          }
        ],
        doc: {
          a: 1,
          b: 2
        },
        x: 1
      },
      {
        _id: new BSON.ObjectID('55f0a1ca62510c0b042b59e9'),
        arr1: [1, 2, 3],
        arr2: [true, false],
        arr3: [
          {
            c: 1,
            d: 2
          },
          {
            c: 1,
            e: 3
          },
          {
            e: 3
          }
        ],
        doc: {
          a: 1,
          b: 2
        },
        x: 1
      },
      {
        _id: new BSON.ObjectID('55f0a1ca62510c0b042b59ea'),
        arr1: [1, 2, 3],
        arr2: [true, false],
        arr3: [
          {
            c: 1,
            d: 2
          },
          {
            c: 1,
            e: 3
          },
          {
            e: 3
          }
        ],
        doc: {
          a: 1,
          b: 2
        },
        x: 1
      }
    ];

    before(function(done) {
      getSchema(docs, function(err, result) {
        assert.equal(err, null);
        schema = result;
        done();
      });
    });
    it('should work with regular JSON.stringify', function() {
      assert.ok(JSON.stringify(schema));
    });
    it('should work with EJSON.stringify', function() {
      assert.doesNotThrow(function() {
        EJSON.stringify(schema);
      }, /maximum call stack size exceeded/i);
    });
  });
});
