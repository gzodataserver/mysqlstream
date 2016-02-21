// imports
// =======

var util = require('util');
var mysql = require('mysql');
var Duplex = require('stream').Duplex;
var crypto = require('crypto');

// logging
// =======

var log = console.log.bind(console);
var error = console.error.bind(console);
var debug = console.log.bind(console, 'DEBUG');

// writable stream
// ==============

DS = function (options, mysqlOptions) {
  var self = this;

  Duplex.call(this, options);

  this.on('finish', function () {
    debug('finish in writable');
    self.conn.end();
    self.push(null);
  });

  this.readCalled = false;
  this.buffer = [];

  mysqlOptions.multipleStatements = true;
  this.options = options;
  this.mysqlOptions = mysqlOptions;
  this.conn = mysql.createConnection(mysqlOptions);
  this.conn.connect();
};
util.inherits(DS, Duplex);

// calculate the MD5 etag for a JSON object, for instance using alg=md5 and deigest=hex
DS.prototype._etag = function (obj) {
  if (!this.options || !this.options.etagAlg || !this.options.etagDigest || !this.options.etagCols)
    return obj;

  // calculate etag
  var md5 = crypto.createHash(this.options.etagAlg);
  for (var key in obj) md5.update('' + obj[key]);

  // now only save the properties specified in etagCols
  var obj2 = {};
  obj2['@odata.etag'] = md5.digest(this.options.etagDigest);
  this.options.etagCols.forEach(function (key) {
    obj2[key] = obj[key];
  });

  return obj2;
};


DS.prototype._write = function (sql, enc, next) {
  var self = this;
  sql = sql.toString();

  var query = this.conn.query(sql);
  query
    .on('error', function (err) {
      self.emit('error', JSON.stringify(err));
    })
    .on('fields', function (fields) {})
    .on('result', function (row) {
      row = self._etag(row);
      self.buffer.push(row);
    })
    .on('end', function () {
      self._pushData();
      next();
      debug('END');
    });

};

DS.prototype._read = function () {
  this.readCalled = true;
  this._pushData();
};

DS.prototype._pushData = function () {
  if (this.buffer.length && this.readCalled) {
    this.pushRes = true;
    while (this.pushRes && this.buffer.length) {
      var row = this.buffer.shift();
      this.pushRes = this.push(JSON.stringify(row));
    }

    this.readCalled = false;
    this.buffer = [];
  }
};

// exports
// =======

module.exports = DS;
