const mysql = require("mysql");


//create mySQL database connection
const connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "root",
    database: "employee_db"
});


module.exports = { connection }