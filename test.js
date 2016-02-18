var MysqlStream = require('./mysqlstream.js');

// logging
// =======

var log = console.log.bind(console);
var error = console.error.bind(console);
var debug = function () {}; //console.log.bind(console, 'DEBUG');
//var debug = console.log.bind(console, 'DEBUG');

// test
// ========

var mysqlOptions = {
  host: 'localhost',
  user: process.env.ADMIN_USER,
  password: process.env.ADMIN_PASSWORD,
  //  database : process.env.ADMIN_USER,
};

var options = {
  etagAlg: 'md5',
  etagDigest: 'hex'
};

var ds;
function setup(err, etag) {
  if (err) console.log('ERRORRR', err);
  if (etag) ds = new MysqlStream(options, options);
  else ds = new MysqlStream(null, options);
  ds.on('error', setup);
  process.stdin.pipe(ds).pipe(process.stdout);
}

// change to false, true to test etags
setup(false, false);

log('Copy and paste this: select 1+1 as sol1; select 2+2 as sol2; select 3+3 as sol3; select 4+4 as sol4;');
log('Test error handling: create table test(conter int)');
