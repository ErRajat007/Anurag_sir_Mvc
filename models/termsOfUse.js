const mongoose = require('mongoose');
const { Schema } = mongoose;

const termsOfUseSchema = new Schema({
    title : {
        type: String,
    },
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
module.exports = mongoose.model('TermsOfUse', termsOfUseSchema );