const connections = require("../mysql/connection");
const table = require("table");


//FUNCTIONS


//Display retrieved database info in tables
function renderTable(res, managerList){
    
    //initialize displayTable
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
    console.log(" ");
}

//set employees and managers
function setEmployeesAndManagers(){
    return new Promise(function(resolve, reject){
        let employeeList = {};
        let employeeChoiceList = [];
        let managerList = {"NULL":"NULL"};
        let managerChoiceList = ["NONE"];

        //EMPLOYEES DB READ QUERY
        connections.connection.query(
            "SELECT * FROM employees",
            (err, res) => {
                if (err) reject(err);
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
                resolve([employeeChoiceList, employeeList, managerChoiceList, managerList]);
            }//end callback
        );//end employees query
    });//end promise
}

//set role arrays and objects
function setRoles(){
    return new Promise(function(resolve, reject){
        let roleList = {};
        let roleChoiceList = [];
            //ROLES DB READ QUERY
            connections.connection.query(
                "SELECT * FROM roles",
                function(err, res) {
                    if (err) resolve(err);
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
                    resolve([roleChoiceList, roleList]);
                }//end callback
            )//end roles query
    });//end promise
}

//set department arrays and objects
function setDepartments(){
    return new Promise(function(resolve, reject){
        let departmentList = {};
        let departmentChoiceList = [];
        //DEPARTMENTS DB READ QUERY 
        connections.connection.query(
            "SELECT * FROM departments",
            function(err, res) {
                if (err) resolve(err);
                for (let department of res){
                    departmentList[department.name] = department.id;
                    departmentChoiceList.push(department.name);
                }//end for
                resolve([departmentChoiceList, departmentList]);
            }//end callback
        )//end connection
    });//end promise
}


//retrieve all employees
function readAll(){
    return new Promise(function(resolve, reject){
        connections.connection.query(
            "SELECT employees.id, employees.firstName, employees.lastName, employees.manager, roles.title, roles.salary, departments.name FROM employees LEFT JOIN roles on employees.role = roles.id LEFT JOIN departments on roles.departmentID = departments.id GROUP BY departments.name, roles.title, employees.firstName, employees.lastName, employees.id, roles.salary ORDER BY roles.salary DESC;",
            function(err, res){
                if (err) reject(err);
                resolve(res);
            }
        );//end connection
    });//end promise
}//end readAll()


//retrieve employees in a given department
function readByDepartment(department) {
    return new Promise(function(resolve, reject){
        connections.connection.query(
            "SELECT employees.id, employees.firstName, employees.lastName, employees.manager, roles.title, roles.salary, departments.name FROM employees INNER JOIN roles on employees.role = roles.id INNER JOIN departments on roles.departmentID = departments.id WHERE departments.name LIKE ? GROUP BY departments.name, roles.title, employees.firstName, employees.lastName, employees.id, roles.salary;",
            department,
            function(err, res){
                if (err) reject(err);
                resolve(res);
            }
        );//end connection
    });//end promise
}//end readByDepartment()


//retrieve employees under given manager
function readByManager(manager) {
    return new Promise(function(resolve, reject){
        //send request with manager if manager not None
        if ((!(manager === undefined)) && (!(manager === "NONE"))){
            connections.connection.query(
                "SELECT employees.id, employees.firstName, employees.lastName, roles.title, employees.manager, roles.salary, departments.name FROM employees INNER JOIN roles on employees.role = roles.id INNER JOIN departments on roles.departmentID = departments.id WHERE employees.manager = ? GROUP BY departments.name, roles.title, employees.firstName, employees.lastName, employees.id, roles.salary;",
                manager,
                function(err, res) {
                    if (err) reject(err);
                 
                    resolve(res);
                }
            )
            //send request for employees with no manager
        } else {
            connections.connection.query(
                "SELECT employees.id, employees.firstName, employees.lastName, roles.title, employees.manager, roles.salary, departments.name FROM employees INNER JOIN roles on employees.role = roles.id INNER JOIN departments on roles.departmentID = departments.id WHERE employees.manager IS NULL GROUP BY departments.name, roles.title, employees.firstName, employees.lastName, employees.id, roles.salary;",
                function(err, res) {
                    if (err) reject(err);
                     
                    resolve(res);
                }
            );//end connection
        };//end if/else
    });//end promise
}//end readByManager()


