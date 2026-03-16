var express = require('express');
var router = express.Router();
var dbms = require('./dbms.js');

data = {};
//callback function for sql
callback = function(err, results) {
if (err) {console.log(err);}
else {
data = results;
}

};

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});


//TODO: hardcode the string in notes, month and year
router.post('/', function(req, res, next) {
    req_data = req.body;
    quantity = req_data.quantity;
    topping = req_data.topping;
    notes = req_data.notes;
    month = req_data.month;
    year = req_data.year;
    query = "insert into orders (t_id, quantity, notes, month, year) values (" + topping + ", " + quantity + ", \"" + notes + "\" , " + month + ", " + year + ")";
    dbms.dbquery(query, callback);

    res.json(data);
});

module.exports = router;
