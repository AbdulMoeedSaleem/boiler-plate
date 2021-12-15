const crypto = require('crypto');
const { JWT, JWK } = require("jose");
const { auth, pbkdf2 } = require("../config/app");

function generateKey(payload = {}) {
    return JWT.sign(payload, JWK.asKey(auth.key), { audience: auth.audience, expiresIn: auth.expiresIn });
}

function verify(token = null) {
    return JWT.verify(token, JWK.asKey("e31fda67-b94c-4e92-a9c3-20c204d6289d"))
}

async function generateSecureRandomKey(length) {
    length = length || 16;
    const byteArray = await crypto.randomBytes(length);
    return byteArray.toString('hex');
}

async function getPbkdf2Hash(password, salt, iterations, hashName) {
    const hash = crypto.createHash(hashName);
    return new Promise(async (resolve, reject) => {
        crypto.pbkdf2(
            password,
            salt,
            iterations,
            hash.digest().length,
            hashName,
            (error, key) => {
                if (error !== null) {
                    reject(error);
                } else {
                    resolve(key);
                }
            }
        );
    });
}

async function encryptPassword(password, salt) {
    password = password || await generateSecureRandomKey();
    salt = salt || await generateSecureRandomKey(pbkdf2.saltLength);
    const hashedPassword = await getPbkdf2Hash(password, salt, pbkdf2.iterations, pbkdf2.hash);
    return `pbkdf2_sha256$${pbkdf2.iterations}$${salt}$${hashedPassword.toString('base64')}`;
}

async function verifyPassword(password, encodedPassword) {
    const passwordComponents = encodedPassword.split('$');
    if (passwordComponents[0] !== 'pbkdf2_sha256') {
        throw new Error(`${passwordComponents[0]} is not supported at the moment`);
    }

    const hashedPassword = await getPbkdf2Hash(
        password,
        passwordComponents[2], // Salt from the stored password
        parseInt(passwordComponents[1]), // # of iterations from the stored password
        pbkdf2.hash,
    );

    return crypto.timingSafeEqual(hashedPassword, Buffer.from(passwordComponents[3], 'base64'));
}

module.exports = {
    generateKey: generateKey,
    verify: verify,
    generateSecureRandomKey: generateSecureRandomKey,
    encryptPassword: encryptPassword,
    verifyPassword: verifyPassword,
};
