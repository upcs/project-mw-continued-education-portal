const dbms = require('./dbms.js');
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve React static files
app.use(express.static(path.join(__dirname, '../client/build')));

// Serve React app for all other routes
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

app.post('/login', (req, res) => {
	//console.log(req.body);
	var body = req.body;
	var pass = body.password;
	var user = body.username;
	var query = "select * from userdata where username =\"" + user + "\" and password = \"" + pass + "\";"
	dbms.dbquery(query, (err, response) => {
	var test = {success : true};
	console.log(test.success);
		if (response[0] != undefined) {res.json({success: true});}
		else {res.json({success: false});}
	});
		});
app.post('/signup', (req, res)=> {
	var body = req.body;
	var name = body.name;
	var email = body.email;
	var whatsapp = body.whatsapp;
	var photo = body.photo;
	var username = body.username;
	var password = body.password;

        var query = "Select from userdata where username = \"" + username + "\";"
	var query2 = "intert into userdata values (" //TODO
	dbms.dbquery(query, (err, reponse)=> {
	//error, username already exists
	if (reponse[0] != undefined) {res.json({error: "username"});}
	
	});

	});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
