
const Employee = require("../lib/employee");

test("Can instantiate Employee instance", () => {
  const e = new Employee();
  expect(typeof(e)).toBe("object");
});

test("Can set name via constructor arguments", () => {
  const firstName = "Alice";
  const lastName = "Brown";
  const e = new Employee(firstName, lastName);
  expect(e.firstName+e.lastName).toBe(firstName+lastName);
});

test("Can set role via constructor argument", () => {
  const testValue = 1;
  const e = new Employee("Foo", "Bar", testValue);
  expect(e.role).toBe(testValue);
});

test("Can set manager via constructor argument", () => {
  const testValue = 1;
  const e = new Employee("Foo", "Bar", 2, testValue);
  expect(e.manager).toBe(testValue);
});

test("Can get name via getName()", () => {
  const testValue1 = "Alice";
  const testValue2 = "Brown";
  const e = new Employee(testValue1, testValue2);
  expect(e.getName()).toBe(testValue1 + " " + testValue2);
});

test("Can get role via getRole()", () => {
  const testValue = 100;
  const e = new Employee("Foo", "Bar", testValue);
  expect(e.getRole()).toBe(testValue);
});

test("Can get manager via getManager()", () => {
  const testValue = 2;
  const e = new Employee("Foo", "Bar", 1, testValue);
  expect(e.getManager()).toBe(testValue);
});
