const {Admin} = require('../models/Admin');
const {Department} = require('../models/Department');
const mongoose = require('mongoose');
const utils = require('../utils/functoin');
const bcrypt = require('bcryptjs');
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
        Admin.findOne({email: email}, (err, finder) => {
            const admin = new Admin(body);
            if (err) {
                reject({eCode: 500, eText: err})
            }
            if (finder) {
                reject({eCode: 400, eText: 'user exist'})
            } else {
                // utils.resize(image , filename);

                var promise = admin.save();
                promise.then(function (doc) {
                    admin.generateAuthToken();
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

methods.login = (email , password) => {
    return new Promise((resolve, reject) => {
        Admin.findOne({email: email} , (err , exist) =>{
            if (err){
                reject({eCode: 500 , eText: err})
            }
            if (!exist){
                reject({eCode: 404 , eText: 'admin not exist'}) ;
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
};

methods.editProfile = (user, name, password, filename) => {
    return new Promise((resolve, reject) => {

        utils.updateProfile(user, name, password, filename).then((doc) => {
            resolve();
        }).catch((err) => {
            reject({eCode: 500, eText: err});
        })
    })
};

methods.addDepartment = (admin, deptName, description) => {
    return new Promise((resolve, reject) => {
        Department.findOne({name: deptName}, (err, found) => {
            if (err) {
                reject({eCode: 500, eText: err});
            } else {
                if (found) {
                    reject({eCode: 401, eText: 'department is exists'})
                } else {
                    let department = new Department({
                        name: deptName,
                        description: description,
                        create: mongoose.Types.ObjectId(admin._id)
                    });
                    department.save().then(department => {
                        resolve(department)
                    }).catch((err) => {
                        reject({eCode: 500, eText: err});
                    })
                }
            }
        })
    })
};

methods.editDept = (name, description, deptId) => {
    return new Promise((resolve, reject) => {
        Department.findOne({_id: mongoose.Types.ObjectId(deptId)}, (err, exist) => {
            if (err) {
                reject({eCode: 500, eText: err})
            }
            if (!exist) {
                reject({eCode: 400, eText: 'department is not valid'});
            } else {

                Department.updateOne({_id: deptId},
                    {
                        name: name,
                        description: description
                    }
                )
                    .then(() => {
                        resolve();
                    })
                    .catch((err) => {
                        reject({eCode: 500, eText: err});
                    })
            }
        })
    })
};

methods.showTicket = (filter, page, size) => {
    return new Promise((resolve, reject) => {
        if (filter == undefined) {
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
                .then((ticket) => {
                    resolve(ticket);
                })
                .catch((err) => {
                    reject({eCode: 500, eText: err});
                })
        } else {
            Department.findOne({_id: mongoose.Types.ObjectId(filter)}, (err, exist) => {
                if (err) {
                    reject({eCode: 500, eText: err})
                }
                if (!exist) {
                    reject({eCode: 400, eText: 'department is not valid'});
                } else {
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
                        .match({deptId: mongoose.Types.ObjectId(filter)})

                        .then((ticket) => {
                            resolve(ticket);
                        })
                        .catch((err) => {
                            reject({eCode: 500, eText: err});
                        })
                }
            })
        }

    });
};

methods.sendComment = (admin, text, ticket_id) => {
    return new Promise((resolve, reject) => {
        Ticket.findOne({_id: mongoose.Types.ObjectId(ticket_id)}, (err, exist) => {
            if (err) {
                reject({eCode: 500, eText: err})
            }
            if (!exist) {
                reject({eCode: 400, eText: 'ticket is not valid'});
            } else {

                let comment = new Comment({
                    text: text,
                    role: 'admin',
                    sender_id: mongoose.Types.ObjectId(admin._id),
                    date: new Date(),
                    ticket_id: ticket_id
                });
                comment.save().then(() => {
                    resolve();
                })
                    .catch((err) => {
                        reject({eCode: 500, eText: err});
                    })
            }
        })
    })

};

methods.showComment = (ticket_id, page, size) => {
    return new Promise((resolve, reject) => {

        Ticket.findOne({_id: mongoose.Types.ObjectId(ticket_id)}, (err, exist) => {
            if (err) {
                reject({eCode: 500, eText: err})
            }
            if (!exist) {
                reject({eCode: 400, eText: 'ticket is not valid'});

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