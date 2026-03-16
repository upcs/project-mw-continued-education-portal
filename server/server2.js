const dbms = require('./dbms.js');
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;


// Serve React static files
app.use(express.static(path.join(__dirname, '../client/build')));

// Serve React app for all other routes
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

app.post('/server', (req, res) => {
	var my_response = {message : "hello"}
	var query = "select * from userdata"
	dbms.dbquery(query, (err, response) => {
		res.json(response[0].username);
	});
		});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
