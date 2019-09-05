const express = require("express");
const router = express.Router();
const {log, hashPasswordWithSalt, genUserDataJWT} = require("../util");
const dbQueries = require("../dbQueries");
const AUTHCOOKIE_TTL = 1800000;

router.post("/", function(req, res) {
    log(`IP ${req.ip} has requested SIGNUP`);
    let data = req.body;
    if(typeof data !== "undefined" && typeof data.email !== "undefined" &&
        typeof data.password !== "undefined" && typeof data.username !== "undefined"){
        // Hash password with salt
        hashPasswordWithSalt(data.password).then(hash => {
            dbQueries.addNewUser(data.email, data.username, hash).then(userData => {
                let jwt = genUserDataJWT(userData.password, userData.username, userData.email, userData.admin);
                let data = {
                    message: `Successfully signed up in. Welcome ${userData.username}`,
                    userData: {
                        username: userData.username,
                        email: userData.email,
                        admin: userData.admin
                    },
                };
                res.cookie("authJWT", jwt, {expires: new Date(Date.now() + AUTHCOOKIE_TTL), httpOnly: true}).json(data);
            }).catch(err => {
                log("post " + err.message);
                res.status(500).send("Error with query to database");
            });
        });

    } else {
        res.status(400).send("Not acceptable sign up request");
    }
});

module.exports = router;