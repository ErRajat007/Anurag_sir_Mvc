const UserModel = require('../models/user');
const AboutUsModel = require('../models/aboutUs');
const CompanyDetailModel = require('../models/companyDetail');
const FaqModel = require('../models/frequentlyAskedQuestion');
const TermsOfUseModel = require('../models/termsOfUse');
const CourseModel = require('../models/course');
const ReviewReportModel = require('../models/reviewReport');
const RatingReviewModel = require('../models/rating&review');
const { pushNotification, pushNotifications } = require('../helpers/utils');
const apiResponse = require('../helpers/responses');
const message = require('../helpers/messages');
const { body, validationResult } = require('express-validator');
const { sanitizeBody } = require('express-validator');
const ImageUpload = require('../middlewares/imageUpload');
let ObjectId = require('mongodb').ObjectID;
const PrivacyPolicyModel = require('../models/privacyPolicy');

//API for get all user list:====================================================================================
exports.getUserList = [
	async (req, res) => {
		try {
			// find all the user from the database
			const Users = await UserModel.find().lean();
			if (Users !== null || Users !== undefined) {
				if (Users.length > 0) {
					Users.filter( user => {
						let imagePath = user.profileImage.split("/")
						if(user.profileImage != ""){
						user.profileImage = req.protocol + '://' + req.headers.host + '/' + imagePath[imagePath.length - 1]
						}
					})
					
					return apiResponse.successResponseWithData(
						res,
						message.successMsg.UserListDisplayed,
						Users
					);
				} else {
					return apiResponse.notFoundResponse(
						res,
						message.errorMsg.NoDataFound
					);
				}
			} else {
				return apiResponse.serverErrorResponse(
					res,
					message.errorMsg.MongoError
				);
			}
		} catch (error) {
			return apiResponse.serverErrorResponse(res, error.message);
		}
	},
];
//==============================================================================================================

//API for get user as per UserID ===============================================================================
exports.getUserById = [
	body('userId')
		.isLength({ min: 1 })
		.trim()
		.withMessage(message.errorMsg.UserIdRequiredError)
		.custom(value => {
			return UserModel.findOne({ _id: value }).then(user => {
				if (!user) {
					return Promise.reject(message.errorMsg.UserIdNotFoundError);
				}
			});
		}),
	sanitizeBody('userId').escape(),

	async (req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				// Send only 1 error at a time as per FE requirement.
				return apiResponse.validationError(res, errors.errors[0].msg);
			} else {
				let { userId } = req.body;
				// find  user from the database
				const Users = await UserModel.find({ _id: userId }).lean();
				if (Users !== null || Users !== undefined) {
					if (Users.length > 0) {
						Users.filter( user => {
							let imagePath = user.profileImage.split("/")
							if(user.profileImage != ""){
							user.profileImage = req.protocol + '://' + req.headers.host + '/' + imagePath[imagePath.length - 1]
							}
						})
						return apiResponse.successResponseWithData(
							res,
							message.successMsg.UserDataDisplayed,
							Users
						);
					} else {
						return apiResponse.notFoundResponse(
							res,
							message.errorMsg.NoDataFound
						);
					}
				} else {
					return apiResponse.serverErrorResponse(
						res,
						message.errorMsg.MongoError
					);
				}
			}
		} catch (error) {
			return apiResponse.serverErrorResponse(res, error.message);
		}
	},
];
//==============================================================================================================

//API for adding aboutus data by admin==========================================================================
exports.addAboutUs = [
	body('description')
		.isLength({ min: 1 })
		.trim()
		.withMessage(message.errorMsg.DescriptionRequiredError),
	sanitizeBody('description').escape(),

	async (req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				// Send only 1 error at a time as per FE requirement.
				return apiResponse.validationError(res, errors.errors[0].msg);
			} else {
				let adminId = req.currentUser._id;
				let { description } = req.body;
				const aboutUsData = await AboutUsModel.find({ admin: adminId });

				if (aboutUsData.length > 0) {
					const about = await AboutUsModel.findOneAndUpdate(
						{ admin: adminId },
						{ $set: { description: description } },
						{ new: true }
					);
					return apiResponse.successResponseWithData(
						res,
						message.successMsg.AboutUsAddedSuccessfull,
						about
					);
				} else {
					const aboutUsData = await new AboutUsModel({
						admin: adminId,
						description: description,
					});
					aboutUsData.save();
					return apiResponse.successResponseWithData(
						res,
						message.successMsg.AboutUsAddedSuccessfull,
						aboutUsData
					);
				}
			}
		} catch (error) {
			return apiResponse.serverErrorResponse(res, error.message);
		}
	},
];
//==============================================================================================================

