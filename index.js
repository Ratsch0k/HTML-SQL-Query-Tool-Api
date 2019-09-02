const express = require('express');
const bodyParser = require('body-parser');
const qh = require('./queryHandler');
const config = require('./config');

const loginRouter = require("./routes/login");
const signUpRouter = require("./routes/signup");
const app = express();
const port = config.port;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
// TODO:    remove cors for deployment
//          Only used in for testing on one pc
const cors = require('cors');
app.use(cors());
app.get('/query', qh.getQueryResult);
app.use("/login", loginRouter);
app.use("/signup", signUpRouter);

app.listen(port, () => console.log('Server running on ' + port));