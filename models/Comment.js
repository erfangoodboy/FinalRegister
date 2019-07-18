const mongoose = require('mongoose');

var CommentSchema = mongoose.Schema({
   text:{
       type: String
   } ,
    role:{
       type: String
    },
    sender_id:{
       type: Object,
        require: true
    },
    date:{
       type: Date
    },

    ticket_id:{
       type: Object,
        require: true
    }
});

var Comment = mongoose.model('Comment' , CommentSchema);

module.exports = {Comment} ;