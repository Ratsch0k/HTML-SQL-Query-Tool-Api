const dbQueries = require("./dbQueries");
const jwt = require("jsonwebtoken");
const {log} = require("./util");
const db = require("./dbQueries");

// Exported function for handling a query
const getQueryResult = (req, res) => {
    if(typeof req.cookies.authJWT === "undefined"){
        res.status(403).send("Not authorized");
    } else {
        let decoded = jwt.decode(req.cookies.authJWT);
        if (typeof decoded.username !== "undefined"){
            db.getUserData(decoded.username).then(data => {
                jwt.verify(req.cookies.authJWT, data.password);
            }).catch(err => {
                log(`IP ${req.ip} queried with insufficient permission`)
               if(err instanceof jwt.TokenExpiredError){
                   res.status(403).send("Your session expired");
                } else {
                   res.status(403).send("Not authorized");
               }

               return;
            });
        }
    }

    const query = req.query.q;

    // Check if query string was attached. If not, send 400
    if(query === null ||  query === ''){
        res.status(400).end();
        log(`IP ${req.ip} requested invalid query`);
    }else {
        log(`IP ${req.ip} requested query: '${query}'`);
        // Send example json data
        sendQuery(query, res);
    }
};

// Sending query and handling response and errors
const sendQuery = (query, resHttp) => {
    // Send query to database with callback
    dbQueries.makePureQuery(query).then((res) => {
        // Send rows back
        resHttp.json(res.rows).send();
    }).catch(err => {
        console.log(`Request responded with error code ${err.code}`);
        // Check which error and send error response
        switch (err.code){
            case 42601: resHttp.status(400).end();
                break;
            default: resHttp.status(400).end();
        }
    });
};


module.exports = {getQueryResult};