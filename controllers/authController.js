const UserModel = require('../models/user');
const apiResponse = require('../helpers/responses');
const message = require('../helpers/messages');
const mailer = require('../helpers/mailer');
const _ = require('lodash');
const { body, validationResult } = require('express-validator');
const { sanitizeBody } = require('express-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
let ObjectId = require('mongodb').ObjectID;
let app = require('../server');

//API for registration of all users:===============================================================================
exports.register = [
	body('fullName')
		.trim()//String ke both side wide space ko hatata hai
		.isLength({ min: 1 })//minimum and maximum langth ke liye
		.withMessage(message.errorMsg.FullNameRequiredError),

	body('email')
		.trim()	
		.isLength({ min: 1 })
		.withMessage(message.errorMsg.EmailRequiredError)
		.isEmail()
		.withMessage(message.errorMsg.ValidEmailError)
		.custom(value => {
			return UserModel.findOne({ email: value }).then(user => {
				if (user) {
					return Promise.reject(message.errorMsg.EmailAlreadyError);
				}
			});
		}),

	body('password')
		.trim()
		.isLength({ min: 6 })
		.withMessage(message.errorMsg.PasswordLengthError),

	sanitizeBody('fullName').escape(),
	sanitizeBody('email').escape(),
	sanitizeBody('password').escape(),
	async (req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				// Send only 1 error at a time as per FE requirement.
				return apiResponse.validationError(res, errors.errors[0].msg);
			} else {
				bcrypt.hash(req.body.password, 10, async function (err, hash) {
					let userData = new UserModel({
						fullName: req.body.fullName,
						email: req.body.email,
						password: hash,
						role: req.body.role,
						deviceId: req.body.deviceId,
						deviceType: req.body.deviceType,
						fcmToken: req.body.fcmToken,
					});
					userData.save(async function (err, result) {
						if (err) {
							return apiResponse.serverErrorResponse(res, err);
						} else {
							let user = {
								_id: result._id,
								fullName: result.fullName,
								email: result.email,
								role: result.role,
								deviceId: result.deviceId,
								deviceType: result.deviceType,
								fcmToken: result.fcmToken,
							};
							const jwtPayload = user;
							const jwtData = {
								expiresIn: process.env.JWT_TIMEOUT_DURATION,
							};
							const secret = process.env.JWT_SECRET;
							let jwtToken = await jwt.sign(jwtPayload, secret, jwtData);
							user.token = jwtToken;
							return apiResponse.successResponseWithData(
								res,
								message.successMsg.UserCreatedSuccessful,
								user
							); 
						}
					});
				});
			}
		} catch (err) {
			return apiResponse.serverErrorResponse(res, err.message);
		}
	},
];
//=================================================================================================================
 
//API for login for all users =====================================================================================
exports.login = [
	body('email')
	.trim()
		.isLength({ min: 1 })
		.withMessage(message.errorMsg.EmailRequiredError)
		.isEmail()
		.withMessage(message.errorMsg.ValidEmailError),
	body('password')
	.trim()
		.isLength({ min: 1 })
		.withMessage(message.errorMsg.PasswordRequiredError),
	sanitizeBody('email').escape(),
	sanitizeBody('password').escape(),
	async (req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				// Send only 1 error at a time as per FE requirement.
				return apiResponse.validationError(res, errors.errors[0].msg);
			} else {
				let userData = await UserModel.find({ email: req.body.email });
				if (userData.length > 0) {
					let user = userData[0];
					user.deviceId = req.body.deviceId;
					user.deviceType = req.body.deviceType;
					user.fcmToken = req.body.fcmToken;
					await user.save();
					bcrypt.compare(
						req.body.password,
						user.password,
						async function (err, verified) {
							if (verified) {
								let userDetails = {
									_id: user._id,
									fullName: user.fullName,
									email: user.email,
									role: user.role,
								};
								const jwtPayload = userDetails;
								const jwtData = {
									expiresIn: process.env.JWT_TIMEOUT_DURATION,
								};
								const secret = process.env.JWT_SECRET;
								jwtToken = jwt.sign(jwtPayload, secret, jwtData);
								user.password = undefined;
								user.otp = undefined;
								if(user.profileImage != ""){
									let profilePath = user.profileImage.split('/')
									user.profileImage = req.protocol + '://' + req.headers.host + '/' + profilePath[profilePath.length - 1]
											}
								return apiResponse.successResponseWithData(
									res,
									message.successMsg.LoginSuccessfull,
									{ token: jwtToken, userDetail: user }
								);
							} else {
								return apiResponse.unauthorizedResponse(
									res,
									message.errorMsg.WrongPassword
								);
							}
						}
					);
				} else {
					return apiResponse.unauthorizedResponse(
						res,
						message.errorMsg.WrongEmail
					);
				}
			}
		} catch (err) {
			return apiResponse.serverErrorResponse(res, err.message);
		}
	},
];
//=================================================================================================================

