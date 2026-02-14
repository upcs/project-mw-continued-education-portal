let express = require('express');
let app = express();
let cors = require('cors');
let corsOptions = {
    origin: ['http://localhost:5173'],
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

app.get('/api', (req, res) => {
    res.json({ lemons: ["Red", "Yellow", "Green"] });
});

app.listen(9000, () => {
    console.log('Server is running on port 9000');
});