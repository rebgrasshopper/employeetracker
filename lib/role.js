class Role {
    constructor(title, salary, departmentId) {
        this.title = title;
        this.salary = salary;
        this.departmentId = departmentId
    }

    getTitle = () => this.title;

    getSalary = () => this.salary;

    getDepartmentId = () => this.departmentId;
}


module.exports = Role;