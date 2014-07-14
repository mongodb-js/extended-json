var assert = require('assert'),
  EJSON = require('../'),
  bson = require('bson');

describe('Reviver', function(){
  var _id = bson.ObjectID(),
    user_id = bson.ObjectID(),
    bin = bson.Binary(new Buffer(1));

  var text = EJSON.stringify({
      _id: _id,
      download_count: bson.Long.fromNumber(10),
      tarball: bin,
      maintainer: bson.DBRef('npm.user', user_id),
      versions: [
        {_id: bson.ObjectID(), tag: 'v0.0.2', created_on: new Date()},
        {_id: bson.ObjectID(), tag: 'v0.0.3', created_on: new Date()}
      ]
    }),
    data = JSON.parse(text, EJSON.reviver);

  it('should revive `{$numberLong: <str>}` to `bson.Long`', function(){
    assert(data.download_count.equals(bson.Long.fromNumber(10)));
  });

  it('should revive `{$oid: <_id>}` to `bson.ObjectId`', function(){
    assert.deepEqual(data._id, _id);
  });

  it('should revive `{$binary: <base64 of buffer>}` to `bson.Binary`', function(){
    assert.equal(data.tarball.buffer.toString('base64'),
      bin.buffer.toString('base64'));
  });

  it('should revive `{$ref: <namespace>, $id: <id>}` to `bson.DBRef`', function(){
    assert.deepEqual(data.maintainer.toString(),
      bson.DBRef('npm.user', user_id).toString());
  });

  it('should revive embedded documents', function(){
    assert.equal(data.versions.length, 2);
    data.versions.map(function(doc){
      assert.equal(doc._id._bsontype, 'ObjectID');
      assert(doc.created_on.getTime);
    });
  });
});
