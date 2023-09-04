const mongoose = require('mongoose');
const { Schema } = mongoose;

const chapterSchema = new Schema({
    courseId: {
        type: Schema.Types.ObjectId,
        ref: 'Course',
        required: true,
    },
    chapterTitle : {
        type: String,
        required: true
    },
    lectures: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Lecture',
        }
    ],
},{
    timestamps : true
})
module.exports = mongoose.model('Chapter', chapterSchema );