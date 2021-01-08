const User = require('../model/user');
const {validationResult} = require('express-validator')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.singup = (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        const error = new Error('Validation failed ,entered data is incorrect');
        error.statusCode = 422;
        throw error;
    }
    const email = req.body.email;
    const password = req.body.password;
    const name = req.body.name;
    bcrypt.hash(password,12)
    .then(hashPassword => {
        const user = new User({
            name: name,
            password: hashPassword,
            email: email
        })
        return user.save();
    })
    .then(result => {
        res.status(200).json({message: 'Account successfully created', userId: result._id})
    })
    .catch(err => {
        if(!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    })
}
exports.login = (req, res, next) => {
    let loadedUser;
    const email = req.body.email;
    const password = req.body.password;
    User.findOne({email: email})
    .then(user => {
        loadedUser = user;
        return bcrypt.compare(password,loadedUser.password)
    })
    .then(isEqual => {
        if(!isEqual) {
            const error = new Error('Wrong password');
            error.statusCode = 401
            throw error;
        }
        const token = jwt.sign({
            email: email,
            user_id: loadedUser._id.toString()
        },'saknxsanasxkasnxoasnsanckxnlsncakbcskcnb',
        {expiresIn: '1h'});
        res.status(200).json({message: 'logged in successfully', token: token, userId: loadedUser._id.toString()})
    })
    .catch(err =>{
        if(!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    })
}
