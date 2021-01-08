const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const multer = require('multer');
const { mongodb_url } = require('./config');

//let fileStorage = multer.memoryStorage()

let fileStorage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'images')
    },
    filename: function (req, file, cb) {
      cb(null, new Date().toISOString() + '-' + file.originalname)
    }
  })

const fileFilter = (req, file, cb) => {
    if(file.mimetype === 'image/png' || 
    file.mimetype === 'image/jpg' || 
    file.mimetype === 'image/jpeg') {
        cb(null, true)
    }
    else {
        cb(null, false)
    }
}

//const upload = multer({ storage: fileStorage })

const app = express();

const feedRoutes = require('./routes/feed');
const authRoutes = require('./routes/auth');

app.use(bodyParser.json());
app.use(multer({ storage: fileStorage,fileFilter: fileFilter}).single('image'))
app.use('/images', express.static(path.join(__dirname,'images')))

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT,DELETE");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type,  Authorization");
    next();
})

app.use('/feed',feedRoutes);
app.use('/auth',authRoutes);
app.get('/',(req,res,next) => {
    res.json({
        message: 'Api is working'
    })
})

app.use((err, req, res, next) => {
    const status = err.statusCode || 500;
    const message = err.message;
    res.status(status).json({message: message});
})

mongoose.connect(mongodb_url,
{ useNewUrlParser: true, useUnifiedTopology: true,useFindAndModify: false })
.then(() => {
    app.listen(process.env.PORT || 3000)
})
.catch(err => {
    console.log(err);
})