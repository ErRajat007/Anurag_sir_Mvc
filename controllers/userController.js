const CategoryModel = require('../models/category');
const SubCategoryModel = require('../models/subCategeory');
const SectionModel = require('../models/subCategorySections');
const CourseModel = require('../models/course'); 
const UserModel = require('../models/user');
const WishModel = require('../models/wishList');
const CartModel = require('../models/cart');
const MyLearningModel = require('../models/myLearning');
const InstructorRatingReviewModel = require('../models/instructorRatingReview');
const ReviewReportModel = require('../models/reviewReport');
const ReminderModel = require('../models/reminder');
const { pushNotification } = require('../helpers/utils');
const { scheduleReminder } = require('../helpers/scheduleReminder');
const scheduleLib = require('node-schedule');
const bcrypt = require('bcrypt');
const { avgRatings } = require('../helpers/utils');
const apiResponse = require('../helpers/responses');
const message = require('../helpers/messages');
const { body, validationResult } = require('express-validator');
const { sanitizeBody } = require('express-validator');
let ObjectId = require('mongodb').ObjectID;

const ImageUpload = require('../middlewares/imageUpload');
const fs = require('fs');

//API for upload Profile Image user=============================================================================
exports.uploadProfileImage = [
	async (req, res) => {
		try {
			await ImageUpload(req, res); 
			if (req.file == null) {
				return apiResponse.validationError(
					res,
					message.errorMsg.fileRequiredError
				);
			} else {
				let userId = req.currentUser._id;
				UserModel.findOne({ _id: userId }).then(data => {
					let path = req.file.filename;
					let videoPath = req.protocol + '://' + req.headers.host + '/' + path;
					let setObject = {};
					setObject.profileImage = videoPath;

					UserModel.findByIdAndUpdate(
						{ _id: userId },
						{ $set: setObject },
						{ new: true }
					)
						.select('profileImage')
						.then(updatedData => {
							return apiResponse.successResponseWithData(
								res,
								message.successMsg.ProfileImageUploadedSuccessful,
								updatedData
							);
						});
				});
			}
		} catch (err) {
			return apiResponse.serverErrorResponse(res, err.message);
		}
	},
];
//==============================================================================================================

//API for update user profile data =============================================================================
exports.updateProfileData = [
	body('firstName')
		.isLength({ min: 1 })
		.trim()
		.withMessage(message.errorMsg.FirstNameRequiredError),
	body('lastName')
		.isLength({ min: 1 })
		.trim()
		.withMessage(message.errorMsg.LastNameRequiredError),
	body('headline')
		.isLength({ min: 1 })
		.trim()
		.withMessage(message.errorMsg.headlineRequiredError),
	body('biography')
		.isLength({ min: 1 })
		.trim()
		.withMessage(message.errorMsg.biographyRequiredError),
	body('language')
		.isLength({ min: 1 })
		.trim()
		.withMessage(message.errorMsg.RequiredError),

	sanitizeBody('firstName').escape(),
	sanitizeBody('lastName').escape(),
	sanitizeBody('headline').escape(),
	sanitizeBody('biography').escape(),
	sanitizeBody('language').escape(),
	async (req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				// Send only 1 error at a time as per FE requirement.
				return apiResponse.validationError(res, errors.errors[0].msg);
			} else {
				let userId = req.currentUser._id;
				let { firstName, lastName, headline, biography, language } = req.body;
				UserModel.findOne({ _id: userId }).then(data => {
					let setObject = {};
					setObject.fullName = req.body.firstName + ' ' + req.body.lastName;
					setObject.headline = req.body.headline;
					setObject.biography = req.body.biography;
					setObject.language = req.body.language;

					UserModel.findByIdAndUpdate(
						{ _id: userId },
						{ $set: setObject },
						{ new: true }
					)
						.select('fullName headline biography language')
						.then(updatedData => {
							return apiResponse.successResponseWithData(
								res,
								message.successMsg.profileDataUpdatedSuccessful,
								updatedData
							);
						});
				});
			}
		} catch (err) {
			return apiResponse.serverErrorResponse(res, err.message);
		}
	},
];
//==============================================================================================================

