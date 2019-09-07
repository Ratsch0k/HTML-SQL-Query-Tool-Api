const express = require("express");
const router = express.Router();
const cookieParser = require("cookie-parser");
const {log, verifyPassword, genUserDataJWT} = require("../util");
const db = require("../dbQueries");
const jwt = require("jsonwebtoken");
const AUTHCOOKIE_TTL = 1800000;


/* POST request for login route */
router.use(cookieParser());
router.post("/", function (req, res) {
    log(`${req.ip} => requested LOGIN`);
    // Check if authorization header is provided, if not send a 403 error
    if(typeof req.headers.authorization === "undefined" && typeof req.cookies.authJWT === "undefined"){
        res.status(403).send();
    }else if(typeof req.headers.authorization !== "undefined"){
        let [tokenType, token] = parseAuthorizationHeader(req.headers.authorization);
        authTypeBasic(req, res, token);

    }else if(typeof  req.cookies.authJWT !== "undefined"){
        // Decode jwt to get username
        let decoded = jwt.decode(req.cookies.authJWT);
        if(typeof decoded.username !== "undefined"){
            db.getUserData(decoded.username).then(data => {
                try{
                    jwt.verify(req.cookies.authJWT, data.password);
                    let userData = {
                        username: data.username,
                        email: data.email,
                        admin: data.admin
                    };
                    res.cookie("authJWT", req.cookies.authJWT, {expires: new Date(Date.now() + AUTHCOOKIE_TTL), httpOnly: true})
                        .json(userData);
                } catch(err) {
                    log(`IP${req.ip} tried to login with invalid jwt token. Error: ${err.message}`);
                    let message;
                    if(err instanceof jwt.TokenExpiredError){
                        message = "Session expired. Please login";
                    } else {
                        message = "Invalid login";
                    }

                    res.status(403).send(message);
                }
            });
        }
    } else {
        res.status(400).send("Not acceptable login request");
    }
});

// Parses the authorization header, returns type of token and token itself
function parseAuthorizationHeader(headerString){
    headerString = headerString.split(" ");
    return [headerString[0], headerString[1]];
}

function authTypeBasic(req, res, token){
    let {username, password} = parseToken(token);
    db.getUserData(username).then(userData => {
        if(typeof userData === "undefined") return [false, undefined];
        if(typeof userData.admin === "undefined" || userData.admin == null) userData.admin = false;
        return verifyPassword(password, userData.password).then(res => {
           return [res, userData];
        });
    }).then(([verified, userData]) => {
        if(verified){
            log(`IP ${req.ip} successfully logged in as ${userData.username}`);
            let jwt = genUserDataJWT(userData.password, userData.username, userData.email, userData.admin);
            let data = {
                message: `Successfully logged in. Welcome ${userData.username}`,
                userData: {
                    username: userData.username,
                    email: userData.email,
                    admin: userData.admin
                },
            };
            res.cookie("authJWT", jwt, {expires: new Date(Date.now() + AUTHCOOKIE_TTL), httpOnly: true})
                .json(data);
        } else {
            log(`IP ${req.ip} failed login as ${username}`);
            res.status(403).send(`Wrong Username or Password. Please try again`);
        }
    }).catch(err => {
        log(err.message);
    });
}

// Parses a base64 encoded authorization token
function parseToken(token){
    token = Buffer.from(token, "base64").toString("utf8").split(":");
    return {username: token[0], password: token[1]}
}

function authTypeBearer(req, res, token){
    res.send("Received tokenType Bearer");
}


module.exports = router;