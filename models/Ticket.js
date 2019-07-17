const mongoose = require('mongoose') ;


mongoose.plugin(schema => {
    schema.options.usePushEach = true
});

var TicketSchema = new mongoose.Schema({
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
        type: String,
        require: true
    }

});

var Ticket = mongoose.model('Ticket' , TicketSchema) ;

module.exports = {Ticket} ;