const express = require('express');
const bodyParser = require('body-parser');
const qh = require('./queryHandler');
const config = require('./config');
const cookieParser = require("cookie-parser");

const loginRouter = require("./routes/login");
const signUpRouter = require("./routes/signup");
const logoutRouter = require("./routes/logout");
const app = express();
const port = config.port;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
// TODO:    remove cors for deployment
//          Only used in for testing on one pc
if(process.env.NODE_ENV  === "development"){
    const cors = require('cors');
    const corsOptions = {
        origin: [/^(http:\/\/)?(localhost|127\.0\.0\.1)(:[0-9]{1,8})/],
            credentials: true
    };
    app.use(cors(corsOptions));
}
app.get('/query', cookieParser(), qh.getQueryResult);
app.use("/login", loginRouter);
app.use("/signup", signUpRouter);
app.use("/logout", logoutRouter);

app.listen(port, () => console.log('Server running on ' + port));