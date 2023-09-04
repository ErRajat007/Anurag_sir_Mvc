const mongoose = require('mongoose');
const { Schema } = mongoose;

const reminderSchema = new Schema(
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
		reminderDate: {
			type: String,
		},
		reminderTime: {
			type: String,
		},
		notification: {},
	},

	{
		timestamps: true,
	}
);

module.exports = mongoose.model('Reminder', reminderSchema);
