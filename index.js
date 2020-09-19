const mysql = require("mysql");
const Employee = require("./lib/employee");
const Role = require("./lib/role");
const Department = require("./lib/department");
const inquirer = require("inquirer");
const table = require("table");

let employeeList = [];
let departmentList = {};
let departmentChoiceList = [];
let managerList = {"NULL":"NULL"};
let managerChoiceList = ["NONE"];
let roleList = {};
let roleChoiceList =[];
let displayTable = [];

//inquirer questions
const questions = [
    {
        type: "list",
        message: "Please Choose an action: ",
        name: "action",
        choices: ["View all employees", "View employees by department", "View employees by manager", "Add an employee", "Update an employee's role", "Update an employee's manager", "Remove an employee", "View all roles", "Add a role", "Remove a role"]
    },
    {
        type: "list",
        message: `Please choose an employee to update: `,
        name: "choice",
        choices: employeeList,
        when: (answers) => ((answers.action === "Update an employee's role") || (answers.action === "Update an employee's manager"))
    },
    {
        type: "list",
        message: `Please choose an new role: `,
        name: "chosenRole",
        choices: roleChoiceList,
        when: (answers) => answers.action === "Update an employee's role",
    },
    {
        type: "list",
        message: `Please choose an employee to remove: `,
        name: "choice",
        choices: employeeList,
        when: (answers) => (answers.action === "Remove an employee")
    },
    {
        type: "input",
        message: "Employee first name: ",
        name: "firstName",
        when: (answers) => answers.action === "Add an employee"
    },
    {
        type: "input",
        message: "Employee last name: ",
        name: "lastName",
        when: (answers) => answers.action === "Add an employee"
    },
    {
        type: "list",
        message: "Employee role: ",
        name: "role",
        choices: roleChoiceList,
        when: (answers) => answers.action === "Add an employee"
    },
    {
        type: "list",
        message: "Employee manager: ",
        name: "manager",
        choices: managerChoiceList,
        when: (answers) => answers.action === "Add an employee"
    },
    {
        type: "list",
        message: "Select department: ",
        name: "department",
        choices: departmentChoiceList,
        when: (answers) => answers.action === "View employees by department"
    },
    {
        type: "list",
        message: "Select manager: ",
        name: "viewManager",
        choices: managerChoiceList,
        when: (answers) => answers.action === "View employees by manager"
    },

]


//create mySQL database connection
const connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "root",
    database: "employee_db"
});

//HELPER FUNCTIONS

function renderTable(res){
    displayTable.push(["ID", "First Name", "Last Name", "Role", "Department", "Salary", "Manager"])
    displayTable.push(["---", "------------", "------------", "------------", "------------", "---------", "------------------"]);
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


//QUERY FUNCTIONS

function setVariables(){
    //EMPLOYEES DB READ QUERY
    connection.query(
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
    connection.query(
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
    connection.query(
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

function addToDB(db, addition){
    connection.query(
        `INSERT INTO ${db} SET ?`,
        addition,
        function(err) {
            if (err) throw err;
        }
    )
}

function readAll(){
    connection.query(
        "SELECT employees.id, employees.firstName, employees.lastName, employees.manager, roles.title, roles.salary, departments.name FROM employees INNER JOIN roles on employees.role = roles.id INNER JOIN departments on roles.department_id = departments.id GROUP BY departments.name, roles.title, employees.firstName, employees.lastName, employees.id, roles.salary;",
        function(err, res){
            if (err) throw err;
           renderTable(res);
        }
    )
}

function readDepartments(department) {
    connection.query(
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
        connection.query(
            "SELECT employees.id, employees.firstName, employees.lastName, roles.title, employees.manager, roles.salary, departments.name FROM employees INNER JOIN roles on employees.role = roles.id INNER JOIN departments on roles.department_id = departments.id WHERE employees.manager = ? GROUP BY departments.name, roles.title, employees.firstName, employees.lastName, employees.id, roles.salary;",
            managerList[manager],
            function(err, res) {
                if (err) throw err;
                renderTable(res);
            }
        )
    } else {
        connection.query(
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

    connection.query(
        "UPDATE employees SET role = ? WHERE firstName = ? AND lastName = ?;",
        [newRole, thisFirstName, thisLastName],
        function(err, res){
            if (err) throw err;
            console.log(`${employee} has been reassigned as ${role}`);
        }
    )
}


//action upon DB connection
connection.connect(function(err) {
    if (err) throw err;

    //initial setup of employee varibles
    setVariables();

    //prompt for user input
    inquirer.prompt(questions).then(function(answers){
        if (answers.action === "Add an employee") {
            if (answers.manager === "NONE"){
                answers.manager = "NULL"
            }
            const newEmployee = new Employee(answers.firstName, answers.lastName, roleList[answers.role].id, managerList[answers.manager]);
            addToDB("employees", newEmployee);

        } else if (answers.action === "View all employees"){
            readAll();
        } else if (answers.action === "View employees by department"){
            readDepartments(answers.department)
        } else if (answers.action === "View employees by manager"){
            readManagers(answers.viewManager)
        } else if (answers.action === "Update an employee's role"){
            updateEmployeeRole(answers.choice, answers.chosenRole);
        }


        connection.end()
    })  
})