//API for add course to wish list===============================================================================
exports.addToWishList = [
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
				let userId = req.currentUser._id;
				let { courseId } = req.body;
				WishModel.findOne({ userId: userId, courseId: courseId }).then(data => {
					if (!data) {
						new WishModel({ userId: userId, courseId: courseId })
							.save()
							.then(result => {
								return apiResponse.successResponseWithData(
									res,
									message.successMsg.CourseAddedToWishListSuccessfull,
									result
								);
							});
					} else {
						return apiResponse.validationError(
							res,
							message.errorMsg.CourseAlreadyAddedInWishList
						);
					}
				});
			}
		} catch (err) {
			return apiResponse.serverErrorResponse(res, err.message);
		}
	},
];
//==============================================================================================================

//API for delete course from wish list==========================================================================
exports.removeFromWishList = [
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
				let userId = req.currentUser._id;
				let { courseId } = req.body;
				await WishModel.findOne({ userId: userId, courseId: courseId }).then(
					async data => {
						if (data) {
							await WishModel.deleteOne({
								userId: userId,
								courseId: courseId,
							}).then(result => {
								return apiResponse.successResponseWithData(
									res,
									message.successMsg.CourseDeletedFromWishListSuccessfull
								);
							});
						} else {
							return apiResponse.validationError(
								res,
								message.errorMsg.CoursesNotFound
							);
						}
					}
				);
			}
		} catch (err) {
			return apiResponse.serverErrorResponse(res, err.message);
		}
	},
];
//==============================================================================================================

