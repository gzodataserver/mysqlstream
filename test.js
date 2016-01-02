var MysqlStream = require('./mysqlstream.js');

// logging
// =======

var log = console.log.bind(console);
var error = console.error.bind(console);
var debug = function(){}; //console.log.bind(console, 'DEBUG');
//var debug = console.log.bind(console, 'DEBUG');

// test
// ========

var options = {
  host     : 'localhost',
  user     : process.env.ADMIN_USER,
  password : process.env.ADMIN_PASSWORD,
//  database : process.env.ADMIN_USER,
};

var ds = new MysqlStream(null, options);
process.stdin.pipe(ds).pipe(process.stdout);
log('Copy and paste this: select 1+1 as sol1; select 2+2 as sol2; select 3+3 as sol3; select 4+4 as sol4;');
