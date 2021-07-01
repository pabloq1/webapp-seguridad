var mysql = require('mysql');
const dotenv = require('dotenv');
dotenv.config();

/* NOT HARDCODED */
var conn = mysql.createConnection({
  host: `${process.env.DB_HOST}`, // assign your host name
  user: `${process.env.DB_USER}`,      //  assign your database username
  password: `${process.env.DB_PASSWORD}`,  // assign your database password
  database: 'registration' // assign database Name
}); 
conn.connect(function(err) {
  if (err) throw err;
  console.log('Database is connected successfully !');
});
module.exports = conn;

// YA VENGO