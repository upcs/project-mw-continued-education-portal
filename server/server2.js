const dbms = require('./dbms.js');
const express = require('express');
const path = require('path');
const multer = require('multer');
const uploads = multer({ dest: './uploads/'});
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


app.post('/signup', (req, res) => {
	var body = req.body;
	var name = body.name;
	var email = body.email;
	var whatsapp = body.whatsapp;
	var photo = body.photo;
	var username = body.username;
	var password = body.password;

        var query = `Select * from userdata where username = "${username}";`;
	var query2 = `insert into userdata values ("${username}", "${password}")`;
	var query3 = `insert into profile values ("${username}", "${name}", "${email}", "${whatsapp}", "${photo}")`;
	var query4 = `insert into permissions values ()`;
	var query5= `insert into userdata values ("hello", "hello");`
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
	dbms.dbquery(query3, (err, response) => {if (err) {console.log("err");}});
	res.json({error : "none"});
	}
	}); // query 2 end
	} // else
	
	}); // query 1

	});

app.post('/upload', uploads.single('file'), (req, res) => {
	var body = req.body;
	var name = body.name;
	var form = body.form;
	var subject = body.subject;
	var filename = req.file.filename;

query = `insert into content () values ()`;
//TODO
dbms.dbquery(query, (err, response) => {});
});


const profile = function (req, res) {
var body = req.body;
var user = body.username;
query = `select * from profile where username = \"${user}\";`;
dbms.dbquery(query, (err, response) => {res.json(response);});
};

app.post('/profile', profile);


const myinfo = function (req, res) {
res.json({test : "true"});
return;
};
app.post('/myinfo', myinfo);


const delete_account = function (req, res) {
var body = req.body;
if (body.username == undefined || body.password == undefined) {
res.json ({success: false}); return;
}
var username = body.username;
var password = body.password;
var query = `delete from userdata where username = "${username}" and password = "${password}"`;
dbms.dbquery(query, (err, response) => {
if (!err) {res.json({success: true});}
else {res.json({success: false});}
});
}
app.post('/delete', delete_account);

const update_account = async function (req, res) {
var body = req.body;
var newval = body.newval;
var field = body.field;
var username = body.username;
var password = body.password;
if (field == "password") {updatePass(res, req); return;}
if (field == "username") {updateUser(res, req); return;}
var query1 = `select * from userdata where username = "${username}" and password = "${password}";`;
const res2 = await fetch('http://localhost:3000/login', {
  method: "POST",
  headers: {"Content-Type": "application/json"},
  body: JSON.stringify({username: username, password: password})
});
const data = await res2.json();
console.log(data);
//$.post('/login', {username: username, password: password}, (data, success) => {
if (data.success) {
	query2 = `update profile set ${field}="${newval}" where username="${username}";`;
	console.log(query2);
	dbms.dbquery(query2, (err, response) => {
	if (err) {res.json({success: false});}
	else {res.json({success: true});}
	});
	}
else {res.json({success: false});}
//});
}
const updateUser = function (res, req) {}
const updatePass = function (res, req) {}
app.post('/update', update_account);



app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = { myinfo, profile };
