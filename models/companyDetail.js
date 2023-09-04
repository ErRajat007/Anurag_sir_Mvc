const mongoose = require('mongoose');
const { Schema } = mongoose;
const companyDetailSchema = new mongoose.Schema(
	{
		address: { type: String },
		country: { type: String },
		image: { type: String, default: '' },
		admin: {
			type: Schema.Types.ObjectId,
			ref: 'User',
			
		}
		
	},
	{ timestamps: true }
);

module.exports = mongoose.model('CompanyDetail', companyDetailSchema);
