const mongoose = require('mongoose');
const { Schema } = mongoose;

const sectionSchema = new Schema(
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
		sectionName: {
			type: String,
			required: true,
		},
	},
	{
		timestamps: true,
	}
);

module.exports = mongoose.model('Section', sectionSchema);
