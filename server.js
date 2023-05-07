require("dotenv").config();
const express = require("express");
const app = express();
const path = require("path");
const cors = require("cors");
const { logger } = require("./middleware/logEvents");
const errorHandler = require("./middleware/errorHandler");
const corsOptions = require("./config/corsOptions");
const mongoose = require("mongoose");
const connectDB = require("./config/dbConfig");
const PORT = process.env.PORT || 3000;

// connect DB
connectDB();

app.use(logger);
// CORS
app.use(cors(corsOptions));

// built in middleware to handel urlencoded data
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// To handel static files in main and Sub Dir
app.use(express.static(path.join(__dirname, "/public")));
app.use("/subdir", express.static(path.join(__dirname, "/public")));

// Routes
app.use("/", require("./routes/root"));
app.use("/subdir", require("./routes/subdir"));
// API Routes
app.use("/states", require("./routes/api/states"));

// 404 Route for un-defined
app.all("*", (req, res) => {
  res.status(404);
  if (req.accepts("html")) {
    res.sendFile(path.join(__dirname, "views", "404.html"));
  } else if (req.accepts("json")) {
    res.json({ error: "404 Not Found" });
  } else {
    res.type("txt").send("404 Not Found");
  }
});
// Error logger
app.use(errorHandler);

mongoose.connection.once("open", () => {
  console.log("Connected to mongoDB");
  app.listen(PORT, () => console.log(`Server is listing on port ${PORT}`));
});
