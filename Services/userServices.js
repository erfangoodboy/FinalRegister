const mongoose = require('mongoose');
const fs = require('fs');
var {User} = require('../models/Users');
var utils = require('../utils/functoin');
const {Ticket} = require('../models/Ticket');
const {Comment} = require('../models/Comment');
var methods = {};

methods.register = (email, name, password, phone, imageUrl) => {
    return new Promise((resolve, reject) => {
        var body = {
            email: email,
            name: name,
            password: password,
            phone: phone,
            imageUrl: imageUrl
        };
        User.findOne({email: email}, (err, finder) => {
            const user = new User(body);
            if (err) {
                reject({eCode: 500, eText: err})
            }
            if (finder) {
                reject({eCode: 400, eText: 'user exist'})
            } else {
                // utils.resize(image , filename);

                var promise = user.save();
                promise.then(function (doc) {
                    user.generateAuthToken();
                }).then(() => {
                    utils.sendMail();
                }).then(() => {
                    resolve({
                        status: 200
                    });
                })
                    .catch((err) => {
                        reject({eCode: 500, eText: err})
                    })


            }
        })
    })
};

methods.login = (req, res) => {
    return new Promise((resolve, reject) => {
        User.findByCredentials(req.body.email, req.body.password)
            .then((user) => {
                    return user.generateAuthToken()
                        .then((token) => {
                            res.header('x-auth', token).send({status: 200});
                            resolve();
                        }).catch((err) => {
                            reject({eCode: 500, eText: err});
                        })
                }
            ).catch((err) => {
            reject({eCode: 500, eText: err});
        })

    })
};

methods.edit = (user, name, password, filename) => {
    return new Promise((resolve, reject) => {

        utils.updateProfile(user, name, password, filename).then((doc) => {
            resolve({status: 200});
        }).catch((err) => {
            reject({eCode: 500, eText: err});
        })
    })
};

methods.startTicket = (user, text, title , deptId) => {
    return new Promise((resolve, reject) => {
        let ticket = new Ticket({
            text: text,
            sender_id: mongoose.Types.ObjectId(user._id),
            title: title,
            date: new Date(),
            deptId: deptId
        });
        let promise = ticket.save();
        promise
            .then(()=>{
                resolve({success: true});
            })
            .catch((err)=>{
                reject({eCode: 500 , eText: err}) ;
            })
    });
};

methods.sendComment = (user, text, ticket_id) => {
    return new Promise((resolve, reject) => {
        let comment = new Comment({
            text: text,
            role: 'user',
            sender_id: mongoose.Types.ObjectId(user._id),
            date: new Date(),
            ticket_id: ticket_id
        }) ;
        let promise = comment.save() ;
        promise
            .then(() => {
                resolve({status: 200}) ;
            })
            .catch((err) => {
                reject({eCode: 500 , eText: err}) ;
            })
    })

};


module.exports = methods;