const mongoose = require('mongoose');
const { Schema } = mongoose;

const reviewReportSchema = new Schema(
	{
		course: {
			type: Schema.Types.ObjectId,
			ref: 'Course',
			required: true,
		},
		user: {
			type: Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		report: {
			type: String,
            
		},
        review : {
            type : Schema.Types.ObjectId,
            ref : 'rating&Review',
            required : true
        }
	},

	{
		timestamps: true,
	}
);

module.exports = mongoose.model('ReviewReport', reviewReportSchema);
