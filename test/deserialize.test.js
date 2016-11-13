var assert = require('assert');
var deserialize = require('../').deserialize;
var bson = require('bson');

/* eslint new-cap:0 */
describe('Deserialize', function() {
  var _id = bson.ObjectID();
  var bin = bson.Binary(new Buffer(1));
  var ref = bson.DBRef('local.startup_log', _id);
  var refStringId = bson.DBRef('local.startup_log', _id.toString());

  it('converts `{$numberLong: <str>}` to `bson.Long`', function() {
    assert(deserialize({
      $numberLong: '10'
    }).equals(bson.Long.fromString('10')));
  });

  it('converts `{$numberLong: <str>}` to `bson.Long` (between 2^32 and 2^53)', function() {
    assert(deserialize({
      $numberLong: '4294967297'
    }).equals(bson.Long.fromString('4294967297')));
  });

  it('converts `{$numberLong: <str>}` to `bson.Long` (greater than 2^53)', function() {
    assert.ok(deserialize({$numberLong: '1234567903'}) instanceof bson.Long);
    assert(deserialize({
      $numberLong: '18014398509481984'
    }).equals(bson.Long.fromString('18014398509481984')));
  });

  it('converts `{$numberDecimal: <str>}` to `bson.Decimal128`', function() {
    assert.ok(deserialize({$numberDecimal: '1234.567'}) instanceof bson.Decimal128);
    assert.equal(
      deserialize({$numberDecimal: '1234.567'}).toString(),
      bson.Decimal128.fromString('1234.567').toString()
    );
  });

  it('converts `{$oid: <_id>}` to `bson.ObjectId`', function() {
    assert.deepEqual(deserialize({
      $oid: _id.toString()
    }), _id);
  });

  it('converts `{$binary: <base64 of buffer>}` to `bson.Binary`', function() {
    assert.equal(deserialize({
      $binary: bin.buffer.toString('base64')
    }).toString('base64'),
      bin.buffer.toString('base64'));
  });

  it('converts `{$ref: <namespace>, $id: <string>}` to `bson.DBRef`', function() {
    assert.deepEqual(
      deserialize({
        $ref: 'local.startup_log',
        $id: _id.toString()
      }).toString(),
      refStringId.toString());
  });

  it('converts `{$ref: <namespace>, $id: <ObjectID>}` to `bson.DBRef`', function() {
    assert.deepEqual(
      deserialize({
        $ref: 'local.startup_log',
        $id: {
          $oid: _id.toString()
        }
      }).toString(),
      ref.toString());
  });

  it('converts `{$timestamp: {$t: <low_>, $i: <high_>}` to `bson.Timestamp`', function() {
    assert.deepEqual(deserialize({
      $timestamp: {
        $t: 0,
        $i: 0
      }
    }), bson.Timestamp());
  });

  it('converts `{$minKey: 1}` to `bson.MinKey`', function() {
    assert.deepEqual(deserialize({
      $minKey: 1
    }), bson.MinKey());
  });

  it('converts `{$maxKey: 1}` to `bson.MaxKey`', function() {
    assert.deepEqual(deserialize({
      $maxKey: 1
    }), bson.MaxKey());
  });

  it('converts `{$date: <ms>}` to `Date`', function() {
    var d = new Date();
    assert.deepEqual(deserialize({
      $date: d.getTime()
    }), d);
  });

  it('converts `{$date: <ISO-8601>}` to `Date`', function() {
    var d = new Date();
    assert.deepEqual(deserialize({
      $date: d.toISOString()
    }), d);
  });

  it('converts `{$regex: <pattern>, $options: <flags>}` to `RegExp`', function() {
    assert.deepEqual(deserialize({
      $regex: 'mongodb.com$',
      $options: 'g'
    }).toString(),
      '/mongodb.com$/g');
  });

  it('converts `{$undefined: true}` to `undefined`', function() {
    assert.deepEqual(deserialize({
      $undefined: true
    }), undefined);
  });

  it('DOCS-3879: converts `{$date: <iso string>}` to a proper date', function() {
    assert.equal(deserialize({
      $date: '2014-08-25T17:49:42.288-0400'
    }).toUTCString(),
      'Mon, 25 Aug 2014 21:49:42 GMT');
  });
});
