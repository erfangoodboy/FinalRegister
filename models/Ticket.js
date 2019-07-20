const mongoose = require('mongoose') ;


mongoose.plugin(schema => {
    schema.options.usePushEach = true
});
const Schema = mongoose.Schema;

var TicketSchema = new Schema({
    text: {
        type: String ,
        require: true
    },
    sender_id:{
        type: Object,
        require: true
    },
    title:{
        type: String,

    },
    date:{
        type: Date
    },
    deptId:{
        type: Schema.Types.ObjectId,
        require: true
    }

});

var Ticket = mongoose.model('Ticket' , TicketSchema) ;

module.exports = {Ticket} ;