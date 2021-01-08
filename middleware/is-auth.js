const jwt = require('jsonwebtoken');
const { json_secret_key } = require('../config');
module.exports = (req, res, next) => {
    const token = req.get('Authorization');
    let decodeToken;
    try {
        console.log(json_secret_key)
        decodeToken = jwt.verify(token,json_secret_key);
    }
    catch(err) {
        err.statusCode = 500;
        throw err;
    }
    if(!decodeToken) {
        const error = new Error('Not authenticated');
        error.statusCode = 401;
        throw error;
    }
    req.userId = decodeToken.user_id;
    next();
}