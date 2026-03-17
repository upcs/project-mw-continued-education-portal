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

        var query = `Select * from userdata where username = "${username}";`;
	var query2 = `insert into userdata values ("${username}", "${password}");`;
	var query3 = `insert into profile values ()`;
	var query4 = `insert into permissions values ()`;
	console.log(query);
	dbms.dbquery(query, (err, reponse) => {
	//error, username already exists
	if (reponse[0] != undefined) {res.json({error: "username"});}
	//otherwise, create new account
	else {
	dbms.dbquery(query2, (err, reponse) => {
	if (err) {res.json({error : "db"}); return;}
	else {
	//happy path
	res.json({error : "none"});
	}
	}); // query 2 end
	} // else
	
	}); // query 1

	});

app.post('/profile', (req, res) => {});

app.post('/myinfo', (req, res) => {});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
