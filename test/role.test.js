const Role = require("../lib/role");

test("Can instatiate Role instance", () => {
    const e = new Role();
    expect(typeof(e)).toBe("object");
});

test("Can get title", () => {
    const title = "Manager";
    const e = new Role(title);
    expect(e.getTitle()).toBe(title);
});

test("Can get salary", () => {
    const salary = 100000;
    const e = new Role("Manager", salary);
    expect(e.getSalary()).toBe(salary);
});

test("Can get departmentId", () => {
    const departmentId = 2;
    const e = new Role("Manager", 100000, departmentId);
    expect(e.getDepartmentId()).toBe(departmentId);
});