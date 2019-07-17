let mongoose = require('mongoose')
const fs = require('fs');
const nodemailer = require('nodemailer');
const Jimp = require('jimp');
const jwt = require('jsonwebtoken');
const {User} = require('../models/Users');
const {Admin} = require('../models/Admin');

var methods = {};

methods.sendMail = function () {
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'erfanengineer1378@gmail.com',
            pass: '09335038376erfanebi'
        }
    });

    var mailOptions = {
        from: 'erfanengineer1378@gmail.com',
        to: 'erfanebrahimi7878@gmail.com',
        subject: 'Sending Email using Node.js',
        text: 'ok'
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });

};

methods.resize = function (image, filename) {

    Jimp.read(image).then(image => {
        return image.resize(256, 256)
            .quality(60)
            .write('./uploads/' + 'image-small' + filename + 'jpg');
    }).catch(err => {
        console.log('that`s ok')
    });
};

methods.generateToken = function () {

    var access = 'auth';
    var token = jwt.sign({_id: user._id.toString(), access}, 'abc123').toString();
    user.tokens = [{access, token}];
    return user.save().then(() => {
        return token;
    });

};

methods.isTokenValid = function (token) {
    return new Promise((resolve, reject) => {
        User.find({'tokens.token': token}).then((user) => {
            if (!user) {
                return false;
                resolve();
            } else {
                return true;
                resolve();
            }
        }).catch((e) => {
                reject({status: 400});
            }
        )
    })
};

methods.auth = async function (req, res, next) {
    try {
        const token = req.header('x-auth');

        const decoded = jwt.verify(token, 'abc123')

        const user = await User.findOne({_id: decoded._id, 'tokens.token': token})

        if (!user) {
            res.status(404).send('user not found')
        }
        req.token = token
        req.user = user
        next()
    } catch (error) {
        console.log(error)
        res.status(401).send({error: 'Please authenticate!'})
    }

};
methods.adminAuth = async function (req, res, next) {
    try {
        const token = req.header('x-auth');

        const decoded = jwt.verify(token, 'abc123')

        const admin = await Admin.findOne({_id: decoded._id, 'tokens.token': token})

        if (!admin) {
            res.status(404).send('user not found')
        }else{
        req.token = token
        req.admin = admin
        next()};
    } catch (error) {
        console.log(error)
        res.status(401).send({error: 'Please authenticate!'})
    }

};

methods.updateProfile = (user, name, password, filename) => {
    return new Promise((resolve, reject) => {
        User.updateOne({_id: mongoose.Types.ObjectId(user._id)}, {
            name: name, password: password, imageUrl: filename
        })
            .then((doc) => {
                fs.unlinkSync('uploads/' + user.imageUrl , (err , doc)=>{
                    if (err){
                        console.log('I can`t unlink file' , err);
                    } else {
                        console.log('removed' , doc);
                    }
                })
                resolve({status: 200});
            })
            .catch((err) => {
                console.log(err)
                reject({eCode: 500, eText: err});
            })

    })
};


module.exports = methods;




