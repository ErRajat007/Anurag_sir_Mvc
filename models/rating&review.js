const mongoose = require('mongoose');
const { Schema } = mongoose;

const ratingReviewSchema = new Schema(
	{
		courseId: {
			type: Schema.Types.ObjectId,
			ref: 'Course',
			required: true,
		},
		userId: {
			type: Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		rating: {
			type: Number,
            
		},
		review: {
			type: String,
		},
	},

	{
		timestamps: true,
	}
);

module.exports = mongoose.model('rating&Review', ratingReviewSchema);
