const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

mongoose.plugin(schema => {
    schema.options.usePushEach = true
});

var UserSchema = new mongoose.Schema({
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


UserSchema.pre('save', function (next) {
    var user = this;

    if (this.password &&this.isModified('password') || this.isNew) {
        let hash = bcrypt.hashSync(user.password, 10);
        user.password = hash;
        next();

    } else {
        next();
    }

});

UserSchema.methods.comparePassword = function (passw, cb) {
    bcrypt.compare(passw, this.password, function (err, isMatch) {
        if (err) {
            return cb(err)
        }
        return cb(null, isMatch)
    })
};

UserSchema.statics.findByCredentials = function (email, password) {
    var User = this;
    return new Promise((resolve, reject) => {
        // Use bcrypt.compare to compare password and user.password
        User.findOne({email: email})
            .then((user) => {
                if (!user) {
                     reject({eCode: 404 , eText: 'user not found'});
                } else {
                    bcrypt.compare(password, user.password, (err, res) => {
                        if (res) {
                            resolve(user);
                        } else {
                            reject({eCode: 400 , eText: 'password is not correct'});
                        }
                    });
                }
            });
    });
};

UserSchema.methods.generateAuthToken = function () {
    var user = this;
    var access = 'auth';
    var token = jwt.sign({_id: user._id.toString(), access}, 'abc123').toString();
    user.tokens = [{access, token}];

    return user.save().then(() => {
        return token;
    })
};



var User = mongoose.model('User', UserSchema);

module.exports = {User};

