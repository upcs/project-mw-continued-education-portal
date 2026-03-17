

var express = require("express");
var router = express.Router();

router.post('/', (req, res) => {
res.send("server");
});

export default backend;
