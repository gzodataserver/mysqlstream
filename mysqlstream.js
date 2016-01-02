// imports
// =======

var mysql = require('mysql');
var util = require('util');
var Duplex = require('stream').Duplex;

// logging
// =======

var log = console.log.bind(console);
var error = console.error.bind(console);
var debug = function(){}; //console.log.bind(console, 'DEBUG');
//var debug = console.log.bind(console, 'DEBUG');

// writable stream
// ==============

DS = function (options, mysqlOptions) {
  var self = this;

  Duplex.call(this, options);

  this.on('finish', function() {
    error('finish in writable');
    self.conn.end();
  });

  this.readCalled = false;
  this.buffer = [];

  mysqlOptions.multipleStatements = true;
  this.mysqlOptions = mysqlOptions;
  this.conn = mysql.createConnection(mysqlOptions);
  this.conn.connect();
};
util.inherits(DS, Duplex);

DS.prototype._write = function (sql, enc, next) {
  var self = this;
  sql = sql.toString();

  var query = this.conn.query(sql);
  query
    .on('error', function(err) {
      error('ERROR in mysqlstream: ', err);
    })
    .on('fields', function(fields) {
    })
    .on('result', function(row) {
      self.buffer.push(row);
    })
    .on('end', function() {
      self._pushData();
      next();
      debug('END');
    });

};

DS.prototype._read = function () {
  this.readCalled = true;
  this._pushData();
};

DS.prototype._pushData = function() {
  if (this.buffer.length && this.readCalled) {
    this.pushRes = true;
    while(this.pushRes && this.buffer.length) {
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