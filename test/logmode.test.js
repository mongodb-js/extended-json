var assert = require('assert');
var logToStrict = require('../lib/modes/log.js').toStrict;
var parse = require('../').parse;
var bson = require('bson');

describe('Parse from log mode', function() {
  /* eslint new-cap:0 */
  it('should work on a simple example with ObjectId', function() {
    assert.deepEqual(parse('{"_id": ObjectId(\'53c2b570c15c457669f481f7\') }', null, 'log'), {
      _id: bson.ObjectID('53c2b570c15c457669f481f7')
    });
  });

  it('should work without quotes around field names', function() {
    assert.deepEqual(parse('{_id: ObjectId(\'53c2b570c15c457669f481f7\') }', null, 'log'), {
      _id: bson.ObjectID('53c2b570c15c457669f481f7')
    });
  });
});

describe('Log mode -> Strict mode', function() {
  /* eslint new-cap:0 */
  it('should replace ObjectId', function() {
    var s = logToStrict('{ oid: ObjectId(\'87654f73c737a19e1d112233\') }');
    assert.equal(s, '{ "oid": { "$oid": "87654f73c737a19e1d112233" } }');
  });

  it('should replace Date', function() {
    var s = logToStrict('{ date: new Date(1388534400000) }');
    assert.equal(s, '{ "date": { "$date": "2014-01-01T00:00:00.000Z" } }');
  });

  it('should replace multiple dates in one line', function() {
    var s = logToStrict('{ start: new Date(1388534400000), end: new Date(1388534406000) }');
    assert.equal(s, '{ "start": { "$date": "2014-01-01T00:00:00.000Z" }, "end":'
      + ' { "$date": "2014-01-01T00:00:06.000Z" } }');
  });

  it('should replace Timestamp', function() {
    var s = logToStrict('{ ts: Timestamp 0|0 }');
    assert.equal(s, '{ "ts": { "$timestamp": { "t": 0, "i": 0 } } }');
  });

  it('should replace RegExp', function() {
    var s = logToStrict('{ regex: /foo/gi }');
    assert.equal(s, '{ "regex": { "$regex": "foo", "$options": "gi" } }');
  });

  it('should escape double quotes in RegExp', function() {
    var s = logToStrict('{ regex: /foo"bar/ }');
    assert.equal(s, '{ "regex": { "$regex": "foo"bar", "$options": "" } }');
  });

  it('should not confuse URLs with RegExp', function() {
    var s = logToStrict('{ url: "https://www.google.com/accounts/cd/id?abc=123" }');
    assert.equal(s, '{ "url": "https://www.google.com/accounts/cd/id?abc=123" }');
  });

  it('should handle RegExp with embedded URLs', function() {
    var s = logToStrict('{ url: /(?:^|\W)href="http:\/\/www\.google\.com\/indexes'
      + '\/12345678\/0987654321a\/"/i }');
    assert.equal(s, '{ "url": { "$regex": "(?:^|\W)href="http:\/\/www\.google\.com\/indexes'
      + '\/12345678\/0987654321a\/"", "$options": "i" } }');
  });

  it('should not confuse string paths with RegExp', function() {
    var s = logToStrict('{ path: "/local/mis" }');
    assert.equal(s, '{ "path": "/local/mis" }');
  });

  it('should replace MaxKey', function() {
    var s = logToStrict('{ val: MaxKey }');
    assert.equal(s, '{ "val": { "$maxKey": 1 } }');
  });

  it('should replace MinKey', function() {
    var s = logToStrict('{ val: MinKey }');
    assert.equal(s, '{ "val": { "$minKey": 1 } }');
  });

  it('should replace BinData and convert from hex to base64', function() {
    var s = logToStrict('{ bin: BinData(0, 48656C6C6F20576F726C64) }');
    assert.equal(s, '{ "bin": { "$binary": "SGVsbG8gV29ybGQ=", "$type": "0" } }');
  });

  it('should replace NumberLong', function() {
    var s = logToStrict('{ long: 9223372036854775807 }');
    assert.equal(s, '{ "long": { "$numberLong": "9223372036854775807" } }');
  });

  it('should replace multiple NumberLong in one line', function() {
    var s = logToStrict('{ long: { $in: [ 9223372036854775807, 9223372036854775806 ] } }');
    assert.equal(s, '{ "long": { "$in": [ { "$numberLong": "9223372036854775807" }, '
      + '{ "$numberLong": "9223372036854775806" } ] } }');
  });

  it('should leave short numbers alone', function() {
    var s = logToStrict('{ short: 1234567 }');
    assert.equal(s, '{ "short": 1234567 }');
  });
});
