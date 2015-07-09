var assert = require('assert');
var stringify = require('../').stringify;
var parse = require('../').parse;
var createStringifyStream = require('../').createStringifyStream;
var createParseStream = require('../').createParseStream;
var bson = require('bson');
var fs = require('fs');
var os = require('os');

var util = require('util');
var Readable = require('stream').Readable;

function DocsStream(docs) {
  Readable.call(this, {
    objectMode: true
  });
  this.docs = docs;
}
util.inherits(DocsStream, Readable);

DocsStream.prototype._read = function() {
  this.docs.forEach(function(doc) {
    this.push(doc);
  }.bind(this));
  this.push(null);
};

/*eslint new-cap:0*/
describe('Stringify', function() {
  it('should work', function() {
    var doc = {
      _id: bson.ObjectID()
    };
    assert.equal(stringify(doc), '{"_id":{"$oid":"' + doc._id.toString() + '"}}');
  });
  describe('streaming', function() {
    var docs = [
      {
        _id: bson.ObjectID()
      }
    ];
    var dest = os.tmpdir() + '/ejson-streams-result.json';
    after(function(done) {
      fs.unlink(dest, function() {
        done();
      });
    });
    it('should support stringify', function(done) {
      new DocsStream(docs)
        .pipe(createStringifyStream())
        .pipe(fs.createWriteStream(dest))
        .on('finish', function() {
          fs.readFile(dest, function(err, buf) {
            if (err) return done(err);

            var data = parse(buf);
            assert.deepEqual(data, docs);
            done();
          });
        });
    });

    it('should support parse', function(done) {
      fs.createReadStream(dest)
        .pipe(createParseStream('*'))
        .on('end', function() {
          done();
        });
    });
  });
});
