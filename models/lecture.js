const mongoose = require('mongoose');
const { Schema } = mongoose;

const lectureSchema = new Schema(
	{
		courseId: {
			type: Schema.Types.ObjectId,
			ref: 'Course',
			required: true,
		},
		chapterId: {
			type: Schema.Types.ObjectId,
			ref: 'Chapter',
			required: true,
		},
		lectureTitle: {
			type: String,
			required: true,
		},
		description: {
			type: String,
			required: true,
		},
		videoPath: {
			type: String,
		},
		duration: {
			type: Number,
			default: 0,
		},
	},

	{
		timestamps: true,
	}
);

module.exports = mongoose.model('Lecture', lectureSchema);
