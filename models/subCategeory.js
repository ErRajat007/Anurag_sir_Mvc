const mongoose = require('mongoose');
const { Schema } = mongoose;

const subCategorySchema = new Schema(
	{
		categoryId: {
			type: Schema.Types.ObjectId,
			ref: 'Category',
			required: true,
		},
		subCategoryName: {
			type: String,
			required: true,
		},
	},
	{
		timestamps: true,
	}
);

module.exports = mongoose.model('Subcategory', subCategorySchema);
