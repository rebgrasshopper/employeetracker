class Role {
    constructor(title, salary, departmentID) {
        this.title = title;
        this.salary = salary;
        this.departmentID = departmentID
    }

    getTitle = () => this.title;

    getSalary = () => this.salary;

    getDepartmentID = () => this.departmentID;
}


module.exports = Role;