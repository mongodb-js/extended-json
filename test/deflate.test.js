var assert = require('assert'),
  deflate = require('../lib/deflate'),
  bson = require('bson');

describe('Defalte', function(){
  var _id = bson.ObjectID(),
    bin = bson.Binary(new Buffer(1)),
    ref = bson.DBRef('local.startup_log', _id);

  it('converts `{$numberLong: <str>}` to `bson.Long`', function(){
    assert(deflate({$numberLong: 10}).equals(bson.Long.fromNumber(10)));
  });

  it('converts `{$oid: <_id>}` to `bson.ObjectId`', function(){
    assert.deepEqual(deflate({$oid: _id.toString()}), _id);
  });

  it('converts `{$binary: <base64 of buffer>}` to `bson.Binary`', function(){
    assert.equal(deflate({$binary: 'AA=='}).toString(),
      bin.buffer.toString());
  });

  it('converts `{$ref: <namespace>, $id: <id>}` to `bson.DBRef`', function(){
    assert.deepEqual(
      deflate({$ref: 'local.startup_log', $id: _id.toString()}).toString(),
      ref.toString());
  });

  it('converts `{$timestamp: {$t: <low_>, $i: <high_>}` to `bson.Timestamp`', function(){
    assert.deepEqual(deflate({$timestamp: {$t: 0, $i: 0}}), bson.Timestamp());
  });

  it('converts `{$minKey: 1}` to `bson.MinKey`', function(){
    assert.deepEqual(deflate({$minKey: 1}), bson.MinKey());
  });

  it('converts `{$maxKey: 1}` to `bson.MaxKey`', function(){
    assert.deepEqual(deflate({$maxKey: 1}), bson.MaxKey());
  });

  it('converts `{$date: <ms>}` to `Date`', function(){
    var d = new Date();
    assert.deepEqual(deflate({$date: d.getTime()}), d);
  });

  it('converts `{$regex: <pattern>, $options: <flags>}` to `RegExp`', function(){
    assert.deepEqual(deflate({$regex: 'mongodb.com$', $options: 'g'}).toString(),
      '/mongodb.com$/g');
  });

  it('converts `{$undefined: true}` to `undefined`', function(){
    assert.deepEqual(deflate({$undefined: true}), undefined);
  });
});
