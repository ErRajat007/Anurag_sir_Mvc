const mongoose = require('mongoose');
const { Schema } = mongoose;

const wishSchema = new mongoose.Schema(
	{
		userId: {
			type: Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		courseId: {
			type: Schema.Types.ObjectId,
			ref: 'Course',
			required: true,
		},
	},
	{
		timestamps: true,
	}
);

module.exports = mongoose.model('Wish', wishSchema);
