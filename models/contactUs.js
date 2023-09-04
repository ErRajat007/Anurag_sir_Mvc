const mongoose = require('mongoose');
const { Schema } = mongoose;

const contactUsSchema = new mongoose.Schema(
	{
		userName: {
			type: String,
			
			required: true,
		},
		emailId: {
			type: String,
			
			required: true,
		},
        query: {
			type: String,
			
			required: true,
		},
        description: {
			type: String,
			
			required: true,
		},
	},
	{
		timestamps: true,
	}
);

module.exports = mongoose.model('ContactUs', contactUsSchema);
