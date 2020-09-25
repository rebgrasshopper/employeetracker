const connections = require("./lib/mysql/connection")
const Employee = require("./lib/classes/employee");
const Role = require("./lib/classes/role");
const Department = require("./lib/classes/department");
const inquirer = require("inquirer");
const queries = require("./lib/functions/queryfunctions");


let initialQuestion = [
    {
        type: "list",
        message: "Please Choose an action: ",
        name: "action",
        choices: ["View all employees", "View employees by department", "View employees by manager", "Add an employee", "Update an employee's role", "Update an employee's manager", "Remove an employee", "View all roles", "Add a role", "Remove a role", "View all departments", "Add a department", "Remove a department", "EXIT"]
    }
];
let actionAnswer;

let employeesManagers;
let roles;
let departments;


//action upon DB connections.connection
connections.connection.connect(function(err) {
    if (err) throw err;
    function runEmployeeTracker(){
    //Objects with IDs
        //Set variables with employee, manager, role, and department information
        queries.setEmployeesAndManagers().then(data => {
            employeesManagers = data;
            queries.setRoles().then(data => {
                roles = data;
                queries.setDepartments().then(data => {
                    departments = data;

                //Ask questions and act upon answers
                inquirer.prompt(initialQuestion).then(function(answers){
                    actionAnswer = answers.action;
                    //Set inquirer questions
                    let specificQuestions = [
                        {
                            type: "list",
                            message: `Please choose an employee to update: `,
                            name: "choice",
                            choices:  employeesManagers[0],
                            when: () => ((actionAnswer === "Update an employee's role") || (actionAnswer === "Update an employee's manager"))
                        },
                        {
                            type: "list",
                            message: `Please choose a new role: `,
                            name: "chosenRole",
                            choices: roles[0],
                            when: () => actionAnswer === "Update an employee's role",
                        },
                        {
                            type: "list",
                            message: `Please choose a new manager: `,
                            name: "chosenManager",
                            choices: employeesManagers[2],
                            when: () => actionAnswer === "Update an employee's manager",
                        },
                        {
                            type: "input",
                            message: "Employee first name: ",
                            name: "firstName",
                            when: () => actionAnswer === "Add an employee",
                        },
                        {
                            type: "input",
                            message: "Employee last name: ",
                            name: "lastName",
                            when: () => actionAnswer === "Add an employee",
                        },
                        {
                            type: "list",
                            message: "Employee role: ",
                            name: "role",
                            choices: roles[0],
                            when: () => actionAnswer === "Add an employee",
                        },
                        {
                            type: "list",
                            message: "Employee manager: ",
                            name: "manager",
                            choices: employeesManagers[2],
                            when: () => actionAnswer === "Add an employee",
                        },
                        {
                            type: "list",
                            message: "Select department: ",
                            name: "department",
                            choices: departments[0],
                            when: () => actionAnswer === "View employees by department",
                        },
                        {
                            type: "list",
                            message: "Select manager: ",
                            name: "viewManager",
                            choices: employeesManagers[2],
                            when: () => actionAnswer === "View employees by manager",
                        },
                        {
                            type: "input",
                            message: "Role title: ",
                            name: "roleTitle",
                            when: () => actionAnswer === "Add a role",
                        },
                        {
                            type: "input",
                            message: "Role salary: ",
                            name: "roleSalary",
                            when: () => actionAnswer === "Add a role",
                        },
                        {
                            type: "list",
                            message: "Select role department: ",
                            name: "roleDepartment",
                            choices: departments[0],
                            when: () => actionAnswer === "Add a role",
                        },
                        {
                            type: "input",
                            message: "Department name: ",
                            name: "departmentName",
                            when: () => actionAnswer === "Add a department",
                        },
                        {
                            type: "number",
                            message: "Department budget: ",
                            name: "departmentBudget",
                            when: () => actionAnswer === "Add a department",
                        },
                        {
                            type: "list",
                            message: "Select role to remove: ",
                            name: "removeRole",
                            choices: roles[0],
                            when: () => actionAnswer === "Remove a role",
                        },
                        {
                            type: "list",
                            message: "Select department to remove: ",
                            name: "removeDepartment",
                            choices: departments[0],
                            when: () => actionAnswer === "Remove a department",
                        },
                        {
                            type: "list",
                            message: "Select employee to remove: ",
                            name: "removeEmployee",
                            choices: employeesManagers[0],
                            when: () => actionAnswer === "Remove an employee",
                        },
                        
                    ];

                    switch(answers.action){
                        case "View all employees":
                                inquirer.prompt(specificQuestions).then(function(answers){
                                    queries.readAll().then(results => {
                                        queries.renderTable(results, employeesManagers[3])
                                        setTimeout(runEmployeeTracker, 500)
                                    });
                                })
                            break;
                        case "Add an employee":
                                inquirer.prompt(specificQuestions).then(function(answers){
                                    //create an object with the employee information to feed the DB
                                    if (answers.manager === "NONE"){
                                        newEmployee = new Employee(answers.firstName, answers.lastName, roles[1][answers.role].id);
                                    } else {
                                        newEmployee = new Employee(answers.firstName, answers.lastName, roles[1][answers.role].id, employeesManagers[3][answers.manager]);
                                    }
                                    queries.addToDB("employees", newEmployee).then(setTimeout(runEmployeeTracker, 500));
                                })
                            break;
                        case "View employees by department":
                                inquirer.prompt(specificQuestions).then(function(answers){
                                    queries.readByDepartment(answers.department).then(results => {
                                        queries.renderTable(results, employeesManagers[3])
                                        setTimeout(runEmployeeTracker, 500);
                                    });
                                        
                                })
                            break;
                        case "View employees by manager":
                                inquirer.prompt(specificQuestions).then(function(answers){
                                    queries.readByManager(employeesManagers[3][answers.viewManager]).then(results => {
                                        queries.renderTable(results, employeesManagers[3])
                                        setTimeout(runEmployeeTracker, 500);
                                    });
                                })
                            break;
                        case "Update an employee's role":
                                inquirer.prompt(specificQuestions).then(function(answers){      
                                    queries.updateEmployee("role", answers.choice, answers.chosenRole, roles[1], employeesManagers[3], employeesManagers[1]).then(setTimeout(runEmployeeTracker, 500));
                                })
                            break;
                        case "Update an employee's manager":
                                inquirer.prompt(specificQuestions).then(function(answers){      
                                    queries.updateEmployee("manager", answers.choice, answers.chosenManager, roles[1], employeesManagers[3], employeesManagers[1]).then(setTimeout(runEmployeeTracker, 500));
                                })
                            break;
                        case "View all roles":
                                inquirer.prompt(specificQuestions).then(function(answers){      
                                    queries.viewAllRoles().then(setTimeout(runEmployeeTracker, 500));
                                })
                            break;
                        case "View all departments":
                                inquirer.prompt(specificQuestions).then(function(answers){      
                                    queries.viewAllDepartments().then(runEmployeeTracker);
                                })
                            break;
                        case "Add a role":
                                inquirer.prompt(specificQuestions).then(function(answers){      
                                    const newRole = new Role(answers.roleTitle, answers.roleSalary, departments[1][answers.roleDepartment]);
                                    queries.addToDB("roles", newRole).then(setTimeout(runEmployeeTracker, 500));
                                })
                            break;
                        case "Add a department":
                                inquirer.prompt(specificQuestions).then(function(answers){      
                                    const newDepartment = new Department(answers.departmentName, answers.departmentBudget);
                                    queries.addToDB("departments", newDepartment).then(setTimeout(runEmployeeTracker, 500));
                                })
                            break;
                        case "Remove a role":
                                inquirer.prompt(specificQuestions).then(function(answers){      
                                    queries.deleteFromDB("roles", "id", roles[1][answers.removeRole].id, answers.removeRole, employeesManagers[0]).then(setTimeout(runEmployeeTracker, 500));
                                })
                            break;
                        case "Remove a department":
                                inquirer.prompt(specificQuestions).then(function(answers){      
                                    queries.deleteFromDB("departments", "id", departments[1][answers.removeDepartment], answers.removeDepartment, employeesManagers[0]).then(setTimeout(runEmployeeTracker, 500));
                                })
                            break;
                        case "Remove an employee":
                                inquirer.prompt(specificQuestions).then(function(answers){      
                                    queries.deleteFromDB("employees", "id", employeesManagers[1][answers.removeEmployee], answers.removeEmployee, employeesManagers[0]).then(setTimeout(runEmployeeTracker, 500));
                                })
                            break;
                        case "EXIT":
                            connections.connection.end();
                    }//end switch
                })//end inquirer prompt
            });//setDepartments
        });//setRoles
    });//setEmployeesAndManagers
    
}
    
runEmployeeTracker();
});
