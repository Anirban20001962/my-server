const express = require('express');

const User = require('../model/user');
const authController = require('../controllers/auth');

const {body} = require('express-validator');

const router = express.Router();

router.put('/signup',[
    body('email')
    .isEmail()
    .withMessage('Please enter a valid email')
    .custom((value,{req}) => {
        return User.findOne({email: value})
        .then(user => {
            if(user) {
                return Promise.reject('Email address already exists')
            }
        })
    })
    .normalizeEmail()
    ,
    body('password')
    .trim().
    isLength({min: 5}),
    body('name')
    .trim()
    .not()
    .isEmpty()
],authController.singup);

router.post('/login',authController.login)

module.exports = router;