const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
	{
		fullName: { type: String, required: true }, 
		email: { type: String, required: true },
		password: { type: String, required: false },
		otp: { type: Number, required: false, default: '' },
		role: { type: String, required: true, default: 'User' },
		profileImage: { type: String, default: '' }, 
		headline: { type: String, default: '' },
		biography: { type: String, default: '' },
		language: { type: String, default: '' },
		averageRating: { type: Number, default: 0 },
		totalReview: { type: Number, default: 0 },
		totalStudent: { type: Number, default: 0 },
		isInstructor: { type: Boolean, default: false },
		allowNotifications: { type: String, default: '' },
		isDeleted: { type: Boolean, required: false },
		teachingExperience : { type: String, default : '' },
		videoExperience : { type: String, default : '' },
		audiences : { type: String, default : '' },
		deviceId  : { type : String, default : '' },
		deviceType : { type : String, default : '' },
		fcmToken : { type : String, default : '' },
		fbId : { type : String, default : ''},
		googleId : { type : String, default : ''},
	},
	{ timestamps: true }
);

module.exports = mongoose.model('User', UserSchema);
