const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

mongoose.plugin(schema => {
    schema.options.usePushEach = true
});

var AdminSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        minlength: 1,


    },
    name: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    password: {
        type: String,
        require: true,
        minlength: 6
    },

    imageUrl: {
        type: String
    }
    ,
    tokens: [{
        access: {
            type: String,
            required: true
        },
        token: {
            type: String,
            required: true
        }
    }]
});

AdminSchema.pre('save', function (next) {
    let admin = this;

    if (this.password &&this.isModified('password') || this.isNew) {
        let hash = bcrypt.hashSync(admin.password, 10);
        admin.password = hash;
        next();

    } else {
        next();
    }

});

AdminSchema.methods.generateAuthToken = function () {
    return new Promise((resolve , reject) =>{

        let admin = this;
        let access = 'auth';
        let token = jwt.sign({_id: admin._id.toString(), access}, 'abc123').toString();
        admin.tokens = [{access, token}];

        return admin.save()
            .then(() => {
            resolve(token) ;
        })
            .catch((err) =>{
                reject({eCode:500 , eText: err}) ;
            })
            ;
    })

};



var Admin = mongoose.model('Admin', AdminSchema);

module.exports = {Admin};

