var express = require('express');
var router = express.Router();
var dbms = require('./dbms.js');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/', function(req, res, next) {
  query = req.body;
  username = req.username;
  password = req.password;
  sql_query = "select * from uplendo_userdata where password=" + "\"" + password + "\"" + " and username =" +"\"" + username + "\"";
  dbms.dbquery(sql_query, function(err, response) {
    res.json(response);
  });
});

module.exports = router;
