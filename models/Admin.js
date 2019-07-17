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

AdminSchema.methods.comparePassword = function (passw, cb) {
    bcrypt.compare(passw, this.password, function (err, isMatch) {
        if (err) {
            return cb(err)
        }
        return cb(null, isMatch)
    })
};

AdminSchema.statics.findByCredentials = function (email, password) {
    var Admin = this;
    return new Promise((resolve, reject) => {
        // Use bcrypt.compare to compare password and user.password
        Admin.findOne({email: email})
            .then((admin) => {
                if (!admin) {
                    return reject({status: 404});
                } else {
                    bcrypt.compare(password, admin.password, (err, res) => {
                        if (res) {
                            resolve(admin);
                        } else {
                            reject({status: 401});
                        }
                    });
                }
            });
    });
};

AdminSchema.methods.generateAuthToken = function () {
    let admin = this;
    let access = 'auth';
    let token = jwt.sign({_id: admin._id.toString(), access}, 'abc123').toString();
    admin.tokens = [{access, token}];

    return admin.save().then(() => {
        return token;
    });
};



var Admin = mongoose.model('Admin', AdminSchema);

module.exports = {Admin};

