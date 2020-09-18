const Department = require("../lib/department");

test("Can instantiate Employee instance", () => {
    const e = new Department();
    expect(typeof(e)).toBe("object");
  });

test("Can set name of department via constructor", () => {
    const name = "IT";
    const e = new Department(name);
    expect(e.name).toBe(name);
});

test("Can retrieve department name with getName()", () => {
    const name = "IT";
    const e = new Department(name);
    expect(e.getName()).toBe(name);
});