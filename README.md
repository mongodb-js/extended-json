# mongodb-extended-json

[![build status](https://secure.travis-ci.org/imlucas/mongodb-extended-json.png)](http://travis-ci.org/imlucas/mongodb-extended-json)

[MongoDB Extended JSON](http://docs.mongodb.org/manual/reference/mongodb-extended-json/)
parse and stringify that is friendly with [bson](http://github.com/mongodb/js-bson)
and is actually compliant with the [kernel](https://github.com/mongodb/mongo/blob/master/src/mongo/db/json.cpp).

## Todo

- [ ] benchmark.js
- [ ] EJSON.parse

## Example

```javascript
var EJSON = require('mongodb-extended-json');
var BSON = require('bson');

var doc = {
  _id: BSON.ObjectID(),
  last_seen_at: new Date(),
  display_name: undefined
};

console.log('Doc', doc);
console.log('JSON', JSON.stringify(doc));
console.log('EJSON', EJSON.stringify(doc));
```

Outputs

```
Doc { _id: 53c2ab5e4291b17b666d742a,
  last_seen_at: Sun Jul 13 2014 11:53:02 GMT-0400 (EDT),
  display_name: undefined }
JSON {"_id":"53c2ab5e4291b17b666d742a","last_seen_at":"2014-07-13T15:53:02.008Z"}
EJSON {"_id":{"$oid":"53c2ab5e4291b17b666d742a"},"last_seen_at":{"$date":1405266782008},"display_name":{"$undefined":true}}
```


