const connections = require("./lib/mysql/connection")
const Employee = require("./lib/classes/employee");
const Role = require("./lib/classes/role");
const Department = require("./lib/classes/department");
const inquirer = require("inquirer");
const queries = require("./lib/functions/queryfunctions");



//inquirer questions
const questions = [
    {
        type: "list",
        message: "Please Choose an action: ",
        name: "action",
        choices: ["View all employees", "View employees by department", "View employees by manager", "Add an employee", "Update an employee's role", "Update an employee's manager", "Remove an employee", "View all roles", "Add a role", "Remove a role", "View all departments", "Add a department", "Remove a department"]
    },
    {
        type: "list",
        message: `Please choose an employee to update: `,
        name: "choice",
        choices: queries.employeeList,
        when: (answers) => ((answers.action === "Update an employee's role") || (answers.action === "Update an employee's manager"))
    },
    {
        type: "list",
        message: `Please choose an new role: `,
        name: "chosenRole",
        choices: queries.roleChoiceList,
        when: (answers) => answers.action === "Update an employee's role",
    },
    {
        type: "list",
        message: `Please choose an employee to remove: `,
        name: "choice",
        choices: queries.employeeList,
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
        choices: queries.roleChoiceList,
        when: (answers) => answers.action === "Add an employee"
    },
    {
        type: "list",
        message: "Employee manager: ",
        name: "manager",
        choices: queries.managerChoiceList,
        when: (answers) => answers.action === "Add an employee"
    },
    {
        type: "list",
        message: "Select department: ",
        name: "department",
        choices: queries.departmentChoiceList,
        when: (answers) => answers.action === "View employees by department"
    },
    {
        type: "list",
        message: "Select manager: ",
        name: "viewManager",
        choices: queries.managerChoiceList,
        when: (answers) => answers.action === "View employees by manager"
    },

]

//action upon DB connections.connection
connections.connection.connect(function(err) {
    if (err) throw err;

    //initial setup of employee varibles
    queries.setVariables();

    //prompt for user input
    inquirer.prompt(questions).then(function(answers){
        if (answers.action === "Add an employee") {
            if (answers.manager === "NONE"){
                answers.manager = "NULL"
            }
            const newEmployee = new Employee(answers.firstName, answers.lastName, queries.roleList[answers.role].id, queries.managerList[answers.manager]);
            queries.addToDB("employees", newEmployee);

        } else if (answers.action === "View all employees"){
            queries.readAll();
        } else if (answers.action === "View employees by department"){
            queries.readDepartments(answers.department)
        } else if (answers.action === "View employees by manager"){
            queries.readManagers(answers.viewManager)
        } else if (answers.action === "Update an employee's role"){
            queries.updateEmployeeRole(answers.choice, answers.chosenRole);
        }


        connections.connection.end()
    })  
})