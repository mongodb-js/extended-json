var assert = require('assert');
var serialize = require('../').serialize;
var bson = require('bson');

/* eslint new-cap:0 */
describe('Serialize', function() {
  var _id = new bson.ObjectID();
  var bin = new bson.Binary(new Buffer(1));
  var ref = new bson.DBRef('local.startup_log', _id);
  var refStringId = new bson.DBRef('local.startup_log', _id.toString());
  var code = new bson.Code('return true');
  var codeWithScope = new bson.Code('return true', {});

  it('is a passthrough for primitive types', function() {
    assert.equal(serialize('bson'), 'bson');
    assert.deepEqual(serialize([]), []);
    assert.deepEqual(serialize(1, { relaxed: true }), 1);
    assert.deepEqual(serialize(false), false);
    assert.deepEqual(
      serialize(
        {
          a: 1
        },
        { relaxed: true }
      ),
      {
        a: 1
      }
    );
  });

  it('converts `bson.Long` to `{$numberLong: <str>}`', function() {
    assert.deepEqual(serialize(bson.Long.fromString('10')), {
      $numberLong: '10'
    });
  });

  it('converts `bson.Long` to `{$numberLong: <str>}` (between 2^32 and 2^53)', function() {
    assert.deepEqual(serialize(bson.Long.fromString('4294967297')), {
      $numberLong: '4294967297'
    });
  });

  it('converts `bson.Long` to `{$numberLong: <str>}` (greater than 2^53)', function() {
    assert.deepEqual(serialize(bson.Long.fromString('18014398509481984')), {
      $numberLong: '18014398509481984'
    });
  });

  it('converts `bson.Decimal128` to `{$numberDecimal: <str>}`', function() {
    assert.deepEqual(serialize(bson.Decimal128.fromString('1234.567')), {
      $numberDecimal: '1234.567'
    });
  });

  it('converts `bson.ObjectId` to `{$oid: <_id>}`', function() {
    assert.deepEqual(serialize(_id), {
      $oid: _id.toString()
    });
  });

  it('converts `bson.Binary` to `{$binary: <base64 of buffer>}`', function() {
    assert.deepEqual(serialize(bin), {
      $binary: bin.buffer.toString('base64'),
      $type: '0'
    });
  });

  it('converts `bson.Code` with no scope to `{$code: <code>}`', function() {
    assert.deepEqual(serialize(code), {
      $code: code.code
    });
  });

  it('converts `bson.Code` with scope to `{$code: <code>, $scope: <scope>}`', function() {
    assert.deepEqual(serialize(codeWithScope), {
      $code: codeWithScope.code,
      $scope: codeWithScope.scope
    });
  });

  it('converts `bson.DBRef` to `{$ref: <namespace>, $id: <string>}`', function() {
    assert.deepEqual(serialize(refStringId), {
      $ref: 'local.startup_log',
      $id: _id.toString()
    });
  });

  it('converts `bson.DBRef` to `{$ref: <namespace>, $id: <ObjectID>}`', function() {
    assert.deepEqual(serialize(ref), {
      $ref: 'local.startup_log',
      $id: {
        $oid: _id.toString()
      }
    });
  });

  it('converts `bson.Timestamp` to `{$timestamp: {t: <low_>, i: <high_>}`', function() {
    assert.deepEqual(serialize(new bson.Timestamp(0, 0)), {
      $timestamp: {
        t: 0,
        i: 0
      }
    });
  });

  it('converts `bson.MinKey` to `{$minKey: 1}`', function() {
    assert.deepEqual(serialize(new bson.MinKey()), {
      $minKey: 1
    });
  });

  it('converts `bson.MaxKey` to `{$maxKey: 1}`', function() {
    assert.deepEqual(serialize(new bson.MaxKey()), {
      $maxKey: 1
    });
  });

  it('converts `Date` to `{$date: <ISO-8601>}`', function() {
    var d = new Date(32535215998999);
    assert.deepEqual(serialize(d, { relaxed: true }), {
      $date: d.toISOString()
    });
  });

  it('converts `RegExp` to `{$regex: <pattern>, $options: <flags>}`', function() {
    assert.deepEqual(serialize(/mongodb.com$/i), {
      $regex: 'mongodb.com$',
      $options: 'i'
    });
  });

  it('converts `undefined` to `{$undefined: true}`', function() {
    assert.deepEqual(serialize(undefined), {
      $undefined: true
    });
  });
});
