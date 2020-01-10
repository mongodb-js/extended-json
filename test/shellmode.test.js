var assert = require('assert');
var shellToStrict = require('../lib/modes/shell.js').toStrict;
var parse = require('../').parse;
var bson = require('bson');

/* eslint new-cap:0 */
describe('Parse from shell mode', function() {
  it('should work on a simple example with ObjectId', function() {
    assert.deepEqual(
      parse('{"_id": ObjectId("53c2b570c15c457669f481f7") }', null, 'shell'),
      {
        _id: bson.ObjectID('53c2b570c15c457669f481f7')
      }
    );
  });

  it('should work without field name quotes', function() {
    assert.deepEqual(
      parse('{_id: ObjectId("53c2b570c15c457669f481f7") }', null, 'shell'),
      {
        _id: bson.ObjectID('53c2b570c15c457669f481f7')
      }
    );
  });

  it('should work with single instead of double quotes', function() {
    assert.deepEqual(
      parse("{'_id': ObjectId('53c2b570c15c457669f481f7') }", null, 'shell'),
      {
        _id: bson.ObjectID('53c2b570c15c457669f481f7')
      }
    );
  });
});

describe('Shell mode -> Strict mode', function() {
  it('should replace ObjectId', function() {
    var s = shellToStrict('{ "_id": ObjectId("87654f73c737a19e1d112233") }');
    assert.equal(s, '{ "_id": { "$oid": "87654f73c737a19e1d112233" } }');
  });

  it('should replace Date', function() {
    var s = shellToStrict(
      '{ "created_at": ISODate("2014-01-01T00:00:00.000Z") }'
    );
    assert.equal(
      s,
      '{ "created_at": { "$date": "2014-01-01T00:00:00.000Z" } }'
    );
  });

  it('should replace multiple dates in one line', function() {
    var s = shellToStrict(
      '{ "start": ISODate("2014-01-01T00:00:00.000Z"), "end": ' +
        'ISODate("2015-01-01T00:00:00.000Z") }'
    );
    assert.equal(
      s,
      '{ "start": { "$date": "2014-01-01T00:00:00.000Z" }, "end": ' +
        '{ "$date": "2015-01-01T00:00:00.000Z" } }'
    );
  });

  it('should replace Timestamp', function() {
    var s = shellToStrict('{ "ts": Timestamp(100, 15) }');
    assert.equal(s, '{ "ts": { "$timestamp": { "t": 100, "i": 15 } } }');
  });

  it('should replace RegExp', function() {
    var s = shellToStrict('{ "regex": /foo/gi }');
    assert.equal(s, '{ "regex": { "$regex": "foo", "$options": "gi" } }');
  });

  it('should escape double quotes in RegExp', function() {
    var s = shellToStrict('{ "regex": /foo"bar/ }');
    assert.equal(s, '{ "regex": { "$regex": "foo"bar", "$options": "" } }');
  });

  it('should not confuse URLs with RegExp', function() {
    var s = shellToStrict(
      '{ url: "https://www.google.com/accounts/cd/id?abc=123" }'
    );
    assert.equal(
      s,
      '{ "url": "https://www.google.com/accounts/cd/id?abc=123" }'
    );
  });

  it('should handle RegExp with embedded URLs', function() {
    var s = shellToStrict(
      '{ "url": /(?:^|W)href="http://www.google.com/index' +
        'es/12345678/0987654321a/"/i }'
    );
    assert.equal(
      s,
      '{ "url": { "$regex": "(?:^|W)href="http://www.google.com/index' +
        'es/12345678/0987654321a/"", "$options": "i" } }'
    );
  });

  it('should not confuse string paths with RegExp', function() {
    var s = shellToStrict('{ "path": "/local/mis" }');
    assert.equal(s, '{ "path": "/local/mis" }');
  });

  it('should replace BinData', function() {
    var s = shellToStrict('{ "bin": BinData(0,"SGVsbG8gV29ybGQ=") }');
    assert.equal(
      s,
      '{ "bin": { "$binary": "SGVsbG8gV29ybGQ=", "$type": "0" } }'
    );
  });

  it('should replace NumberLong without quotes', function() {
    var s = shellToStrict('{ "long": NumberLong(9223372036854775807) }');
    assert.equal(s, '{ "long": { "$numberLong": "9223372036854775807" } }');
  });

  it('should replace NumberLong with quotes', function() {
    var s = shellToStrict('{ "long": NumberLong("9223372036854775807") }');
    assert.equal(s, '{ "long": { "$numberLong": "9223372036854775807" } }');
  });

  it('should replace NumberDecimal', function() {
    var s = shellToStrict('{ "decimal": NumberDecimal("123.456") }');
    assert.equal(s, '{ "decimal": { "$numberDecimal": "123.456" } }');
  });
});
