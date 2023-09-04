const CartModel = require('../models/cart');
const UserModel = require('../models/user');
const CourseModel = require('../models/course');
const WishListModel = require('../models/wishList');
const MyLearningModel = require('../models/myLearning');
const Razorpay = require('razorpay');
const shortid = require('shortid');
const crypto = require('crypto');
require('dotenv').config();

const apiResponse = require('../helpers/responses');
const message = require('../helpers/messages');
const { body, validationResult } = require('express-validator');
const { sanitizeBody } = require('express-validator');
let ObjectId = require('mongodb').ObjectID;

//Configuration for Razorpay
const razorpay = new Razorpay({
	key_id: process.env.Razor_key_id,
	key_secret: process.env.Razor_key_secret,
});

//API for generating order ID using razor pay:=====================================================================
exports.generateRazorPayOrderId = [
	async (req, res) => {
		try {
			let userId = req.currentUser._id;
			let { amount } = req.body;
			//Razor-pay create order method
			await razorpay.orders
				.create({
					amount,
					currency: 'INR',
					receipt: shortid.generate(),
				})
				.then(async razorData => {
					//if razor-pay order is created
					if (razorData) {
						//Updating the cart collection with razor-pay data where UserId is same as user logged In
						const cartData = await CartModel.updateMany(
							{ userId: userId },
							{
								$set: {
									amount: razorData.amount,
									orderId: razorData.id,
									amountPaid: razorData.amount_paid,
									amountDue: razorData.amount_due,
									currency: razorData.currency,
									receipt: razorData.receipt,
									userId: userId,
								},
							}
						);
						// If data is updated gives response true
						if (cartData) {
							return apiResponse.successResponseWithData(
								res,
								message.successMsg.OrderIdGenerated,
								razorData
							);
						}
					}
				})
				.catch(err => {
					return apiResponse.serverErrorResponse(
						res,
						message.errorMsg.RazorPayServerError
					);
				});
		} catch (error) {
			return apiResponse.serverErrorResponse(res, error.message);
		}
	},
];
//=================================================================================================================

//API for verify order ID & verify payment successfully done using razor pay:======================================
exports.verifyRazorPayPayment = [
	body('courseId')
		.isLength({ min: 1 })
		.trim()
		.withMessage(message.errorMsg.CourseIdRequiredError)
		.custom(value => {
			return CourseModel.findOne({ _id: value }).then(course => {
				if (!course) {
					return Promise.reject(message.errorMsg.CourseIdNotFoundError);
				}
			});
		}),
	body('payment_id')
		.isLength({ min: 1 })
		.trim()
		.withMessage(message.errorMsg.PaymentIdRequiredError),
	body('order_id')
		.isLength({ min: 1 })
		.trim()
		.withMessage(message.errorMsg.OrderIdRequiredError),
	body('payment_signature')
		.isLength({ min: 1 })
		.trim()
		.withMessage(message.errorMsg.PaymentSignatureRequiredError),
	sanitizeBody('courseId').escape(),
	sanitizeBody('payment_id').escape(),
	sanitizeBody('order_id').escape(),
	sanitizeBody('payment_signature').escape(),
	async (req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				// Send only 1 error at a time as per FE requirement.
				return apiResponse.validationError(res, errors.errors[0].msg);
			} else {
				let userId = req.currentUser._id;
				let { courseId, payment_id, order_id, payment_signature } = req.body;

				//method for generating the signature
				let generatedSignature = crypto
					.createHmac('SHA256', process.env.Razor_key_secret)
					.update(order_id + '|' + payment_id)
					.digest('hex');
				//if the generated signature matches the payment-signature coming from front end, it gives a boolean value

				let isSignatureValid = generatedSignature == payment_signature;

				//if the boolean values is true, means signature is matched,payment successfull
				if (isSignatureValid == true) {
					const updateData = await CartModel.updateOne(
						{ userId: userId, courseId: courseId },
						{ $set: { isPurchased: true } }
					);
					const WishList = await WishListModel.deleteOne({
						userId: userId,
						courseId: courseId,
					});

					const courseData = await CourseModel.findOne({ _id: courseId });
					courseData.totalStudent = courseData.totalStudent + 1;
					await courseData.save();

					const userData = await UserModel.findOne({
						_id: courseData.createdBy,
					});
					userData.totalStudent = userData.totalStudent + 1;
					await userData.save();

					const addMyLearning = await new MyLearningModel({
						student: userId,
						instructor: courseData.createdBy,
						course: courseData._id,
					});
					await addMyLearning.save();

					return apiResponse.successResponseWithData(
						res,
						message.successMsg.PaymentSuccessfull
					);
				}
				//if the boolean value is false, means signature is not matched ,payment failed
				else {
					return apiResponse.serverErrorResponse(
						res,
						message.errorMsg.PaymentFailed
					);
				}
			}
		} catch (error) {
			return apiResponse.serverErrorResponse(res, error.message);
		}
	},
];
//=================================================================================================================

//API for verify al course payment successfully done using razor pay:==============================================
exports.verifyAllPayment = [
	body('payment_id')
		.isLength({ min: 1 })
		.trim()
		.withMessage(message.errorMsg.PaymentIdRequiredError),
	body('order_id')
		.isLength({ min: 1 })
		.trim()
		.withMessage(message.errorMsg.OrderIdRequiredError),
	body('payment_signature')
		.isLength({ min: 1 })
		.trim()
		.withMessage(message.errorMsg.PaymentSignatureRequiredError),

	sanitizeBody('payment_id').escape(),
	sanitizeBody('order_id').escape(),
	sanitizeBody('payment_signature').escape(),
	async (req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				// Send only 1 error at a time as per FE requirement.
				return apiResponse.validationError(res, errors.errors[0].msg);
			} else {
				let userId = req.currentUser._id;
				let { courseIds, payment_id, order_id, payment_signature } = req.body;

				//method for generating the signature
				let generatedSignature = crypto 
					.createHmac('SHA256', process.env.Razor_key_secret)
					.update(order_id + '|' + payment_id)
					.digest('hex');
				//if the generated signature matches the payment-signature coming from front end, it gives a boolean value

				let isSignatureValid = generatedSignature == payment_signature;

				//if the boolean values is true, means signature is matched,payment successfull
				if (isSignatureValid == true) {
					courseIds.map(async courseId => {
						const updateData = await CartModel.updateOne(
							{ userId: userId, courseId: courseId },
							{ $set: { isPurchased: true } }
						);
						const WishList = await WishListModel.deleteOne({
							userId: userId,
							courseId: courseId,
						});

						const courseData = await CourseModel.findOne({ _id: courseId });
						courseData.totalStudent = courseData.totalStudent + 1;
						await courseData.save();

						const userData = await UserModel.findOne({
							_id: courseData.createdBy,
						});
						userData.totalStudent = userData.totalStudent + 1;
						await userData.save();

						const addMyLearning = await new MyLearningModel({
							student: userId,
							instructor: courseData.createdBy,
							course: courseData._id,
						});
						await addMyLearning.save();
						
					});
					return apiResponse.successResponseWithData(
						res,
						message.successMsg.PaymentSuccessfull
					);
				}
				//if the boolean value is false, means signature is not matched ,payment failed
				else {
					return apiResponse.serverErrorResponse(
						res,
						message.errorMsg.PaymentFailed
					);
				}
			}
		} catch (error) {
			return apiResponse.serverErrorResponse(res, error.message);
		}
	},
];
//=================================================================================================================
