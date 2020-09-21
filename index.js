const connections = require("./lib/mysql/connection")
const Employee = require("./lib/classes/employee");
const Role = require("./lib/classes/role");
const Department = require("./lib/classes/department");
const inquirer = require("inquirer");
const queries = require("./lib/functions/queryfunctions");
const { addToDB } = require("./lib/functions/queryfunctions");



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
        choices: queries.employeeChoiceList,
        when: (answers) => ((answers.action === "Update an employee's role") || (answers.action === "Update an employee's manager"))
    },
    {
        type: "list",
        message: `Please choose a new role: `,
        name: "chosenRole",
        choices: queries.roleChoiceList,
        when: (answers) => answers.action === "Update an employee's role",
    },
    {
        type: "list",
        message: `Please choose a new manager: `,
        name: "chosenManager",
        choices: queries.managerChoiceList,
        when: (answers) => answers.action === "Update an employee's manager",
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
    {
        type: "input",
        message: "Role title: ",
        name: "roleTitle",
        when: (answers) => answers.action === "Add a role"
    },
    {
        type: "input",
        message: "Role salary: ",
        name: "roleSalary",
        when: (answers) => answers.action === "Add a role"
    },
    {
        type: "list",
        message: "Select role department: ",
        name: "roleDepartment",
        choices: queries.departmentChoiceList,
        when: (answers) => answers.action === "Add a role"
    },
    {
        type: "input",
        message: "Department name: ",
        name: "departmentName",
        when: (answers) => answers.action === "Add a department"
    },
    {
        type: "number",
        message: "Department budget: ",
        name: "departmentBudget",
        when: (answers) => answers.action === "Add a department"
    },
    {
        type: "list",
        message: "Select role to remove: ",
        name: "removeRole",
        choices: queries.roleChoiceList,
        when: (answers) => answers.action === "Remove a role"
    },
    {
        type: "list",
        message: "Select department to remove: ",
        name: "removeDepartment",
        choices: queries.departmentChoiceList,
        when: (answers) => answers.action === "Remove a department"
    },
    {
        type: "list",
        message: "Select employee to remove: ",
        name: "removeEmployee",
        choices: queries.employeeChoiceList,
        when: (answers) => answers.action === "Remove an employee"
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
            //change out NONE for the mySQL parseable NULL
            if (answers.manager === "NONE"){
                answers.manager = "NULL"
            }
            //create an object with the employee information to feed the DB
            const newEmployee = new Employee(answers.firstName, answers.lastName, queries.roleList[answers.role].id, queries.managerList[answers.manager]);
            queries.addToDB("employees", newEmployee);

        } else if (answers.action === "View all employees"){
            queries.readAll();
        } else if (answers.action === "View employees by department"){
            queries.readByDepartment(answers.department)
        } else if (answers.action === "View employees by manager"){
            queries.readByManager(answers.viewManager)
        } else if (answers.action === "Update an employee's role"){
            queries.updateEmployeeRole(answers.choice, answers.chosenRole);
        } else if (answers.action === "Update an employee's manager"){
            queries.updateEmployeeManager(answers.choice, answers.chosenManager);
        } else if (answers.action === "View all roles"){
            queries.viewAllRoles();
        } else if (answers.action === "View all departments"){
            queries.viewAllDepartments();
        } else if (answers.action === "Add a role"){
            const newRole = new Role(answers.roleTitle, answers.roleSalary, queries.departmentList[answers.roleDepartment]);
            addToDB("roles", newRole);
        } else if (answers.action === "Add a department"){
            const newDepartment = new Department(answers.departmentName, answers.departmentBudget);
            addToDB("departments", newDepartment);
        } else if (answers.action === "Remove a role"){
            queries.deleteFromDB("roles", "id", queries.roleList[answers.removeRole].id, answers.removeRole);
        } else if (answers.action === "Remove a department"){
            queries.deleteFromDB("departments", "id", queries.departmentList[answers.removeDepartment], answers.removeDepartment);
        } else if (answers.action === "Remove an employee"){
            console.log(answers.removeEmployee);
        }


        connections.connection.end()
    })  
})