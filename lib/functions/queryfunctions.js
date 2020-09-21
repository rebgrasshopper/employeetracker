const connections = require("../mysql/connection");
const table = require("table");

//Objects with IDs
let employeeList = {};
let managerList = {"NULL":"NULL"};
let roleList = {};
let departmentList = {};

//arrays for inquirer lists
let employeeChoiceList = [];
let managerChoiceList = ["NONE"];
let roleChoiceList =[];
let departmentChoiceList = [];



// console.log(queries.roleChoiceList);
// console.log(queries.departmentChoiceList);
// console.log(queries.employeeChoiceList);
// console.log(queries.managerChoiceList);
//FUNCTIONS

function setVariables(){
    console.log("CALLING SET VARIABLES");
    //EMPLOYEES DB READ QUERY
    connections.connection.query(
        "SELECT * FROM employees",
        (err, res) => {
            if (err) throw err;
            for (const employee of res) {
                //create employee Array for user input choices
                employeeChoiceList.push(`${employee.firstName} ${employee.lastName}`);
                employeeList[`${employee.firstName} ${employee.lastName}`] = employee.id;

                //create lists of managers
                if (employee.role === 1) {
                    //create manager object for pulling out id numbers later
                    managerList[`${employee.firstName} ${employee.lastName}`] = employee.id;
                    //create manager array for user input choices
                    managerChoiceList.push(`${employee.firstName} ${employee.lastName}`)
                };//end if employee is manager
            }//end for
        }//end callback
    );//end employees query

    //ROLES DB READ QUERY
    connections.connection.query(
        "SELECT * FROM roles",
        function(err, res) {
            if (err) throw err;
            //create lists of roles
            for (const role of res) {
                //create role object for pulling out info later
                roleList[role.title] = {
                    title: role.title,
                    id: role.id,
                    salary: role.salary,
                    department: role.departmentID,
                };
                //create role array for user input choices
                roleChoiceList.push(role.title);
            }//end for
        }//end callback
    )//end roles query

    //DEPARTMENTS DB READ QUERY
    connections.connection.query(
        "SELECT * FROM departments",
        function(err, res) {
            if (err) throw err;
            
            for (let department of res){
                departmentList[department.name] = department.id;
                departmentChoiceList.push(department.name);
            }

        }
    )
}//end setVariables()


function readByDepartment(department) {
    connections.connection.query(
        "SELECT employees.id, employees.firstName, employees.lastName, employees.manager, roles.title, roles.salary, departments.name FROM employees INNER JOIN roles on employees.role = roles.id INNER JOIN departments on roles.departmentID = departments.id WHERE departments.name LIKE ? GROUP BY departments.name, roles.title, employees.firstName, employees.lastName, employees.id, roles.salary;",
        department,
        function(err, res){
            if (err) throw err;
            console.log(res);
            renderTable(res);
        }
    )
}


function readByManager(manager) {
    let query;
    if (!(manager === "NONE")){
        connections.connection.query(
            "SELECT employees.id, employees.firstName, employees.lastName, roles.title, employees.manager, roles.salary, departments.name FROM employees INNER JOIN roles on employees.role = roles.id INNER JOIN departments on roles.departmentID = departments.id WHERE employees.manager = ? GROUP BY departments.name, roles.title, employees.firstName, employees.lastName, employees.id, roles.salary;",
            managerList[manager],
            function(err, res) {
                if (err) throw err;
                renderTable(res);
            }
        )
    } else {
        connections.connection.query(
            "SELECT employees.id, employees.firstName, employees.lastName, roles.title, employees.manager, roles.salary, departments.name FROM employees INNER JOIN roles on employees.role = roles.id INNER JOIN departments on roles.departmentID = departments.id WHERE employees.manager IS NULL GROUP BY departments.name, roles.title, employees.firstName, employees.lastName, employees.id, roles.salary;",
            function(err, res) {
                if (err) throw err;
                renderTable(res);
            }
        )
    }
}


function viewAllRoles(){
    connections.connection.query(
        "SELECT roles.title, roles.salary, departments.name FROM roles INNER JOIN departments ON roles.departmentID = departments.id;",
        function(err, res) {
            if (err) throw err;
            let displayTable = [["Role", "Salary", "Department"], ["----------", "----------", "----------"]];
            for (role of res) {
                displayTable.push([role.title, role.salary, role.name]);
            }
            console.log(" ");
            console.log(table.table(displayTable));
        }
    )
}


function viewAllDepartments(){
    connections.connection.query(
        "SELECT departments.name, departments.totalBudget, SUM(roles.salary) AS used_budget FROM departments LEFT JOIN roles on roles.departmentID = departments.id LEFT JOIN employees ON roles.id = employees.role GROUP BY departments.name, departments.totalBudget ORDER BY totalBudget DESC;",
        function(err, res) {
            if (err) throw err;
            let displayTable = [["Department", "Total Budget", "Used Budget"], ["-----------", "-----------", "-----------"]];
            for (const department of res) {
                displayTable.push([department.name, department.totalBudget, department.used_budget]);
            }
            console.log(" ");
            console.log(table.table(displayTable));
        }
    )
}


function updateEmployeeRole(employee, role) {
    let newRole = roleList[role].id;
    let employeeID = employeeList[employee];

    connections.connection.query(
        "UPDATE employees SET role = ? WHERE id = ?;",
        [newRole, employeeID],
        function(err, res){
            if (err) throw err;
            console.log(`${employee} has been reassigned as ${role}`);
        }
    )
}


function deleteFromDB(db, type, value, name){
    connections.connection.query(
        "DELETE FROM ?? WHERE ?? = ?",
        [db, type, value],
        function(err, res){
            if (err) throw err;
            console.log(`Deleted ${name} from ${db}.`);
        }
    )
}


function renderTable(res){
    
    let displayTable = [
        ["ID", "First Name", "Last Name", "Role", "Department", "Salary", "Manager"],
        ["---", "------------", "------------", "------------", "------------", "---------", "------------------"],
    ];
    for (const employee of res) {

        //find manager name
        let employeeManager;
        for (let manager in managerList) {
            if (managerList[manager] === employee.manager) {
                employeeManager = manager;
            }
        }

        //update displayTable
        displayTable.push([employee.id, employee.firstName, employee.lastName, employee.title, employee.name, employee.salary, employeeManager]);
    }
    console.log(" ");
    console.log(table.table(displayTable));
}

function addToDB(db, addition){
    connections.connection.query(
        `INSERT INTO ${db} SET ?`,
        addition,
        function(err, res) {
            if (err) throw err;
        }
    )
}


function readAll(){
    connections.connection.query(
        "SELECT employees.id, employees.firstName, employees.lastName, employees.manager, roles.title, roles.salary, departments.name FROM employees INNER JOIN roles on employees.role = roles.id INNER JOIN departments on roles.departmentID = departments.id GROUP BY departments.name, roles.title, employees.firstName, employees.lastName, employees.id, roles.salary;",
        function(err, res){
            if (err) throw err;
           renderTable(res);
        }
    )
}



module.exports = {
    addToDB,
    readAll,
    renderTable,
    setVariables,
    readByDepartment,
    readByManager,
    updateEmployeeRole,
    viewAllRoles,
    viewAllDepartments,
    deleteFromDB,
    employeeList,
    departmentList,
    managerList,
    roleList,
    employeeChoiceList,
    departmentChoiceList,
    managerChoiceList,
    roleChoiceList,
}