//API for Forgot Password ==========================================================================================
exports.forgotPassword = [
	body('email')
	.trim()
		.isLength({ min: 1 })
		.withMessage(message.errorMsg.EmailRequiredError)
		.isEmail()
		.withMessage(message.errorMsg.ValidEmailError)
		.custom(value => {
			return UserModel.findOne({ email: value }).then(user => {
				if (user == null) {
					return Promise.reject(message.errorMsg.WrongEmail);
				}
			});
		}),
	sanitizeBody('email').escape(),
	async (req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				// Send only 1 error at a time as per FE requirement.
				return apiResponse.validationError(res, errors.errors[0].msg);
			} else {
				const email = req.body;
				UserModel.findOne(email, (err, user) => {
					let otp = Math.floor(100000 + Math.random() * 900000);
					UserModel.updateOne(
						{ _id: user._id },
						{ otp: otp },
						(err, _success) => {
							if (err) {
								return apiResponse.ErrorResponse(res, err);
							} else {
								let html =
									'<p>Please create new password by using this OTP: </p><b>' +
									otp +
									'</b>';
								mailer
									.send(
										process.env.EMAIL_SMTP_USERNAME,
										user.email,
										'Forgot Password',
										html
									)
									.then(function () {
										return apiResponse.successResponseWithData(
											res,
											message.successMsg.OTPSentOnEmail
										);
									});
							}
						}
					);
				});
			}
		} catch (err) {
			return apiResponse.validationError(res, err.message);
		}
	},
];
//==================================================================================================================

//API for reset password============================================================================================
exports.resetPassword = [
	body('otp')
	.trim()
		.isLength({ min: 1 })
		.withMessage(message.errorMsg.OTPRequiredError),
	body('newPass')
	.trim()
		.isLength({ min: 1 })
		.withMessage(message.errorMsg.PasswordRequiredError),
	sanitizeBody('otp').escape(),
	sanitizeBody('newPass').escape(),
	async (req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				// Display sanitized values/errors messages.
				return apiResponse.validationError(res, errors.errors[0].msg);
			} else {
				const { newPass, otp } = req.body;
				let user = await UserModel.findOne({ otp: otp });

				if (user == null) {
					return apiResponse.validationError(res, message.errorMsg.InvalidOTP);
				} else {
					bcrypt.hash(newPass, 10, function (err, hash) {
						if (err) {
							return apiResponse.serverErrorResponse(res, err);
						} else {
							const obj = {
								otp: '',
								password: hash,
							};
							user = _.extend(user, obj);
							user.save((err, result) => {
								if (err) {
									return apiResponse.serverErrorResponse(res, err);
								} else {
									user.password = undefined;
									return apiResponse.successResponseWithData(
										res,
										message.successMsg.ResetPasswordSuccess,
										user
									);
								}
							});
						}
					});
				}
			}
		} catch (err) {
			return apiResponse.validationError(res, err.message);
		}
	},
];
//==================================================================================================================

