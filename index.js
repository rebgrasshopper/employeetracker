const mysql = require("mysql");
const Employee = require("./lib/employee");
const Role = require("./lib/role");
const Department = require("./lib/department");

//create mySQL database connection
const connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "root",
    database: "employee_db"
});

//action upon DB connection
connection.connect(function(err) {
    if (err) throw err;
    
})