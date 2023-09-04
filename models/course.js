const mongoose = require('mongoose');
const { Schema } = mongoose;

const courseSchema = new Schema(
	{
		categoryId: {
			type: Schema.Types.ObjectId,
			ref: 'Category',
			required: true,
		},
		subCategoryId: {
			type: Schema.Types.ObjectId, 
			ref: 'Subcategory',
			required: true,
		},
		sectionId: {
			type: Schema.Types.ObjectId,
			ref: 'Section',
			required: true,
		},

		title: {
			type: String,
			required: true,
		},
		description: {
			type: String,
			required: true,
		},
		imageFile: {
			type: String,
		},
		videoFile: {
			type: String,
		},

		price: {
			type: Number,
			default: 0,
		},
		duration: {
			type: Number,
			default: 0,
		},
		userWhoHasBought: [
			{
				type: Schema.Types.ObjectId,
				ref: 'User',
			},
		],
		createdBy: {
			type: Schema.Types.ObjectId,
			ref: 'User',
		},
		qna: [
			{
				sender: {
					type: String,
				},
				message: {
					type: String,
				},
			},
		],
		chapters: [
			{
				type: Schema.Types.ObjectId,
				ref: 'Chapter',
			}
		],
        lectures: [
			{
				type: Schema.Types.ObjectId,
				ref: 'Lecture',
			}
		],
        averageRating : {
            type : Number
        },
        totalReview : {
            type : Number,
			default : 0
        },
		totalStudent : {
			type : Number,
			default : 0
		},
		allowPermission : {
			type : String, default : "Approval Required!"
		},
		rejectReason : {type : String, default :''}
	},

	{
		timestamps: true,
	}
);

module.exports = mongoose.model('Course', courseSchema);
