const dbQueries = require("./dbQueries");

const {log} = require("./util");



// Exported function for handling a query
const getQueryResult = (req, res) => {
    const now = new Date();
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