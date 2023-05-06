const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://samsmith:1qaz2wsx@cluster0.hnnxm.mongodb.net/CompanyDB?retryWrites=true&w=majority",
      {
        useUnifiedTopology: true,
        useNewUrlParser: true,
      }
    );
  } catch (error) {
    console.log(error);
  }
};

module.exports = connectDB;
