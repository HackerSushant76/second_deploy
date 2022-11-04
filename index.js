const express = require("express");
const { connection } = require("./config/db");
const { User } = require("./models/User.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require("dotenv").config()

const PORT = process.env.PORT || 8080

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Welcome");
});

app.post("/signup", async (req, res) => {
  const { email, password } = req.body;
  bcrypt.hash(password, 5, async function (err, hash) {
    if (err) {
      console.log("Something went wrong please signup later");
    }
    const new_user = new User({
      email: email,
      password: hash,
    });
    await new_user.save();
    res.send("Signup successfull")
  });
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user =await User.findOne({email})
  const hash = user.password
  bcrypt.compare(password, hash, function(err, result) {
    if (result) {
        const token = jwt.sign({ email: email }, process.env.secret_key);
        res.send({ msg: "login successful", token: token });
      } else {
        res.send("wrong credentials");
      }
})
  
});

app.get("/dashboard", (req, res) => {
  const token = req.headers?.authorization?.split(" ")[1];
  try {
    var decoded = jwt.verify(token, process.env.secret_key);
    const { email } = decoded;
    res.send(`Welcome ${email} Here is your database...`);
  } catch (err) {
    console.log(err);
    res.send("Please login again");
  }
});

app.listen(PORT, async () => {
  try {
    await connection;
    console.log("connected to DB");
  } catch (err) {
    console.log(err);
  }
  console.log("listening at",PORT);
});
