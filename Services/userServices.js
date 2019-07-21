const mongoose = require('mongoose');
const fs = require('fs');
const bcrypt = require('bcryptjs') ;
const {User} = require('../models/Users');
const utils = require('../utils/functoin');
const {Ticket} = require('../models/Ticket');
const {Comment} = require('../models/Comment');
const {Department} = require('../models/Department');
var methods = {};

methods.register = (email, name, password, phone, imageUrl) => {
    return new Promise((resolve, reject) => {
        let body = {
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
                    resolve();
                })
                    .catch((err) => {
                        reject({eCode: 500, eText: err})
                    })


            }
        })
    })
};

methods.login = (email , password)=>{
    return new Promise((resolve , reject) => {
        User.findOne({email: email} , (err , exist) =>{
            if (err){
                reject({eCode: 500 , eText: err})
            }
            if (!exist){
                reject({eCode: 404 , eText: 'user not exist'}) ;
            } else {
                bcrypt.compare(password , exist.password , (err , res)=>{
                    if (err){
                        reject({eCode: 500 , eText: err}) ;
                    }
                    if (!res){
                        reject({eCode: 400 , eText: 'password is not correct'}) ;
                    }else {
                        exist.generateAuthToken()
                            .then((token) =>{
                                resolve(token) ;
                            })
                            .catch((err)=>{
                                reject({eCode:500 , eText: err}) ;
                            })
                    }
                })
            }
        })
    })
}

methods.edit = (user, name, password, filename) => {
    return new Promise((resolve, reject) => {

        utils.updateProfile(user, name, password, filename).then((doc) => {
            resolve();
        }).catch((err) => {
            reject({eCode: 500, eText: err});
        })
    })
};

methods.startTicket = (user, text, title, deptId) => {
    return new Promise((resolve, reject) => {
        Department.findOne({_id: mongoose.Types.ObjectId(deptId)}, (err, exist) => {
            if (err) {
                reject({eCode: 500, eText: err});
            }
            if (!exist) {
                reject({eCode: 400, eText: 'department is not valid'});
            } else {
                let ticket = new Ticket({
                    text: text,
                    sender_id: mongoose.Types.ObjectId(user._id),
                    title: title,
                    date: new Date(),
                    deptId: deptId
                });
                let promise = ticket.save();
                promise
                    .then(() => {
                        resolve();
                    })
                    .catch((err) => {
                        reject({eCode: 500, eText: err});
                    })
            }
        })
    });
};

methods.sendComment = (user, text, ticket_id) => {
    return new Promise((resolve, reject) => {
        Ticket.findOne({_id: mongoose.Types.ObjectId(ticket_id)}, (err, exist) => {
                if (err) {
                    reject({eCode: 500, eText: err});
                }
                if (!exist) {
                    reject({eCode: 400, eText: 'ticket is not valid'});
                } else {
                    let comment = new Comment({
                        text: text,
                        role: 'user',
                        sender_id: mongoose.Types.ObjectId(user._id),
                        date: new Date(),
                        ticket_id: ticket_id
                    });
                    let promise = comment.save();
                    promise
                        .then(() => {
                            resolve();
                        })
                        .catch((err) => {
                            reject({eCode: 500, eText: err});
                        })
                }
            }
        )
    })

};

methods.showTicket = (user, page, size) => {
    return new Promise((resolve, reject) => {

        Ticket.aggregate()
            .sort({date: 1})
            .skip(size * (page - 1))
            .limit(size)
            .lookup({
                from: 'departments',
                localField: 'deptId',
                foreignField: '_id',
                as: 'department'
            })
            .match({sender_id: mongoose.Types.ObjectId(user._id)})

            .then((comments) => {
                resolve(comments);
            })
            .catch((err) => {
                reject({eCode: 500, eText: err});
            })
    })
};

methods.showComment = (ticket_id, page, size) => {
    return new Promise((resolve, reject) => {
        Ticket.findOne({_id: mongoose.Types.ObjectId(ticket_id)}, (err, exist) => {
            if (err) {
                reject({eCode: 500, eText: err});
            }
            if (!exist) {
                reject({eCode: 400, eText: 'ticket  is not valid'});
            } else {
                Comment.aggregate()
                    .match({ticket_id: mongoose.Types.ObjectId(ticket_id)})
                    .sort({date: 1})
                    .skip(size * (page - 1))
                    .limit(size)
                    .then((comments) => {
                        resolve(comments);
                    })
                    .catch((err) => {
                        reject({eCode: 500, eText: err});
                    })
            }
        })
    })
};

module.exports = methods;