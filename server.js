const express = require("express");
const mongoose = require("mongoose");
const CountryModel = require("./CountrySchema");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 3000;
const dbUri = process.env.DB_URI || 3000;

app.use(cors());

const mongoURI = dbUri;
const dbName = "world";

mongoose
  .connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Connected to MongoDB Atlas");
  })
  .catch((error) => {
    console.log("Error connecting to MongoDB Atlas:", error);
  });

app.get("/world/:country", async (req, res) => {
  const result = await CountryModel.find({});

  res.send(result);
});

app.get("/update", async (req, res) => {
  const result = await CountryModel.updateMany(
    {},
    { $rename: { "property with spaces": "propertyWithoutSpaces" } }
  );

  res.send(result);
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
