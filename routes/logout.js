const express = require("express");
const router = express.Router();
const {log} = require("../util");

// Send a cookie clearer for the jwt cookie
router.post("/", (req, res) => {
    res.clearCookie("authJWT").sendStatus(200);
    log(`IP ${req.ip} requested deletion of authJWT cookie`);
});

module.exports = router;