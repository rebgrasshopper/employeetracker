const mysql = require("mysql");
const Employee = require("./lib/employee");
const Role = require("./lib/role");
const Department = require("./lib/department");
const inquirer = require("inquirer");

let employeeList = [];
let managerList = {};
let managerChoiceList = ["NULL"];
let roleList = {};
let roleChoiceList =[];
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
    }
]


//create mySQL database connection
const connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "root",
    database: "employee_db"
});


//query functions

function setVariables(){
    connection.query(
        "SELECT * FROM employees",
        (err, res) => {
            if (err) throw err;
            //parse every employee
            for (const employee of res) {
                //create list of employees
                employeeList.push(`${employee.firstName}, ${employee.lastName}`);
                //create list of managers
                if (employee.role === 1) {
                    managerList[`${employee.firstName}, ${employee.lastName}`] = employee.id;
                    managerChoiceList.push(`${employee.firstName}, ${employee.lastName}`)
                };
            }//end for
        }//end callback function
    );//end connection.query
    connection.query(
        "SELECT * FROM roles",
        function(err, res) {
            console.log("running roles query");
            if (err) throw err;
            for (const role of res) {
                roleList[role.title] = {
                    title: role.title,
                    id: role.id,
                    salary: role.salary,
                };
                roleChoiceList.push(role.title);
            }
        }
    )
}

function addToDB(db, addition){
    connection.query(
        `INSERT INTO ${db} SET ?`,
        addition,
        function(err) {
            if (err) throw err;
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
        console.log(answers);
        if (answers.action === "Add an employee") {
            const newEmployee = new Employee(answers.firstName, answers.lastName, roleList[answers.role].id, managerList[answers.manager]);
            addToDB("employees", newEmployee);
        }
        console.log(employeeList);
        console.log(managerList);
        console.log(roleChoiceList);
        console.log(roleList[answers.role].id);
        console.log(managerList[answers.manager]);

        connection.end()
    })



    
})