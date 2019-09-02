const express = require("express");
const router = express.Router();
const {log, hashPassword} = require("../util");


/* POST request for login route */
router.post("/", function (req, res) {
    log(`${req.ip} => requested LOGIN`);
    // Check if authorization header is provided, if not send a 403 error
    if(typeof req.headers.authorization === "undefined"){
        res.status(403).send();
        return;
    }
    let [tokenType, token] = parseAuthorizationHeader(req.headers.authorization);

    switch(tokenType){
        case "Basic":
            authTypeBasic(req, res, token);
            break;
        case "Bearer":
            authTypeBearer(req, res, token);
            break;
        default:
            res.send(`No acceptable token type, was: ${tokenType}`);
    }
});

// Parses the authorization header, returns type of token and token itself
function parseAuthorizationHeader(headerString){
    headerString = headerString.split(" ");
    return [headerString[0], headerString[1]];
}

function authTypeBasic(req, res, token){
    let {username, password} = parseToken(token)
    let {salt, hashedPassword} = hashPassword(password);

    res.send(`Username: ${username}, Password: ${password}, HashedPassword: ${hashedPassword}, Salt: ${salt.toString()}`);
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