//API for adding company details data(address,country & image) by admin=========================================
exports.addCompanyDetail = [
	async (req, res) => {
		try {
			await ImageUpload(req, res);
			if (req.file == null) {
				return apiResponse.validationError(
					res,
					message.errorMsg.fileRequiredError
				);
			} else {
				let adminId = req.currentUser._id;
				let { address, country } = req.body;
				let path = req.file.filename;
				let imagePath = req.protocol + '://' + req.headers.host + '/' + path;

				const companyDetailData = await new CompanyDetailModel({
					admin: adminId,
					address: address,
					country: country,
					image: imagePath,
				});
				companyDetailData.save();
				return apiResponse.successResponseWithData(
					res,
					message.successMsg.CompanyDetailAddedSuccessfull,
					companyDetailData
				);
			}
		} catch (error) {
			return apiResponse.serverErrorResponse(res, error.message);
		}
	},
];
//==============================================================================================================

//API for adding frequently asked Quetions =====================================================================
exports.addFrequentlyAskedQuestion = [
	body('question')
		.isLength({ min: 1 })
		.trim()
		.withMessage(message.errorMsg.QuestionRequiredError),

	body('answer')
		.isLength({ min: 1 })
		.trim()
		.withMessage(message.errorMsg.AnswerRequiredError),

	sanitizeBody('question').escape(),
	sanitizeBody('answer').escape(),

	async (req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				// Send only 1 error at a time as per FE requirement.
				return apiResponse.validationError(res, errors.errors[0].msg);
			} else {
				let { question, answer } = req.body;
				new FaqModel({ question, answer }).save((err, result) => {
					if (err) {
						return apiResponse.serverErrorResponse(res, err.message);
					} else {
						return apiResponse.successResponseWithData(
							res,
							message.successMsg.FaqAddedSuccessfully,
							result
						);
					}
				});
			}
		} catch (error) {
			return apiResponse.serverErrorResponse(res, error.message);
		}
	},
];
//==============================================================================================================

//API for adding  privacy Policy  ==============================================================================
exports.addPrivacyPolicyData = [
	body('title')
		.isLength({ min: 1 })
		.trim()
		.withMessage(message.errorMsg.QuestionRequiredError),

	body('description')
		.isLength({ min: 1 })
		.trim()
		.withMessage(message.errorMsg.AnswerRequiredError),

	sanitizeBody('title').escape(),
	sanitizeBody('description').escape(),

	async (req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				// Send only 1 error at a time as per FE requirement.
				return apiResponse.validationError(res, errors.errors[0].msg);
			} else {
				let adminId = req.currentUser._id;
				let { title, description } = req.body;
				const policyData = await PrivacyPolicyModel.find({ admin: adminId });
				if (policyData.length > 0) {
					const policyData = await PrivacyPolicyModel.findOneAndUpdate(
						{ admin: adminId },
						{ $set: { title: title, description: description } },
						{ new: true }
					);
					return apiResponse.successResponseWithData(
						res,
						message.successMsg.PolicyAddedSuccessfully,
						policyData
					);
				} else {
					new PrivacyPolicyModel({ title, description, admin: adminId }).save(
						(err, result) => {
							if (err) {
								return apiResponse.serverErrorResponse(res, err.message);
							} else {
								return apiResponse.successResponseWithData(
									res,
									message.successMsg.PolicyAddedSuccessfully,
									result
								);
							}
						}
					);
				}
			}
		} catch (error) {
			return apiResponse.serverErrorResponse(res, error.message);
		}
	},
];
//==============================================================================================================

