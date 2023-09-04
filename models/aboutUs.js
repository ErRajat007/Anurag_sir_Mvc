const mongoose = require('mongoose');
const { Schema } = mongoose;

const aboutUsSchema = new Schema({
    description : {
        type: String,
    },
    admin: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        
    },

    
},{
    timestamps : true
})
module.exports = mongoose.model('AboutUs', aboutUsSchema );