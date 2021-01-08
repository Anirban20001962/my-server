const {validationResult} = require('express-validator');
const Post = require('../model/post');
const cloudinary = require('../utills/cloudinary')
const fs = require('fs');
const User = require('../model/user');

exports.getPosts = (req, res, next) => {
    const currentPage = req.query.page;
    const perPage = 2;
    let totalItems;
    Post.find()
    .countDocuments()
    .then(count => {
        totalItems = count;
        return Post.find().skip((currentPage-1)*perPage).limit(perPage)
    })
    .then(posts => {
        res.status(200).json({message: 'Fetched posts successfully', posts: posts, totalItems: totalItems})
    })
    .catch(err => {
        if(!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    })
}
exports.createPost = async(req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        const error = new Error('Validation failed ,entered data is incorrect');
        error.statusCode = 422;
        throw error;
    }
    const uploader = async (path) => await cloudinary.uploads(path,'images');
    uploader(req.file.path)
    .then(result => {
        fs.unlinkSync(req.file.path);
        const title = req.body.title;
        const content = req.body.content;
        const url = result.secure_url
        const public_id = result.id
        let creator1;
        const post = new Post({
            title: title, 
            content: content,
            imageUrl: url,
            creator: req.userId,
            public_id: public_id
        })
        console.log(post)
    post.save()
    .then((result)=> {
        return User.findById(req.userId)
    })
    .then(user => {
        creator1 = user
        user.posts.push(post)
        return user.save()
    })
    .then(result => {
        res.status(201).json({
            message: "Post created successfully",
            post: post,
            creator: {_id: creator1._id, name: creator1.name}
        })
    })
    .catch(err => {
        console.log(err);
        if(!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    })
    })
    .catch((err) => {
        if(!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    })
}
exports.getPost = (req, res, next) => {
    const postId = req.params.postId;
    Post.findById(postId)
    .then(post => {
        if(!post) {
            const error = new Error('Post not found');
            error.statusCode = 404;
            throw error;
        }
        res.status(200).json({message:'Post fetched', post: post})
    })
    .catch(err => {
        if(!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    })
}
exports.updatePost = (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        const error = new Error('Validation failed ,entered data is incorrect');
        error.statusCode = 422;
        throw error;
    }
    const postId = req.params.postId;
    const title = req.body.title;
    const content = req.body.content;
    let url,flag=0,postReal;
    if(!req.file) {
        flag = 1;
    }
    Post.findById(postId)
    .then(post => {
        postReal = post;
        if(!postReal) {
            const error = new Error('Post not found');
            error.statusCode = 404;
            throw error;
        }
        if(post.creator.toString() !== req.userId) {
            const error = new Error('Not Authorized');
            error.statusCode = 401;
            throw error;
        }
        postReal.title = title;
        postReal.content = content;
        url = postReal.imageUrl;
        if(flag !== 1) {
            const uploader = async (path) => await cloudinary.uploads(path,'images');
            return uploader(req.file.path)
        }
        else {
            return;
        }
    })
    .then(result => {
        if(flag !== 1) {
            fs.unlinkSync(req.file.path);
            url = result.secure_url;
            cloudinary.delete(postReal.public_id)
        }
        postReal.imageUrl = url;
        return postReal.save()
    })
    .then(result => {
        res.status(200).json({message: 'Post successfully updated', post: result})
    })
    .catch(err => {
        console.log(err);
        if(!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    })
}
exports.deletePost =(req, res, next) => {
    const postId = req.params.postId;
    Post.findById(postId)
    .then(post => {
        if(!post) {
            const error = new Error('Post not found');
            error.statusCode = 404;
            throw error;
        }
        if(post.creator.toString() !== req.userId) {
            const error = new Error('Not Authorized');
            error.statusCode = 401;
            throw error;
        }
        cloudinary.delete(post.public_id)
        return Post.findByIdAndRemove(postId)
    })
    .then(result => {
        return User.findById(req.userId)
    })
    .then(user => {
        user.posts.pull(postId);
        return user.save();
    })
    .then(result => {
        res.status(200).json({message: 'Successfully deleted the post'})
    })
    .catch(err => {
        if(!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    })
}