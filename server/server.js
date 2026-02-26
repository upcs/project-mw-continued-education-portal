const express = require('express');
var createError = require('http-errors');
var cors = require('cors');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
})

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

const upload = multer({ storage: storage });

app.get('/', (req, res) => {
    res.send('Welcome to UPLendo!');
});

app.post('/upload', upload.single('file'), (req, res) => {
    console.log('File uploaded:', req.file);
    res.json({ message: 'File uploaded successfully', file: req.file });
});

const port = process.env.PORT || 5000;

app.listen(port, () => 
{
    console.log(`Server is running on port ${port}`);
});