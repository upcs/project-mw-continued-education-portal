const express = require('express');
var createError = require('http-errors');
var cors = require('cors');

const app = express();
app.use(cors());

var loginRouter = require("./login.js");
var signupRouter = require("./signup.js");

app.use("/login", loginRouter);
app.use("/signup", signupRouter);
app.get("/api", (req, res) => 
{
    res.json({"users": ["user1", "user2", "user3"]});
});

app.listen(5000, () => 
{
    console.log("Server is running on port 5000");
});