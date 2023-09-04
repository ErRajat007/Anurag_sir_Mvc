const mongoose = require('mongoose');
const { Schema } = mongoose;

const cartSchema = new mongoose.Schema(
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
		isPurchased: {
			type: Boolean,
			default: false,
		},
		paymentId : {
			type : String,
			default: ""
		},
		amount : {
			type : Number
		},
		currency : {
			type : String,
			default : ""
		},
		amountPaid : {
			type : String,
			default : ""
		},
		amountDue : {
			type : String,
			default : ""
		},
		receipt : {
			type : String,
			default : ""
		},
		refunds : {
			type : Object,
			default : {}
		}, 
		orderId : {
			type: String,
			default: ""
		},
		isRefund : {
			type: Boolean,
			default: false
		}
	
	},
	{
		timestamps: true,
	}
);

module.exports = mongoose.model('Cart', cartSchema);