//API for getting all WishList as per User:=====================================================================
exports.getWishList = [
	async (req, res) => {
		try {
			let userId = req.currentUser._id;
			const wishListData = await WishModel.find({ userId: userId }).populate(
				'courseId'
			);

			if (wishListData !== null || wishListData !== undefined) {
				if (wishListData.length > 0) {
					wishListData.filter(course => {
						let videoPath = course.courseId.videoFile.split('/');
						let imagePath = course.courseId.imageFile.split('/');
						course.courseId.videoFile =
							req.protocol +
							'://' +
							req.headers.host +
							'/' +
							videoPath[videoPath.length - 1];
						course.courseId.imageFile =
							req.protocol +
							'://' +
							req.headers.host +
							'/' +
							imagePath[imagePath.length - 1];
					});
					return apiResponse.successResponseWithData(
						res,
						message.successMsg.WishListDataDisplayed,
						wishListData
					);
				} else {
					return apiResponse.notFoundResponse(
						res,
						message.errorMsg.NoDataFoundInWishList
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

//API for add course to cart ===================================================================================
exports.addToCart = [
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
				let userId = req.currentUser._id;
				const { courseId } = req.body;
				//finding the course which contain UserID & courseID as per required from the Cart Collection in database
				const cartSearch = await CartModel.findOne({
					userId: userId,
					courseId: courseId,
					isPurchased: false,
				});
				//finding the course which is purchased Cart Collection in database
				const purchasedCourse = await CartModel.findOne({
					userId: userId,
					courseId: courseId,
					isPurchased: true,
				});

				//if course found , its already added to cart
				if (cartSearch) {
					return apiResponse.validationError(
						res,
						message.errorMsg.courseAlreadyAddedError
					);
				} else if (purchasedCourse) {
					return apiResponse.validationError(
						res,
						message.errorMsg.courseAlreadyPurchasedError
					);
				} else {
					let cartData = new CartModel({
						userId: userId,
						courseId: courseId,
					});
					cartData.save(async function (err, result) {
						if (err) {
							return apiResponse.serverErrorResponse(res, err);
						} else {
							return apiResponse.successResponseWithData(
								res,
								message.successMsg.AddedToCartSuccessful,
								result
							);
						}
					});
				}
			}
		} catch (err) {
			return apiResponse.serverErrorResponse(res, err.message);
		}
	},
];
//==============================================================================================================

//API for getting the cart list:================================================================================
exports.getCart = [
	async (req, res) => {
		try {
			let userId = req.currentUser._id;

			// find all Cart items from the database
			const cartData = await CartModel.find({
				userId: userId,
				isPurchased: false,
			}).populate({
				path: 'courseId',
				populate: { path: 'createdBy', select: 'fullName headline' },
			});
			if (cartData !== null || cartData !== undefined) {
				if (cartData.length > 0) {
					cartData.filter(course => {
						let videoPath = course.courseId.videoFile.split('/');
						let imagePath = course.courseId.imageFile.split('/');
						course.courseId.videoFile =
							req.protocol +
							'://' +
							req.headers.host +
							'/' +
							videoPath[videoPath.length - 1];
						course.courseId.imageFile =
							req.protocol +
							'://' +
							req.headers.host +
							'/' +
							imagePath[imagePath.length - 1];
					});
					return apiResponse.successResponseWithData(
						res,
						message.successMsg.CartItemsDisplayed,
						cartData
					);
				} else {
					return apiResponse.notFoundResponse(
						res,
						message.errorMsg.CartItemsNotFound
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

//API for delete cart  item ====================================================================================
exports.removeItemFromCart = [
	body('courseId')
		.isLength({ min: 1 })
		.trim()
		.withMessage(message.errorMsg.CourseIdRequiredError)
		.custom(value => {
			return CartModel.findOne({ courseId: value }).then(cart => {
				if (!cart) {
					return Promise.reject(message.errorMsg.CartItemNotFoundError);
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
				let userId = req.currentUser._id;

				await CartModel.deleteOne({ courseId: courseId, userId: userId }).then(
					result => {
						return apiResponse.successResponseWithData(
							res,
							message.successMsg.CartItemDeletedSuccessfully
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

//API for adding relation between student & instructor:=========================================================
exports.addRelation = [
	async (req, res) => {
		try {
			let userId = req.currentUser._id;

			let { courseId, instructorId } = req.body;

			new MyLearningModel({
				course: courseId,
				instructor: instructorId,
				student: userId,
			})
				.save()
				.then(categeory => {
					return apiResponse.successResponseWithData(
						res,
						message.successMsg.CategoryCreatedSuccessful,
						categeory
					);
				});
		} catch (err) {
			return apiResponse.serverErrorResponse(res, err.message);
		}
	},
];
//==============================================================================================================

//API for Adding rating of paticular instructor ================================================================
exports.addRatingToInstructor = [
	body('rating')
		.isLength({ min: 1 })
		.trim()
		.withMessage(message.errorMsg.RatingRequiredError),
	sanitizeBody('rating').escape(),
	async (req, res) => {
		try {
			let userId = req.currentUser._id;
			const { instructorId, rating } = req.body;
			const data = await MyLearningModel.findOne({
				student: userId,
				instructor: instructorId,
			});

			if (!data) {
				return apiResponse.unauthorizedResponse(
					res,
					message.errorMsg.RatingToInstructorDeniedError
				);
			} else {
				const ratingData = await InstructorRatingReviewModel.findOne({
					student: userId,
					instructor: instructorId,
				});

				if (
					ratingData &&
					(ratingData.rating != null || ratingData.rating != undefined)
				) {
					return apiResponse.unauthorizedResponse(
						res,
						message.errorMsg.AlreadyRatedError
					);
				} else if (
					ratingData &&
					(ratingData.rating == null || ratingData.rating == undefined)
				) {
					ratingData.rating = rating;
					await ratingData.save();
				} else {
					const addRate = new InstructorRatingReviewModel({
						student: userId,
						instructor: instructorId,
						rating,
					});
					await addRate.save();
				}
			}
			const resultData = await InstructorRatingReviewModel.find({
				instructor: instructorId,
			});
			let five = 0;
			let four = 0;
			let three = 0;
			let two = 0;
			let one = 0;

			for (let obj of resultData) {
				if (obj.rating === 5) {
					five++;
				} else if (obj.rating === 4) {
					four++;
				} else if (obj.rating === 3) {
					three++;
				} else if (obj.rating === 2) {
					two++;
				} else if (obj.rating === 1) {
					one++;
				}
			}
			//	var totalreview = resultData.length;

			const avgRating = await avgRatings(five, four, three, two, one);
			const updateRating = await UserModel.updateOne(
				{ _id: instructorId },
				{ $set: { averageRating: avgRating } }
			);

			return apiResponse.successResponseWithData(
				res,
				message.successMsg.RatingAddedSuccessfull
			);
		} catch (err) {
			return apiResponse.serverErrorResponse(res, err.message);
		}
	},
];
//==============================================================================================================

//API for Adding review of paticular instructor ================================================================
exports.addInstructorReview = [
	body('review')
		.isLength({ min: 1 })
		.trim()
		.withMessage(message.errorMsg.ReviewRequiredError),
	sanitizeBody('review').escape(),

	async (req, res) => {
		try {
			let userId = req.currentUser._id;
			const { instructorId, review } = req.body;
			const data = await MyLearningModel.findOne({
				student: userId,
				instructor: instructorId,
			});

			if (!data) {
				return apiResponse.unauthorizedResponse(
					res,
					message.errorMsg.RaviewToInstructorDeniedError
				);
			} else {
				const reviewData = await InstructorRatingReviewModel.findOne({
					student: userId,
					instructor: instructorId,
				});

				if (
					reviewData &&
					(reviewData.review != null || reviewData.review != undefined)
				) {
					return apiResponse.unauthorizedResponse(
						res,
						message.errorMsg.ALreadyReviewAddedError
					);
				} else if (
					reviewData &&
					(reviewData.review == null || reviewData.review == undefined)
				) {
					reviewData.review = review;
					await reviewData.save();
					const userData = await UserModel.findOne({ _id: instructorId });
					userData.totalReview = userData.totalReview + 1;
					await userData.save();
				} else {
					const addReview = new InstructorRatingReviewModel({
						instructor: instructorId,
						student: userId,
						review,
					});
					await addReview.save();
					const data = await UserModel.findOne({ _id: instructorId });
					data.totalReview = data.totalReview + 1;
					await data.save();
				}
			}

			return apiResponse.successResponseWithData(
				res,
				message.successMsg.ReviewAddedSuccessfull
			);
		} catch (err) {
			return apiResponse.serverErrorResponse(res, err.message);
		}
	},
];
//==============================================================================================================

//API for getting all Courses of particular instructor:=========================================================
exports.getOwnCoursesOfInstructor = [
	async (req, res) => {
		try {
			let userId = req.currentUser._id;
			const instructorCourses = await CourseModel.find({
				createdBy: userId,
			});
			if (instructorCourses.length <= 0) {
				return apiResponse.notFoundResponse(
					res,
					message.errorMsg.CoursesNotFoundError
				);
			} else {
				instructorCourses.filter(course => {
					let videoPath = course.videoFile.split('/');
					let imagePath = course.imageFile.split('/');
					course.videoFile =
						req.protocol +
						'://' +
						req.headers.host +
						'/' +
						videoPath[videoPath.length - 1];
					course.imageFile =
						req.protocol +
						'://' +
						req.headers.host +
						'/' +
						imagePath[imagePath.length - 1];
				});
				let totalCourse = instructorCourses.length;
				return apiResponse.successResponseWithData(
					res,
					message.successMsg.CoursesDisplayed,
					{ totalCourse: totalCourse, instructorCourses }
				);
			}
		} catch (error) {
			return apiResponse.serverErrorResponse(res, error.message);
		}
	},
];
//==============================================================================================================

//API for add course to cart ===================================================================================
exports.offSyncAddToCart = [
	async (req, res) => {
		try {
			let userId = req.currentUser._id;
			const { courseId } = req.body;

			courseId.map(async course => {
				setTimeout(function () {
					let cartData = new CartModel({
						userId: userId,
						courseId: course,
					});
					cartData.save();
					// count++
				}, 6000);
			});

			return apiResponse.successResponseWithData(
				res,
				message.successMsg.AddedToCartSuccessful
			);
		} catch (err) {
			return apiResponse.serverErrorResponse(res, err.message);
		}
	},
];
//==============================================================================================================

//API for enable or disable notifications ======================================================================
exports.enableOrDisableNotifications = [
	async (req, res) => {
		try {
			let userId = req.currentUser._id;
			let { option } = req.body;
			const userData = await UserModel.findByIdAndUpdate(
				{ _id: userId },
				{ $set: { allowNotifications: option } },
				{ new: true }
			);

			if (!userData) {
				return apiResponse.notFoundResponse(res, message.errorMsg.MongoError);
			} else {
				if (userData.allowNotifications == 'enable') {
					return apiResponse.successResponseWithData(
						res,
						message.successMsg.EnableSuccessfully,
						{ Notifications: userData.allowNotifications }
					);
				} else {
					return apiResponse.successResponseWithData(
						res,
						message.successMsg.DisableSuccessfully,
						{ Notifications: userData.allowNotifications }
					);
				}
			}
		} catch (error) {
			return apiResponse.serverErrorResponse(res, error.message);
		}
	},
];
//==============================================================================================================

//API for user want to become instructor =======================================================================
exports.becomeInstructor = [
	async (req, res) => {
		try {
			let userId = req.currentUser._id;
			let { teachingExperience, videoExperience, audiences } = req.body;
			const user = await UserModel.findOne({
				_id: userId,
				isInstructor: 'false',
			});
			if (user) {
				const userData = await UserModel.findByIdAndUpdate(
					{ _id: userId },
					{
						$set: {
							isInstructor: true,
							teachingExperience,
							videoExperience,
							audiences,
						},
					},
					{ new: true }
				);

				if (!userData) {
					return apiResponse.notFoundResponse(res, message.errorMsg.MongoError);
				} else {
					return apiResponse.successResponseWithData(
						res,
						message.successMsg.InsructorCreatedSuccessfully,
						{
							teachingExperience: userData.teachingExperience,
							videoExperience: userData.videoExperience,
							audiences: userData.audiences,
							isInstructor: userData.isInstructor,
						}
					);
				}
			} else {
				return apiResponse.notFoundResponse(
					res,
					message.errorMsg.AlreadyInstructorError
				);
			}
		} catch (error) {
			return apiResponse.serverErrorResponse(res, error.message);
		}
	},
];
//=============================================================================================================

//API for Check notification status as per UserID ==============================================================
exports.checkNotificationStatus = [
	async (req, res) => {
		try {
			let userId = req.currentUser._id;
			// find  user from the database
			const userData = await UserModel.findOne({ _id: userId }).lean();
			if (userData !== null || userData !== undefined) {
				if (userData) {
					return apiResponse.successResponseWithData(
						res,
						message.successMsg.NotificationStatusDisplayed,
						{ NotificationStatus: userData.allowNotifications }
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

//API for get all user purchased course list:===================================================================
exports.getMyLearningData = [
	async (req, res) => {
		try {
			let userId = req.currentUser._id;
			// find all the user from the database
			const Users = await MyLearningModel.find({ student: userId })
				.populate('course')
				.populate('instructor', 'fullName');
			if (Users !== null || Users !== undefined) {
				if (Users.length > 0) {
					Users.filter(courses => {
						let videoPath = courses.course.videoFile.split('/');
						let imagePath = courses.course.imageFile.split('/');
						courses.course.videoFile =
							req.protocol +
							'://' +
							req.headers.host +
							'/' +
							videoPath[videoPath.length - 1];
						courses.course.imageFile =
							req.protocol +
							'://' +
							req.headers.host +
							'/' +
							imagePath[imagePath.length - 1];
					});
					return apiResponse.successResponseWithData(
						res,
						message.successMsg.MyLearningListDisplayed,
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

//API for change Password with old password of user:=============================================================
exports.changePassword = [
	body('oldPassword')
		.isLength({ min: 1 })
		.trim()
		.withMessage(message.errorMsg.OldPasswordRequiredError),
	body('newPassword')
		.isLength({ min: 6 })
		.trim()
		.withMessage(message.errorMsg.PasswordLengthError),
	sanitizeBody('oldPassword').escape(),
	sanitizeBody('newPassword').escape(),
	async (req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				// Send only 1 error at a time as per FE requirement.
				return apiResponse.validationError(res, errors.errors[0].msg);
			} else {
				let userId = req.currentUser._id;
				const { oldPassword, newPassword } = req.body;
				const userData = await UserModel.findOne({ _id: userId });
				bcrypt.compare(oldPassword, userData.password, function (err, same) {
					if (same) {
						bcrypt.hash(newPassword, 10, async function (err, hash) {
							if (err) {
								return apiResponse.serverErrorResponse(res, err);
							} else {
								userData.password = hash;
								await userData.save();
								return apiResponse.successResponse(
									res,
									message.successMsg.PasswordChangedSuccessfull
								);
							}
						});
					} else {
						return apiResponse.notFoundResponse(
							res,
							message.errorMsg.OldPasswordWrongError
						);
					}
				});
			}
		} catch (err) {
			return apiResponse.serverErrorResponse(res, err.message);
		}
	},
];
//===============================================================================================================

//API for request permission to publish course user==============================================================
exports.requestPermissionForCoursePublish = [
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
				let userId = req.currentUser._id;
				const courseData = await CourseModel.findOneAndUpdate(
					{ _id: courseId },
					{ $set: { allowPermission: 'Pending' } },
					{ new: true }
				);

				if (!courseData) {
					return apiResponse.notFoundResponse(res, message.errorMsg.MongoError);
				} else {
					let adminData = await UserModel.find({ role: 'Admin' });
					let userData = await UserModel.findOne({ _id: userId });
					let msg = {
						notification: {
							title: 'New course added for approval',
							body: `New course - ${courseData.title} added by user - ${userData.fullName} for approval`,
						},
					};
					pushNotification(adminData[0].fcmToken, msg);

					return apiResponse.successResponseWithData(
						res,
						message.successMsg.PermissionRequestedSuccessfully,
						{ allowPermission: courseData.allowPermission }
					);
				}
			}
		} catch (error) {
			return apiResponse.serverErrorResponse(res, error.message);
		}
	},
];
//===============================================================================================================

//API for report a review =======================================================================================
exports.addReviewReport = [
	body('reviewId')
		.isLength({ min: 1 })
		.trim()
		.withMessage(message.errorMsg.ReviewIdRequiredError),
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
	sanitizeBody('reviewId').escape(),
	sanitizeBody('courseId').escape(),
	async (req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {

				// Send only 1 error at a time as per FE requirement.
				return apiResponse.validationError(res, errors.errors[0].msg);
			} else {
				let userId = req.currentUser._id;
				let { courseId, reviewId, report } = req.body;

				new ReviewReportModel({
					review: reviewId,
					user: userId,
					course: courseId,
					report: report
				})
					.save()
					.then(result => {
						return apiResponse.successResponseWithData(
							res,
							message.successMsg.ReviewReportedSuccessfull,
							result
						);
					});
			}
		} catch (err) {
			return apiResponse.serverErrorResponse(res, err.message);
		}
	},
];
//===============================================================================================================

//API for add reminder date to read course ======================================================================
exports.addReminder = [
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
				let userId = req.currentUser._id;
				let notificationData = await UserModel.findOne({ _id : userId });
				 
				if (notificationData.allowNotifications != "enable") {
					return apiResponse.unauthorizedResponse(
						res,
						message.errorMsg.NotificationDisabledError
					);
				} else {
					let { courseId, reminderDate, reminderTime } = req.body;
					
					await ReminderModel.findOne({ user : userId, course : courseId }).then(
						async data => {
							if (!data) {
								await new ReminderModel({
									user : userId,
									course : courseId,
									reminderDate : reminderDate,
									reminderTime : reminderTime
								})
									.save()
									.then(async reminderData => {
										
									const userData = await UserModel.findOne({ _id : userId });
									const courseData = await CourseModel.findOne({ _id : courseId });

										let dateData = reminderData.reminderDate.split('-');										
										let year = parseInt(dateData[0]);
										let month = parseInt(dateData[1] - 1);
										let date = parseInt(dateData[2]);

										let time = reminderData.reminderTime.split(':');
										let hours = parseInt(time[0]);
										let mins = parseInt(time[1]);

										let msg = {
											notification : {
												title : 'Reminder to read course',
												body  : `This is reading reminder for course - ${courseData.title} `
											}
										};

										scheduleReminder(mins,hours,date,month,year,reminderData._id,userData.fcmToken,msg);
										
										return apiResponse.successResponseWithData(
											res,
											message.successMsg.CourseReminderAddedSuccessful,
											reminderData
										);
									});

							} else {
								let reminderData = await ReminderModel.findOneAndUpdate(
									{ user : userId, course : courseId },
									{
										$set : {
											reminderDate : reminderDate,
											reminderTime : reminderTime,
										}
									},
									{ new : true }
								);

								const userData = await UserModel.findOne({ _id : userId });
								const courseData = await CourseModel.findOne({ _id : courseId });
									
								let dateData = reminderData.reminderDate.split('-');
								let year = parseInt(dateData[0]);
								let month = parseInt(dateData[1] - 1);
								let date = parseInt(dateData[2]);
								
								let time = reminderData.reminderTime.split(':');	
								let hours = parseInt(time[0]);
								let mins = parseInt(time[1]);

								let msg = {
									notification : {
										title : 'Reminder to read course',
										body  : `This is reading reminder for course - ${courseData.title} `
									}
								};

								scheduleReminder(mins,hours,date,month,year,reminderData._id,userData.fcmToken,msg);

								return apiResponse.successResponseWithData(
									res,
									message.successMsg.CourseReminderAddedSuccessful,
									reminderData
								);
							}
						}
					);
				}
			}
		} catch (err) {
			return apiResponse.serverErrorResponse(res, err.message);
		}
	},
];
//===============================================================================================================

//API for getting all reminder of a course as per User:==========================================================
exports.getReminderAsPerCourse = [
	async (req, res) => {
		try {
			let userId = req.currentUser._id;
			let { courseId } = req.query;
			const list = scheduleLib.scheduledJobs;
			const keys = Object.keys(list);

			const reminderData = await ReminderModel.find({
				user: userId,
				course: courseId,
			}).populate('course', 'title');

			if (reminderData !== null || reminderData !== undefined) {

				if (reminderData.length > 0) {
					let reminder = reminderData.filter(item =>
						keys.includes(item._id.toString())
					);
						
					return apiResponse.successResponseWithData(
						res,
						message.successMsg.ReminderDataDisplayed,
						reminder
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

//API for getting all reminder as per User:=====================================================================
exports.getReminderAsPerUser = [
	async (req, res) => {
		try {
			let userId = req.currentUser._id;

			const list = scheduleLib.scheduledJobs;
			const keys = Object.keys(list);

			let reminderData = await ReminderModel.find({ user : userId })
			.populate('course', 'title');

			if (reminderData !== null || reminderData !== undefined) {
				if (reminderData.length > 0) {
					let reminder = reminderData.filter(item =>
						keys.includes(item._id.toString())
					);

					return apiResponse.successResponseWithData(
						res,
						message.successMsg.ReminderDataDisplayed,
						reminder
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

//API for deleting reminder of user=============================================================================
exports.deleteReminder = [
	body('reminderId')
		.isLength({ min: 1 })
		.trim()
		.withMessage(message.errorMsg.ReminderIdRequiredError)
		.custom(value => {
			return ReminderModel.findOne({ _id: value }).then(reminder => {
				if (!reminder) {
					return Promise.reject(message.errorMsg.ReminderIdNotFoundError);
				}
			});
		}),
	sanitizeBody('reminderId').escape(),
	async (req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				// Send only 1 error at a time as per FE requirement.
				return apiResponse.validationError(res, errors.errors[0].msg);
			} else {
				let { reminderId } = req.body;
				const list = scheduleLib.scheduledJobs;
				const currentJob = list[reminderId]

				if (!currentJob){
					return apiResponse.notFoundResponse(
						res,
						message.errorMsg.NoDataFound
					);
				}
				await ReminderModel.deleteOne({ _id : reminderId }).then(result => {
					currentJob.cancel()
					return apiResponse.successResponseWithData(
						res,
						message.successMsg.ReminderDeletedSuccessful
					);
				});
			}
		} catch (err) {
			return apiResponse.serverErrorResponse(res, err.message);
		}
	},
];
//=================================================================================================================
