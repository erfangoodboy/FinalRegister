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

    if (this.password && this.isModified('password') || this.isNew) {
        let hash = bcrypt.hashSync(user.password, 10);
        user.password = hash;
        next();

    } else {
        next();
    }

});

UserSchema.methods.generateAuthToken = function () {

    return new Promise((resolve, reject) => {
        var user = this;
        var access = 'auth';
        var token = jwt.sign({_id: user._id.toString(), access}, 'abc123').toString();
        user.tokens = [{access, token}];

        return user.save()
            .then(() => {
                resolve(token);

            })
            .catch((err) => {
                reject({eCode: 500, eText: err});
            })

    })

};

var User = mongoose.model('User', UserSchema);

module.exports = {User};

