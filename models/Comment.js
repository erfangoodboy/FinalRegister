const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var CommentSchema = Schema({
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
       type: Schema.Types.ObjectId,
        require: true
    }
});

var Comment = mongoose.model('Comment' , CommentSchema);

module.exports = {Comment} ;