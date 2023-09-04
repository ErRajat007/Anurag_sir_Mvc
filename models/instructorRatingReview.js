const mongoose = require('mongoose');
const { Schema } = mongoose;

const instructorRatingReviewSchema = new Schema(
	{
		instructor: {
			type: Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		student: {
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

module.exports = mongoose.model('InstructorRatingReview', instructorRatingReviewSchema);
