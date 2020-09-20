const connections = require("../mysql/connection");
const table = require("table");

let employeeList = [];
let departmentList = {};
let departmentChoiceList = [];
let managerList = {"NULL":"NULL"};
let managerChoiceList = ["NONE"];
let roleList = {};
let roleChoiceList =[];



function setVariables(){
    //EMPLOYEES DB READ QUERY
    connections.connection.query(
        "SELECT * FROM employees",
        (err, res) => {
            if (err) throw err;
            for (const employee of res) {
                //create list of employees
                employeeList.push(`${employee.firstName} ${employee.lastName}`);

                //create lists of managers
                if (employee.role === 1) {
                    //create manager object for pulling out id numbers later
                    managerList[`${employee.firstName}, ${employee.lastName}`] = employee.id;
                    //create manager array for user input choices
                    managerChoiceList.push(`${employee.firstName}, ${employee.lastName}`)
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
                    department: role.department_id,
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

function readDepartments(department) {
    connections.connection.query(
        "SELECT employees.id, employees.firstName, employees.lastName, employees.manager, roles.title, roles.salary, departments.name FROM employees INNER JOIN roles on employees.role = roles.id INNER JOIN departments on roles.department_id = departments.id WHERE departments.name LIKE ? GROUP BY departments.name, roles.title, employees.firstName, employees.lastName, employees.id, roles.salary;",
        department,
        function(err, res){
            if (err) throw err;
            renderTable(res);
        }
    )
}

function readManagers(manager) {
    let query;
    if (!(manager === "NONE")){
        connections.connection.query(
            "SELECT employees.id, employees.firstName, employees.lastName, roles.title, employees.manager, roles.salary, departments.name FROM employees INNER JOIN roles on employees.role = roles.id INNER JOIN departments on roles.department_id = departments.id WHERE employees.manager = ? GROUP BY departments.name, roles.title, employees.firstName, employees.lastName, employees.id, roles.salary;",
            managerList[manager],
            function(err, res) {
                if (err) throw err;
                renderTable(res);
            }
        )
    } else {
        connections.connection.query(
            "SELECT employees.id, employees.firstName, employees.lastName, roles.title, employees.manager, roles.salary, departments.name FROM employees INNER JOIN roles on employees.role = roles.id INNER JOIN departments on roles.department_id = departments.id WHERE employees.manager IS NULL GROUP BY departments.name, roles.title, employees.firstName, employees.lastName, employees.id, roles.salary;",
            function(err, res) {
                if (err) throw err;
                renderTable(res);
            }
        )
    }
}

function updateEmployeeRole(employee, role) {
    let newRole = roleList[role].id;
    let thisFirstName = employee.split(" ")[0];
    let thisLastName = employee.split(" ")[1];

    connections.connection.query(
        "UPDATE employees SET role = ? WHERE firstName = ? AND lastName = ?;",
        [newRole, thisFirstName, thisLastName],
        function(err, res){
            if (err) throw err;
            console.log(newRole, thisFirstName, thisLastName);
            console.log(res);
            console.log(`${employee} has been reassigned as ${role}`);
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
    console.log(table.table(displayTable));
}

function addToDB(db, addition){
    connections.connection.query(
        `INSERT INTO ${db} SET ?`,
        addition,
        function(err) {
            if (err) throw err;
        }
    )
}

function readAll(){
    connections.connection.query(
        "SELECT employees.id, employees.firstName, employees.lastName, employees.manager, roles.title, roles.salary, departments.name FROM employees INNER JOIN roles on employees.role = roles.id INNER JOIN departments on roles.department_id = departments.id GROUP BY departments.name, roles.title, employees.firstName, employees.lastName, employees.id, roles.salary;",
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
    readDepartments,
    readManagers,
    updateEmployeeRole,
    employeeList,
    departmentList,
    managerList,
    roleList,
    departmentChoiceList,
    managerChoiceList,
    roleChoiceList,
}