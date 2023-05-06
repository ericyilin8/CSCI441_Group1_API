// const data = {
//   employees: require("../model/employees.json"),
//   setEmployees: (data) => {
//     this.employees = data;
//   },
// };

const Employee = require("../model/Employee");

//Get all employees
const GetEmployees = async (req, res) => {
  const employees = await Employee.find();
  if (!employees)
    return res.status(400).json({ message: "No employee found." });
  res.json(employees);
};

//Create an Employee
const CreateNewEmployee = async (req, res) => {
  if (!req.body.firstName || !req.body.lastName) {
    return res
      .status(400)
      .json({ message: "First and last name are required" });
  }
  try {
    const result = await Employee.create({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
    });
    res.status(201).json(result);
  } catch (err) {
    console.log(err);
  }
};

//Update Employee
const UpdateEmployee = async (req, res) => {
  if (!req.body.id) {
    return res.status(400).json({ message: "Id parameter is required. " });
  }
  const employee = await Employee.findOne({ _id: req.body.id }).exec();

  if (!employee) {
    return res
      .status(204)
      .json({ message: `No Employee matches Id ${req.body.id}` });
  }
  if (req.body.firstName) employee.firstName = req.body.firstName;
  if (req.body.lastName) employee.lastName = req.body.lastName;

  const result = await employee.save();
  res.json(result);
};

//Delete Employee
const DeleteEmployee = async (req, res) => {
  if (!req?.body.id) {
    return res.status(400).json({ message: "Employee Id is required. " });
  }

  const employee = await Employee.findOne({ _id: req.body.id }).exec();

  if (!employee) {
    return res
      .status(204)
      .json({ message: `No Employee matches Id ${req.body.id}` });
  }
  const result = await employee.deleteOne({ _id: req.body.id });
  res.json(result);
};
//Get Employee
const GetEmployee = async (req, res) => {
  if (!req.params.id) {
    return res.status(400).json({ message: "Employee Id is required. " });
  }

  const employee = await Employee.findOne({ _id: req.params.id }).exec();

  if (!employee) {
    return res
      .status(204)
      .json({ message: `No Employee matches Id ${req.params.id}` });
  }
  res.json(employee);
};
module.exports = {
  GetEmployees,
  UpdateEmployee,
  DeleteEmployee,
  CreateNewEmployee,
  GetEmployee,
};
