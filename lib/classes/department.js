class Department {
    constructor(name, totalBudget) {
        this.name = name;
        this.totalBudget = totalBudget;
    }

    getName = () => this.name;

    getBudget = () => this.totalBudget;
}


module.exports = Department;