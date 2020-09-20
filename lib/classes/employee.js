// Employee Class, initialized with name, id, email, has getRole function
class Employee {
    constructor(firstName, lastName, role, manager){
        this.firstName = firstName;
        this.lastName = lastName;
        this.role = role;
        this.manager = manager;
    }

    getName = () => `${this.firstName} ${this.lastName}`;

    getRole = () => this.role;

    getManager = () => this.manager;
}

module.exports = Employee;

