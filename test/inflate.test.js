var assert = require('assert');
var inflate = require('../').inflate;
var bson = require('bson');

/* eslint new-cap:0 */
describe('Inflate', function() {
  var _id = bson.ObjectID();
  var bin = bson.Binary(new Buffer(1));
  var ref = bson.DBRef('local.startup_log', _id);

  it('is a passthrough for primitive types', function() {
    assert.equal(inflate('bson'), 'bson');
    assert.deepEqual(inflate([]), []);
    assert.deepEqual(inflate(1), 1);
    assert.deepEqual(inflate(false), false);
    assert.deepEqual(inflate({
      a: 1
    }), {
      a: 1
    });
    assert.deepEqual(inflate(Infinity), 'Infinity');
    assert.deepEqual(inflate(-Infinity), '-Infinity');
  });

  it('converts `bson.Long` to `{$numberLong: <str>}`', function() {
    assert.deepEqual(inflate(bson.Long.fromString('10')), {
      $numberLong: '10'
    });
  });

  it('converts `bson.Long` to `{$numberLong: <str>}` (between 2^32 and 2^53)', function() {
    assert.deepEqual(inflate(bson.Long.fromString('4294967297')), {
      $numberLong: '4294967297'
    });
  });

  it('converts `bson.Long` to `{$numberLong: <str>}` (greater than 2^53)', function() {
    assert.deepEqual(inflate(bson.Long.fromString('18014398509481984')), {
      $numberLong: '18014398509481984'
    });
  });

  it('converts `bson.ObjectId` to `{$oid: <_id>}`', function() {
    assert.deepEqual(inflate(_id), {
      $oid: _id.toString()
    });
  });

  it('converts `bson.Binary` to `{$binary: <base64 of buffer>}`', function() {
    assert.deepEqual(inflate(bin), {
      $binary: bin.buffer.toString('base64')
    });
  });

  it('converts `bson.DBRef` to `{$ref: <namespace>, $id: <id>}`', function() {
    assert.deepEqual(inflate(ref), {
      $ref: 'local.startup_log',
      $id: _id.toString()
    });
  });

  it('converts `bson.Timestamp` to `{$timestamp: {$t: <low_>, $i: <high_>}`', function() {
    assert.deepEqual(inflate(bson.Timestamp()), {
      $timestamp: {
        $t: 0,
        $i: 0
      }
    });
  });

  it('converts `bson.MinKey` to `{$minKey: 1}`', function() {
    assert.deepEqual(inflate(bson.MinKey()), {
      $minKey: 1
    });
  });

  it('converts `bson.MaxKey` to `{$maxKey: 1}`', function() {
    assert.deepEqual(inflate(bson.MaxKey()), {
      $maxKey: 1
    });
  });

  it('converts `Date` to `{$date: <ISO-8601>}`', function() {
    var d = new Date();
    assert.deepEqual(inflate(d), {
      $date: d.toISOString()
    });
  });

  it('converts `RegExp` to `{$regex: <pattern>, $options: <flags>}`', function() {
    assert.deepEqual(inflate(/mongodb.com$/g),
      {
        $regex: 'mongodb.com$',
        $options: 'g'
      });
  });

  it('converts `undefined` to `{$undefined: true}`', function() {
    assert.deepEqual(inflate(undefined), {
      $undefined: true
    });
  });
});
