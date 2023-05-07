const data = {
  states: require("../model/states.json"),
  setStates(data) {
    this.states = data;
  },
};

const States = require("../model/States");

// Get all States
const getAllStates = async (req, res) => {
  let output = [];
  const states = await States.find().exec();

  data.states.forEach((state)=>{
    if( req.query.contig !== undefined
        && req.query.contig === 'true' 
        && (state.code == 'AK' || state.code == 'HI'))
      return;
    if( req.query.contig !== undefined
        && req.query.contig === 'false' 
        && !(state.code == 'AK' || state.code == 'HI'))
      return;
    
    const statefacts = states.find( x => x.stateCode == state.code);
    if(statefacts) output.push({...state, funfacts: statefacts.funfacts});
    else output.push(state);
  })

  res.json(output);
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
    (emp) => emp.code === req.body.id
  );
  if (!state) {
    return res
      .status(400)
      .json({ message: `State ${req.body.id} is not found` });
  }

  if (req.body.firstName) state.firstName = req.body.firstName;
  if (req.body.lastName) state.lastName = req.body.lastName;

  const filteredArray = data.states.filter(
    (emp) => emp.code !== req.body.id
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
    (emp) => emp.code === req.body.id
  );
  if (!state) {
    return res
      .status(400)
      .json({ message: `State ID ${req.body.id} not found` });
  }
  const filteredArray = data.states.filter(
    (emp) => emp.code !== req.body.id
  );
  data.setStates([...filteredArray]);
  res.json(data.states);
};

// Get a State

const getState = async (req, res) => {
  const stateId = req.params.id; // Get stateId from URL parameter
  const state = data.states.find((emp) => emp.code === stateId);
  if (!state) {
    return res
      .status(400)
      .json({ message: `State ${stateId} is not found` });
  }
  const state2 = await States.findOne({stateCode: stateId}).exec();
  console.log(state2)
  res.json(
    {
      ...state,
      funfacts: state2.funfacts
    }
  );
};

//#region Get State Information

const getStateCapital = (req, res) => {
  const stateId = req.params.id; // Get stateId from URL parameter
  const state = data.states.find((emp) => emp.code === stateId);
  if (!state) {
    return res
      .status(400)
      .json({ message: `State ${stateId} is not found` });
  }
  res.json(
    { 
      state: state.state,
      capital: state.capital_city
    }
  );
};

const getStateNickname = (req, res) => {
  const stateId = req.params.id; // Get stateId from URL parameter
  const state = data.states.find((emp) => emp.code === stateId);
  if (!state) {
    return res
      .status(400)
      .json({ message: `State ${stateId} is not found` });
  }
  res.json(
    { 
      state: state.state,
      nickname: state.nickname
    }
  );
};

const getStatePopulation = (req, res) => {
  const stateId = req.params.id; // Get stateId from URL parameter
  const state = data.states.find((emp) => emp.code === stateId);
  if (!state) {
    return res
      .status(400)
      .json({ message: `State ${stateId} is not found` });
  }
  res.json(
    { 
      state: state.state,
      population: state.admission_number
    }
  );
};

const getStateAdmission = (req, res) => {
  const stateId = req.params.id; // Get stateId from URL parameter
  const state = data.states.find((emp) => emp.code === stateId);
  if (!state) {
    return res
      .status(400)
      .json({ message: `State ${stateId} is not found` });
  }
  res.json(
    { 
      state: state.state,
      admitted: state.admission_number
    }
  );
};

const getStateFunFact = async (req, res) => {
  const stateId = req.params.id; // Get stateId from URL parameter
  const state = await States.findOne({ stateCode: req.params.id }).exec();

   console.log(state)

  if (!state) {
    return res
      .status(400)
      .json({ message: `State ${stateId} is not found` });
  }

  res.json(
    { 
      funfact: state.funfacts[Math.floor(Math.random()*state.funfacts.length)]
    }
  );
};

//#endregion Get State Information

module.exports = {
  getAllStates,
  updateState,
  createNewState,
  deleteState,
  getState,
  getStateAdmission,
  getStateCapital,
  getStateNickname,
  getStatePopulation,
  getStateFunFact
};
