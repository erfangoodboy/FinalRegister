const {Admin} = require('../models/Admin');
const {Department} = require('../models/Department');
const mongoose = require('mongoose');
const utils = require('../utils/functoin');
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
        Admin.findByCredentials(req.body.email, req.body.password)
            .then((admin) => {
                    return admin.generateAuthToken()
                        .then((token) => {
                            // res.header('x-auth', token).send({status: 200});
                            resolve({success: true, token: token});
                        }).catch((err) => {
                            reject({eCode: 500, eText: err});
                        })
                }
            ).catch((err) => {
            reject({eCode: 500, eText: err});
        })

    })
};

methods.editProfile = (user, name, password, filename) => {
    return new Promise((resolve, reject) => {

        utils.updateProfile(user, name, password, filename).then((doc) => {
            resolve({status: 200});
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
                    department.save().then(() => {
                        resolve({status: 200})
                    }).catch((err) => {
                        reject({eCode: 500, eText: err});
                    })
                }
            }
        })
    })
};

methods.editDept = ( name, description , dept_name) => {
    return new Promise((resolve, reject) => {
        Department.updateOne({_id : dept_name},
            {
                name: name,
                description: description
            }
        )
            .then(() => {
                resolve({success: true})
            })
            .catch((err) => {
                reject({eCode: 500, eText: err});
            })
    })
};

methods.showAllTicket = () => {
    return new Promise((resolve, reject) => {
        Ticket.find()
            .then((doc) => {
                resolve({ticket: doc});
            })
            .catch((err) => {
                reject({eCode: 500, eText: err})
            })
    });
};

methods.sendComment = (admin, text, ticket_id) => {
    return new Promise((resolve, reject) => {
        let comment = new Comment({
            text: text,
            role: 'admin',
            sender_id: mongoose.Types.ObjectId(admin._id),
            date: new Date(),
            ticket_id: ticket_id
        });
        let promise = comment.save();
        promise
            .then(() => {
                resolve({status: 200});
            })
            .catch((err) => {
                reject({eCode: 500, eText: err});
            })
    })

};

methods.showTicketAndComment = (filterDept , page , size) => {
    return new Promise((resolve, reject) => {
        let filter = filterDept;

        if (filter == undefined) {

            Ticket.aggregate()
                .lookup({
                    from: 'departments',
                    localField: 'deptId',
                    foreignField: '_id',
                    as: 'department'
                })
                .lookup({
                    from: 'comments',
                    localField: '_id',
                    foreignField: 'ticket_id',
                    as: 'comments'
                })
                .sort({date: 1})
                .skip(size * (page -1))
                .limit(size)
                .then((comments) => {
                    resolve(comments);
                })
                .catch((err) => {
                    reject({eCode: 500, eText: err});
                })

        } else {

            Ticket.aggregate()
                .lookup({
                    from: 'departments',
                    localField: 'deptId',
                    foreignField: '_id',
                    as: 'department'
                })
                .lookup({
                    from: 'comments',
                    localField: '_id',
                    foreignField: 'ticket_id',
                    as: 'comments'
                })
                .match({deptId: mongoose.Types.ObjectId(filter)})

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
};


module.exports = methods;