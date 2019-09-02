const {cryptoConfig} = require("./config");

let crypto;
// Check if crypto module is available, if not exit program
try {
    crypto = require("crypto");
} catch(err){
    console.log(err.message);
    console.log("\x1b[31mcrypto module not available. server can't function without it\x1b[0m");
    process.exit(1);
}

/*
 * Checks for the best available hash algorithm
 */
const getHashAlgorithm = () => {
    let hashAlgos = cryptoConfig.hashAlgorithms;

    // Get the best available hash algorithm
    let hashName = undefined;
    let hashSaltLength = undefined;
    let highesPriority = Number.POSITIVE_INFINITY;
    for(let i = 0; i < hashAlgos.length - 1; i++){
        // Create hashs to check support
        try{
            crypto.createHash(hashAlgos[i].name);

            // If the current highest priority hash algo is lower than the currently looked at
            if(highesPriority > hashAlgos[i].priority){
                // Update
                highesPriority = hashAlgos[i].priority;
                hashName = hashAlgos[i].name;
                hashSaltLength = hashAlgos[i].bytes;
            }
        } catch(err){
            console.log(`Hash algorithm ${hashAlgos[i].name} is not supported, trying next best`);
        }
    }

    if(typeof hashName === "undefined" && typeof hashSaltLength === "undefined"){
        console.log(`\x1b[31mNo requested hash algorithm is supported. Exiting program\x1b[30m`);
        process.exit(1);
    }

    if(highesPriority !== 0){
        console.log(`\x1b[31mBest hash algorithm not supported. Using ${hashName}\x1b[0m`);
    } else {
        console.log(`\x1b[32mBest hash algorithm supported. Using ${hashName}\x1b[0m`);
    }

    return {hashAlgoSize: hashSaltLength, hashAlgoName: hashName};
};


// Get best hash algorithm with byte size
const {hashAlgoSize, hashAlgoName} = getHashAlgorithm();


// Log message with timestamp
const log = (msg) => {
    const now = new Date();
    console.log(`${now.toISOString()}==> ${msg}`);
};

// Hashes a given password with the given salt as prefix
const hashPasswordWithSalt = (salt, password) => {
    let hash = crypto.createHash(hashAlgoName);
    hash.update(salt + password);
    return hash.digest().toString();
};

// Creates a salt with the given amount of bytes, returns a string containing the salt in utf8 encoding
const createSalt = (bytes) => {
    return crypto.randomBytes(bytes).toString();
};

/*
 * Creates a cryptographically secure salt (as long as output of hash algorithm) and hashes the password with it
 * Return an object containing the used salt and the hashed password
 */
const createPasswordHashSaltPair = (password) => {
    let salt = createSalt(hashAlgoSize);

    let hashedPassword = hashPasswordWithSalt(salt, password);
    return {salt: salt, hashedPassword: hashedPassword};
};

module.exports = {
    log,
    hashPasswordWithSalt,
    createPasswordHashSaltPair
};