//API for adding term of use data by admin======================================================================
exports.addTermsOfUse = [
	body('title')
		.isLength({ min: 1 })
		.trim()
		.withMessage(message.errorMsg.DescriptionRequiredError),
	body('description')
		.isLength({ min: 1 })
		.trim()
		.withMessage(message.errorMsg.DescriptionRequiredError),
	sanitizeBody('title').escape(),
	sanitizeBody('description').escape(),

	async (req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				// Send only 1 error at a time as per FE requirement.
				return apiResponse.validationError(res, errors.errors[0].msg);
			} else {
				let adminId = req.currentUser._id;
				let { title, description } = req.body;
				const termData = await TermsOfUseModel.find({ admin: adminId });

				if (termData.length > 0) {
					const termsData = await TermsOfUseModel.findOneAndUpdate(
						{ admin: adminId },
						{ $set: { title: title, description: description } },
						{ new: true }
					);
					return apiResponse.successResponseWithData(
						res,
						message.successMsg.TermsAddedSuccessfull,
						termsData
					);
				} else {
					const termsData = await new TermsOfUseModel({
						admin: adminId,
						title: title,
						description: description,
					});
					termsData.save();
					return apiResponse.successResponseWithData(
						res,
						message.successMsg.TermsAddedSuccessfull,
						termsData
					);
				}
			}
		} catch (error) {
			return apiResponse.serverErrorResponse(res, error.message);
		}
	},
];
//==============================================================================================================

//API for soft delete user======================================================================================
exports.softDelete = [
	body('userId')
		.isLength({ min: 1 })
		.trim()
		.withMessage(message.errorMsg.UserIdRequiredError),
	sanitizeBody('userId').escape(),

	async (req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				// Send only 1 error at a time as per FE requirement.
				return apiResponse.validationError(res, errors.errors[0].msg);
			} else {
				let adminId = req.currentUser._id;
				let { userId } = req.body;
				const userData = await UserModel.findOne({ _id: userId });
				if (userData.isDeleted) {
					return apiResponse.unauthorizedResponse(
						res,
						message.errorMsg.AlreadyDeleted
					);
				} else {
					const updatedUserData = await UserModel.findByIdAndUpdate(
						{ _id: userId },
						{ $set: { isDeleted: true } },
						{ new: true }
					);
					return apiResponse.successResponseWithData(
						res,
						message.successMsg.UserDeletionSuccessfull,
						{ isDeleted: updatedUserData.isDeleted }
					);
				}
			}
		} catch (error) {
			return apiResponse.serverErrorResponse(res, error.message);
		}
	},
];
//==============================================================================================================

//API for allow permission to add course of user================================================================
exports.givePermissionToCourse = [
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
	sanitizeBody('courseId').escape(),

	async (req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				// Send only 1 error at a time as per FE requirement.
				return apiResponse.validationError(res, errors.errors[0].msg);
			} else {
				let { courseId } = req.body;

				const courseData = await CourseModel.findOneAndUpdate(
					{ _id : courseId },
					{ $set : { allowPermission : 'Approved' } },
					{ new : true }
				);

				if (!courseData) {
					return apiResponse.notFoundResponse(res, message.errorMsg.MongoError);
				} 
				else {
					//push notification for instructor that his course is approved
					let userData = await UserModel.findOne({ _id : courseData.createdBy });

					let msg = {
						notification : {
							title : 'Course Approved',
							body  : `Your course - ${ courseData.title } has been aprroved`,
						}
					};

					pushNotification(userData.fcmToken, msg);
					
					//push notification for all user that new course is added
					let users = await UserModel.find();
					
					let tokenArray = users.map(user => {
						return user._doc.fcmToken;
					});

					let msgs = {
						    data : {
							   title : 'New Course added',
							   body  : `New course - ${courseData.title} has been added`,
						    },
						tokens : tokenArray,
					};
					
					pushNotifications(msgs);

					return apiResponse.successResponseWithData(
						res,
						message.successMsg.PermissionGrantedSuccessfully,
						{ allowPermission: courseData.allowPermission }
					);
				}
			}
		} catch (error) {
			return apiResponse.serverErrorResponse(res, error.message);
		}
	},
];
//==============================================================================================================

