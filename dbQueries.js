const {Pool} = require("pg");
const {log} = require("./util");

let pgConfig = require("./config");

if(process.env.NODE_ENV === "development"){
    pgConfig = require("./_devConfig");
}

const ADD_NEW_USER = "INSERT INTO users values($1, $2, $3, $4);";
const GET_USER_PASSWORD_AND_SALT = "SELECT h_password, salt from users where username=$1;";

const pool = new Pool({
    user: pgConfig.pg.user.toString(),
    host: pgConfig.pg.host.toString(),
    database: pgConfig.pg.database.toString(),
    password: pgConfig.pg.password.toString(),
    port: pgConfig.pg.port.toString(),
});
pool.connect().then(() => {
    console.log("Connection to database established");
}).catch(err => {
    console.log(err.message);
});

const makePureQuery = (query) => {
    return pool.query(query.toString());
};

/*
 * Adds a new user to the database using email, username, hashedPassword and salt
 * returns a promise which return true if the insert was successful and false if an error occured
 */
const addNewUser = (email, username, hashedPassword, salt) =>{
    return pool.query(ADD_NEW_USER, [username, email, hashedPassword, salt]).then(res => {
        return res;
    }).catch(err => {
        log("query " + err.message);
        throw err;
    });
};

/*
 * Gets the hashedPassword and the used salt for a user with the username
 * Returns a promise which either contains an object with salt and hashedPassword (if query was successful), or nothing
 * (if an error occured)
 */
const getUserPasswordAndSalt = (username) => {
    return pool.query(GET_USER_PASSWORD_AND_SALT, [username]).then(res => {
        return JSON.parse(res.rows[0]);
    }).then(json => {
        return {salt: json[1], hashedPassword: json[0]};
    }).catch(err => {
        log(err.message);
    });
};

module.exports = {
    makePureQuery,
    addNewUser,
    getUserPasswordAndSalt
};