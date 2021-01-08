const express = require('express');
const isAuth = require('../middleware/is-auth');
const router = express.Router();

const {body} = require('express-validator');

const feedController = require('../controllers/feed');

router.get('/posts',isAuth,feedController.getPosts);

router.get('/post/:postId',isAuth,feedController.getPost);

router.put('/post/:postId',isAuth,[
    body('title').trim().isLength({min: 5}),
    body('content').trim().isLength({min: 5})
],feedController.updatePost)

router.delete('/post/:postId',isAuth,feedController.deletePost);

router.post('/post',isAuth,[
    body('title').trim().isLength({min: 5}),
    body('content').trim().isLength({min: 5})
] ,feedController.createPost)

module.exports = router;