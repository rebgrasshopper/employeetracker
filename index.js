const connections = require("./lib/mysql/connection")
const Employee = require("./lib/classes/employee");
const Role = require("./lib/classes/role");
const Department = require("./lib/classes/department");
const inquirer = require("inquirer");
const queries = require("./lib/functions/queryfunctions");


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

                    let questions = [
                        {
                            type: "list",
                            message: "Please Choose an action: ",
                            name: "action",
                            choices: ["View all employees", "View employees by department", "View employees by manager", "Add an employee", "Update an employee's role", "Update an employee's manager", "Remove an employee", "View all roles", "Add a role", "Remove a role", "View all departments", "Add a department", "Remove a department", "EXIT"]
                        },
                        {
                            type: "list",
                            message: `Please choose an employee to update: `,
                            name: "choice",
                            choices:  employeesManagers[0],
                            when: (answers) => ((answers.action === "Update an employee's role") || (answers.action === "Update an employee's manager"))
                        },
                        {
                            type: "list",
                            message: `Please choose a new role: `,
                            name: "chosenRole",
                            choices: roles[0],
                            when: (answers) => answers.action === "Update an employee's role",
                        },
                        {
                            type: "list",
                            message: `Please choose a new manager: `,
                            name: "chosenManager",
                            choices: employeesManagers[2],
                            when: (answers) => answers.action === "Update an employee's manager",
                        },
                        {
                            type: "input",
                            message: "Employee first name: ",
                            name: "firstName",
                            when: (answers) => answers.action === "Add an employee",
                        },
                        {
                            type: "input",
                            message: "Employee last name: ",
                            name: "lastName",
                            when: (answers) => answers.action === "Add an employee",
                        },
                        {
                            type: "list",
                            message: "Employee role: ",
                            name: "role",
                            choices: roles[0],
                            when: (answers) => answers.action === "Add an employee",
                        },
                        {
                            type: "list",
                            message: "Employee manager: ",
                            name: "manager",
                            choices: employeesManagers[2],
                            when: (answers) => answers.action === "Add an employee",
                        },
                        {
                            type: "list",
                            message: "Select department: ",
                            name: "department",
                            choices: departments[0],
                            when: (answers) => answers.action === "View employees by department",
                        },
                        {
                            type: "list",
                            message: "Select manager: ",
                            name: "viewManager",
                            choices: employeesManagers[2],
                            when: (answers) => answers.action === "View employees by manager",
                        },
                        {
                            type: "input",
                            message: "Role title: ",
                            name: "roleTitle",
                            when: (answers) => answers.action === "Add a role",
                        },
                        {
                            type: "input",
                            message: "Role salary: ",
                            name: "roleSalary",
                            when: (answers) => answers.action === "Add a role",
                        },
                        {
                            type: "list",
                            message: "Select role department: ",
                            name: "roleDepartment",
                            choices: departments[0],
                            when: (answers) => answers.action === "Add a role",
                        },
                        {
                            type: "input",
                            message: "Department name: ",
                            name: "departmentName",
                            when: (answers) => answers.action === "Add a department",
                        },
                        {
                            type: "number",
                            message: "Department budget: ",
                            name: "departmentBudget",
                            when: (answers) => answers.action === "Add a department",
                        },
                        {
                            type: "list",
                            message: "Select role to remove: ",
                            name: "removeRole",
                            choices: roles[0],
                            when: (answers) => answers.action === "Remove a role",
                        },
                        {
                            type: "list",
                            message: "Select department to remove: ",
                            name: "removeDepartment",
                            choices: departments[0],
                            when: (answers) => answers.action === "Remove a department",
                        },
                        {
                            type: "list",
                            message: "Select employee to remove: ",
                            name: "removeEmployee",
                            choices: employeesManagers[0],
                            when: (answers) => answers.action === "Remove an employee",
                        },
                    ];

                //Ask questions and act upon answers
                inquirer.prompt(questions).then(function(answers){

                    switch(answers.action){
                        case "View all employees":
                                    queries.readAll().then(results => {
                                        queries.renderTable(results, employeesManagers[3])
                                        setTimeout(runEmployeeTracker, 500)
                                    });
                            break;
                        case "Add an employee":
                                    //create an object with the employee information to feed the DB
                                    if (answers.manager === "NONE"){
                                        newEmployee = new Employee(answers.firstName, answers.lastName, roles[1][answers.role].id);
                                    } else {
                                        newEmployee = new Employee(answers.firstName, answers.lastName, roles[1][answers.role].id, employeesManagers[3][answers.manager]);
                                    }
                                    queries.addToDB("employees", newEmployee).then(setTimeout(runEmployeeTracker, 500));
                            break;
                        case "View employees by department":
                                    queries.readByDepartment(answers.department).then(results => {
                                        queries.renderTable(results, employeesManagers[3])
                                        setTimeout(runEmployeeTracker, 500);
                                    });
                                        
                            break;
                        case "View employees by manager":
                                    queries.readByManager(employeesManagers[3][answers.viewManager]).then(results => {
                                        queries.renderTable(results, employeesManagers[3])
                                        setTimeout(runEmployeeTracker, 500);
                                    });
                            break;
                        case "Update an employee's role":      
                                    queries.updateEmployee("role", answers.choice, answers.chosenRole, roles[1], employeesManagers[3], employeesManagers[1]).then(setTimeout(runEmployeeTracker, 500));
                            break;
                        case "Update an employee's manager":  
                                    queries.updateEmployee("manager", answers.choice, answers.chosenManager, roles[1], employeesManagers[3], employeesManagers[1]).then(setTimeout(runEmployeeTracker, 500));
                            break;
                        case "View all roles":      
                                    queries.viewAllRoles().then(setTimeout(runEmployeeTracker, 500));
                            break;
                        case "View all departments":      
                                    queries.viewAllDepartments().then(runEmployeeTracker);
                            break;
                        case "Add a role":      
                                    const newRole = new Role(answers.roleTitle, answers.roleSalary, departments[1][answers.roleDepartment]);
                                    queries.addToDB("roles", newRole).then(setTimeout(runEmployeeTracker, 500));
                            break;
                        case "Add a department":      
                                    const newDepartment = new Department(answers.departmentName, answers.departmentBudget);
                                    queries.addToDB("departments", newDepartment).then(setTimeout(runEmployeeTracker, 500));
                            break;
                        case "Remove a role":      
                                    queries.deleteFromDB("roles", "id", roles[1][answers.removeRole].id, answers.removeRole, employeesManagers[0]).then(setTimeout(runEmployeeTracker, 500));
                            break;
                        case "Remove a department":      
                                    queries.deleteFromDB("departments", "id", departments[1][answers.removeDepartment], answers.removeDepartment, employeesManagers[0]).then(setTimeout(runEmployeeTracker, 500));
                            break;
                        case "Remove an employee":      
                                    queries.deleteFromDB("employees", "id", employeesManagers[1][answers.removeEmployee], answers.removeEmployee, employeesManagers[0]).then(setTimeout(runEmployeeTracker, 500));
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
