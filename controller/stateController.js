const data = {
  states: require("../model/states.json"),
  setStates(data) {
    this.states = data;
  },
};

const FunFact = require("../model/FunFact");

// Get all States
const getAllStates = (req, res) => {
  res.json(data.states);
};

// Create an State
const createNewState = (req, res) => {
  const newState = {
    id: data.states?.length
      ? data.states[data.states.length - 1].id + 1
      : 1,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
  };

  if (!newState.firstName || !newState.lastName) {
    return res
      .status(400)
      .json({ message: "First and last names are required." });
  }

  data.setStates([...data.states, newState]);
  res.status(201).json(data.states);
};

// Update an State
const updateState = (req, res) => {
  const state = data.states.find(
    (emp) => emp.id === parseInt(req.body.id)
  );
  if (!state) {
    return res
      .status(400)
      .json({ message: `State ${req.body.id} is not found` });
  }

  if (req.body.firstName) state.firstName = req.body.firstName;
  if (req.body.lastName) state.lastName = req.body.lastName;

  const filteredArray = data.states.filter(
    (emp) => emp.id !== parseInt(req.body.id)
  ); // Exclude the state to be updated from filtered array
  const unsortedArray = [...filteredArray, state];
  data.setStates(
    unsortedArray.sort((a, b) => (a.id > b.id ? 1 : a.id < b.id ? -1 : 0))
  );

  res.json(data.states);
};

// Delete an State
const deleteState = (req, res) => {
  const state = data.states.find(
    (emp) => emp.id === parseInt(req.body.id)
  );
  if (!state) {
    return res
      .status(400)
      .json({ message: `State ID ${req.body.id} not found` });
  }
  const filteredArray = data.states.filter(
    (emp) => emp.id !== parseInt(req.body.id)
  );
  data.setStates([...filteredArray]);
  res.json(data.states);
};

// Get a State

const getState = (req, res) => {
  const stateId = parseInt(req.params.id); // Get stateId from URL parameter
  const state = data.states.find((emp) => emp.id === stateId);
  if (!state) {
    return res
      .status(400)
      .json({ message: `State ${stateId} is not found` });
  }
  res.json(state);
};

module.exports = {
  getAllStates,
  updateState,
  createNewState,
  deleteState,
  getState,
};
