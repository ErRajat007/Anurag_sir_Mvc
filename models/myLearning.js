const mongoose = require('mongoose');
const { Schema } = mongoose;

const myLearningSchema = new Schema(
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
		course: {
			type: Schema.Types.ObjectId,
			ref: 'Course',
			required: true,
		},
		
	},

	{
		timestamps: true,
	}
);

module.exports = mongoose.model('MyLearning', myLearningSchema);