//API for facebook login ===========================================================================================
exports.fbLogin = [
	body('email')
	.trim()
		.isLength({ min: 1 })
		.withMessage(message.errorMsg.EmailRequiredError)
		.isEmail()
		.withMessage(message.errorMsg.ValidEmailError),
	body('fbId')
	.trim()
		.isLength({ min: 1 })
		.withMessage(message.errorMsg.FbIdRequiredError),
	body('fullName')
	.trim()
		.isLength({ min: 1 })
		.withMessage(message.errorMsg.EmailRequiredError),
	sanitizeBody('email').escape(),
	sanitizeBody('password').escape(),
	async (req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				// Send only 1 error at a time as per FE requirement.
				return apiResponse.validationError(res, errors.errors[0].msg);
			} else {
				let { fbId, email, fullName } = req.body;
				let userData = await UserModel.find({ email: email });
				if (userData.length > 0) {
					let user = userData[0];
					// if(userData.fbId == "" || userData.fbId == undefined || userData.fbId == null ){
					// let r1 = await RatingReviewModel.updateOne({userId: userId, courseId: courseId} ,{ $set : obj},{new :true})
					user.fbId = fbId;
					user.deviceId = req.body.deviceId;
					user.deviceType = req.body.deviceType;
					user.fcmToken = req.body.fcmToken;
					user.profileImage = req.body.profileImage
					await user.save();

					let userDetails = {
						_id: user._id,
						fullName: user.fullName,
						email: user.email,
						role: user.role,
					};
					const jwtPayload = userDetails;
					const jwtData = {
						expiresIn: process.env.JWT_TIMEOUT_DURATION,
					};
					const secret = process.env.JWT_SECRET;
					jwtToken = jwt.sign(jwtPayload, secret, jwtData);
					user.password = undefined;
					user.otp = undefined;
					return apiResponse.successResponseWithData(
						res,
						message.successMsg.LoginSuccessfull,
						{ token: jwtToken, userDetail: user }
					);
				} else {
					const User = new UserModel({
						fullName: fullName,
						email: email,
						fbId: fbId,
						deviceId : req.body.deviceId,
						deviceType : req.body.deviceType,
						fcmToken : req.body.fcmToken,
						profileImage : req.body.profileImage
					});
					await User.save();

					let userDetails = {
						_id: User._id,
						fullName: User.fullName,
						email: User.email,
						role: User.role,
					};
					const jwtPayload = userDetails;
					const jwtData = {
						expiresIn: process.env.JWT_TIMEOUT_DURATION,
					};
					const secret = process.env.JWT_SECRET;
					jwtToken = jwt.sign(jwtPayload, secret, jwtData);
					User.password = undefined;
					User.otp = undefined;
					return apiResponse.successResponseWithData(
						res,
						message.successMsg.LoginSuccessfull,
						{ token: jwtToken, userDetail: User }
					);
				}
			}
		} catch (err) {
			return apiResponse.serverErrorResponse(res, err.message);
		}
	},
];
//==================================================================================================================

//API for google login =============================================================================================
exports.googleLogin = [
	body('email')
	.trim()
		.isLength({ min: 1 })
		.withMessage(message.errorMsg.EmailRequiredError)
		.isEmail()
		.withMessage(message.errorMsg.ValidEmailError),
	body('googleId')
	.trim()
		.isLength({ min: 1 })
		.withMessage(message.errorMsg.GoogleIdRequiredError),
	body('fullName')
	.trim()
		.isLength({ min: 1 })
		.withMessage(message.errorMsg.EmailRequiredError),
	sanitizeBody('email').escape(),
	sanitizeBody('password').escape(),
	async (req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				// Send only 1 error at a time as per FE requirement.
				return apiResponse.validationError(res, errors.errors[0].msg);
			} else {
				let { googleId, email, fullName } = req.body;
				let userData = await UserModel.find({ email: email });
				if (userData.length > 0) {
					// if(userData.fbId == "" || userData.fbId == undefined || userData.fbId == null ){
					// let r1 = await RatingReviewModel.updateOne({userId: userId, courseId: courseId} ,{ $set : obj},{new :true})

					let user = userData[0];
					user.googleId = googleId;
					user.deviceId = req.body.deviceId;
					user.deviceType = req.body.deviceType;
					user.fcmToken = req.body.fcmToken;
					user.profileImage = req.body.profileImage
					await user.save();

					let userDetails = {
						_id: user._id,
						fullName: user.fullName,
						email: user.email,
						role: user.role,
					};
					const jwtPayload = userDetails;
					const jwtData = {
						expiresIn: process.env.JWT_TIMEOUT_DURATION,
					};
					const secret = process.env.JWT_SECRET;
					jwtToken = jwt.sign(jwtPayload, secret, jwtData);
					user.password = undefined;
					user.otp = undefined;
					return apiResponse.successResponseWithData(
						res,
						message.successMsg.LoginSuccessfull,
						{ token: jwtToken, userDetail: user }
					);
				} else {
					const User = new UserModel({
						fullName: fullName,
						email: email,
						googleId: googleId,
						deviceId : req.body.deviceId,
						deviceType : req.body.deviceType,
						fcmToken  : req.body.fcmToken,
						profileImage : req.body.profileImage
					});
					await User.save();

					let userDetails = {
						_id: User._id,
						fullName: User.fullName,
						email: User.email,
						role: User.role,
					};
					const jwtPayload = userDetails;
					const jwtData = {
						expiresIn: process.env.JWT_TIMEOUT_DURATION,
					};
					const secret = process.env.JWT_SECRET;
					jwtToken = jwt.sign(jwtPayload, secret, jwtData);
					User.password = undefined;
					User.otp = undefined;
					return apiResponse.successResponseWithData(
						res,
						message.successMsg.LoginSuccessfull,
						{ token: jwtToken, userDetail: User }
					);
				}
			}
		} catch (err) {
			return apiResponse.serverErrorResponse(res, err.message);
		}
	},
];
//==================================================================================================================
