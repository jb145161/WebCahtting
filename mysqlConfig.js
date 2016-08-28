var mysql = require('mysql');

var client = mysql.createConnection({
  host:'localhost',
  user:'root',
  password:'1234',
  database: 'chatting',
  port: 3307
});

module.exports = client;