//retrieve all roles
function viewAllRoles(){
    return new Promise(function(resolve, reject){
            //send query
            connections.connection.query(
                "SELECT roles.title, roles.salary, departments.name FROM roles INNER JOIN departments ON roles.departmentID = departments.id;",
                function(err, res) {
                    if (err) reject(err);
                    //initialize displayTable
                    let displayTable = [["Role", "Salary", "Department"], ["----------", "----------", "----------"]];
                    //fill displayTable
                    for (role of res) {
                        displayTable.push([role.title, role.salary, role.name]);
                    }
                    //print table
                    console.log(" ");
                    console.log(table.table(displayTable));
                    console.log(" ");

                     
                    resolve();
                }
            );//end connection
    });//end promise
}//end viewAllRoles()


//retrieve all departments
function viewAllDepartments(){
    return new Promise(function(resolve, reject){
            //send query
            connections.connection.query(
                "SELECT departments.name, departments.totalBudget, SUM(roles.salary) AS used_budget FROM departments LEFT JOIN roles on roles.departmentID = departments.id LEFT JOIN employees ON roles.id = employees.role GROUP BY departments.name, departments.totalBudget ORDER BY totalBudget DESC;",
                function(err, res) {
                    if (err) reject(err);
                    //initialize displayTable
                    let displayTable = [["Department", "Total Budget", "Used Budget"], ["-----------", "-----------", "-----------"]];
                    //fill displayTable
                    for (const department of res) {
                        displayTable.push([department.name, department.totalBudget, department.used_budget]);
                    }
                    //print table
                    console.log(" ");
                    console.log(table.table(displayTable));
                    console.log(" ");

                     
                    resolve();
                }
            );//end connection
    });//end promise
}//end viewAllDepartments()


//update employee info in DB given a column to update, the employee, and the new value
function updateEmployee(column, employee, value, roleList, managerList, employeeList) {
    return new Promise(function(resolve, reject){
            //replace named values with database IDs
            let newValue;
            if (column === "role"){
                newValue = roleList[value].id;
            } else if (column === "manager"){
                newValue = managerList[value];
            } else {
                throw new Error("You must specify 'role' or 'manager' for column argument.")
            }
            let employeeID = employeeList[employee];
            //send query
            connections.connection.query(
                "UPDATE employees SET ?? = ? WHERE id = ?;",
                [column, newValue, employeeID],
                function(err, res){
                    if (err) reject(err);
                    console.log(`${employee} has been reassigned to ${value}`);
                    console.log(" ");
                    resolve();
                }
            );//end connection
    });//end promise
}//end updateEmployee()


//delete a given row from a db identified by column(type) and value
function deleteFromDB(db, type, value, name, employeeChoiceList){
    return new Promise(function(resolve, reject){
        //send query
        connections.connection.query(
            "DELETE FROM ?? WHERE ?? = ?",
            [db, type, value],
            function(err, res){
                if (err) reject(err);
                console.log(`Deleted ${name} from ${db}.`);
                 
                resolve();
            }
        );//end connection
    });//end promise
}//end deleteFromDB()


//add item to a database
function addToDB(db, addition){
    return new Promise(function(resolve, reject){
            //send query
            connections.connection.query(
                `INSERT INTO ${db} SET ?`,
                addition,
                function(err, res) {
                    if (err) reject(err);
                     
                    resolve();
                }
            );//end connection
    });//end promise
}//end addToDB()




module.exports = {
    setEmployeesAndManagers,
    setDepartments,
    setRoles,
    addToDB,
    readAll,
    renderTable,
    readByDepartment,
    readByManager,
    updateEmployee,
    viewAllRoles,
    viewAllDepartments,
    deleteFromDB,
}