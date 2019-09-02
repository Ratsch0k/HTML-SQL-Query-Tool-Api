const express = require("express");
const router = express.Router();
const {log, createPasswordHashSaltPair} = require("../util");
const dbQueries = require("../dbQueries");

router.post("/", function(req, res) {
    log(`IP ${req.ip} has requested SIGNUP`);
    let data = req.body;
    if(typeof data !== "undefined" && typeof data.email !== "undefined" &&
        typeof data.password !== "undefined" && typeof data.username !== "undefined"){
        // Hash password with salt
        let {salt, hashedPassword} = createPasswordHashSaltPair(data.password);
        dbQueries.addNewUser(data.email, data.username, hashedPassword, salt).then(queryRes => {
            res.send("Successful sign up");
        }).catch(err => {
            log("post " + err.message);
            res.status(500).send("Error with query to database");
        });
    } else {
        res.status(400).send("Not acceptable sign up request");
    }
});

module.exports = router;