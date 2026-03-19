const dbms = require('./dbms.js');
const express = require('express');
const fileUpload = require('express-fileupload');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(fileUpload());

// Serve React static files
app.use(express.static(path.join(__dirname, '../client/build')));

// post request for Uploads
app.post('/uploads', (req, res) => {
	// null check
	if (req.files == null) {
		return res.status(400).json({ msg: 'no file uploaded' });
	}

	// defining our file
	const file = req.files.file;

	// function to move our file to uploads folder
	file.mv(`${__dirname}/uploads/${file.name}`, err => {
		// error handling
		if (err) {
			console.error(err);
			return res.status(500).send(err);
		}

		// send!
		res.json({ fileName: file.name, filePath: `/uploads/${file.name}`});
	});
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
	var query2 = "insert into userdata values (" //TODO
	dbms.dbquery(query, (err, reponse)=> {
	//error, username already exists
	if (reponse[0] != undefined) {res.json({error: "username"});}
	
	});

	});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