//API for getting all Course for approval:======================================================================
exports.getCourseForApproval = [
	async (req, res) => {
		try {
			// find all the category from the database
			const Courses = await CourseModel.find({ allowPermission: 'Pending' })
				.populate('categoryId', 'categoryName')
				.populate('subCategoryId', 'subCategoryName')
				.populate('sectionId', 'sectionName');
			if (Courses !== null || Courses !== undefined) {
				if (Courses.length > 0) {
					return apiResponse.successResponseWithData(
						res,
						message.successMsg.CoursesDisplayed,
						Courses
					);
				} else {
					return apiResponse.notFoundResponse(
						res,
						message.errorMsg.CoursesNotFound
					);
				}
			} else {
				return apiResponse.serverErrorResponse(
					res,
					message.errorMsg.MongoError
				);
			}
		} catch (error) {
			return apiResponse.serverErrorResponse(res, error.message);
		}
	},
];
//==============================================================================================================

//API for reject coursewith reason ==============================================================================
exports.rejectCourseWithReason = [
	body('courseId')
		.isLength({ min: 1 })
		.trim()
		.withMessage(message.errorMsg.CourseIdRequiredError)
		.custom(value => {
			return CourseModel.findOne({ _id : value }).then(course => {
				if (!course) {
					return Promise.reject(message.errorMsg.CourseIdNotFoundError);
				}
			});
		}),
	sanitizeBody('courseId').escape(),

	async (req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				// Send only 1 error at a time as per FE requirement.
				return apiResponse.validationError(res, errors.errors[0].msg);
			} else {
				let { courseId, reason } = req.body;

				const courseData = await CourseModel.findOneAndUpdate(
					{ _id : courseId },
					{ $set : { allowPermission: 'Rejected', rejectReason : reason } },
					{ new : true }
				);

				if (!courseData) {
					return apiResponse.notFoundResponse(res, message.errorMsg.MongoError);
				} else {
					let userData = await UserModel.findOne({ _id: courseData.createdBy });

					let msg = {
						notification : {
							title : 'Course Rejected',
							body : `Your course - ${courseData.title} is been rejected due to reason -${courseData.rejectReason}`,
						},
					};
					pushNotification(userData.fcmToken, msg);

					return apiResponse.successResponseWithData(
						res,
						message.successMsg.PermissionRejected,
						{
							allowPermission : courseData.allowPermission,
							Reason : courseData.rejectReason,
						}
					);
				}
			}
		} catch (error) {
			return apiResponse.serverErrorResponse(res, error.message);
		}
	},
];
//==============================================================================================================

//API for get all reports list of review of course:=============================================================
exports.getReviewReports = [
	async (req, res) => {
		try {
			// find all the user from the database
			const reportData = await ReviewReportModel.find().populate(
				'review course'
			);
			if (reportData !== null || reportData !== undefined) {
				if (reportData.length > 0) {
					return apiResponse.successResponseWithData(
						res,
						message.successMsg.ReportsDisplayed,
						reportData
					);
				} else {
					return apiResponse.notFoundResponse(
						res,
						message.errorMsg.NoDataFound
					);
				}
			} else {
				return apiResponse.serverErrorResponse(
					res,
					message.errorMsg.MongoError
				);
			}
		} catch (error) {
			return apiResponse.serverErrorResponse(res, error.message);
		}
	},
];
//==============================================================================================================

//API for delete reproted review  by admin ====================================================================
exports.deleteReportedReviewByAdmin = [
	body('reviewId')
		.isLength({ min: 1 })
		.trim()
		.withMessage(message.errorMsg.ReviewIdRequiredError)
		.custom(value => {
			return RatingReviewModel.findOne({ _id: value }).then(review => {
				if (!review) {
					return Promise.reject(message.errorMsg.ReviewNotFoundError);
				}
			});
		}),
	sanitizeBody('reviewId').escape(),
	async (req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				// Send only 1 error at a time as per FE requirement.
				return apiResponse.validationError(res, errors.errors[0].msg);
			} else {
				let { reviewId } = req.body;
				await RatingReviewModel.findOneAndDelete({ _id: reviewId }).then(
					result => {
						return apiResponse.successResponseWithData(
							res,
							message.successMsg.ReviewDeletedSuccessful
						);
					}
				);
			}
		} catch (err) {
			return apiResponse.serverErrorResponse(res, err.message);
		}
	},
];
//==============================================================================================================
