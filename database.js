const mysql = require('mysql');
const dotenv = require('dotenv');
dotenv.config();

/* NOT HARDCODED */
var conn = mysql.createConnection({
  host: `${process.env.DB_HOST}`, 
  user: `${process.env.DB_USER}`,
  password: `${process.env.DB_PASSWORD}`,
  database: `${process.env.DB_NAME}`
}); 
conn.connect(function(err) {
  if (err) throw err;
  console.log('Database is connected successfully !');
});
module.exports = conn;
