const mongoose = require('mongoose');

const DepartmentSchema = new mongoose.Schema({

    name: {
        type: String,
        require: true,
        unique: true
    },
    description: {
        type: String
    },
    create: {
        type: Object,
        require: true
    }
});

var Department = mongoose.model('department' , DepartmentSchema) ;

module.exports = {Department};
