const CategoryModel = require('../models/category');
const SubCategoryModel = require('../models/subCategeory');
const SectionModel = require('../models/subCategorySections');
const CourseModel = require('../models/course');
const ChapterModel = require('../models/chapter'); 
const LectureModel = require('../models/lecture');
const CartModel = require('../models/cart');
const RatingReviewModel = require('../models/rating&review');
const { avgRatings } = require('../helpers/utils');
const apiResponse = require('../helpers/responses');
const message = require('../helpers/messages');
const { body, validationResult } = require('express-validator');
const { sanitizeBody } = require('express-validator');
let ObjectId = require('mongodb').ObjectID;
const videoUpload = require('../middlewares/videoUpload');
const ImageUpload = require('../middlewares/imageUpload');
const UploadTwoFiles = require('../middlewares/uploadTwoFiles');
const fs = require('fs');

//API for Adding course, user & admin both can add course ======================================================
exports.addCourse = [
	async (req, res, next) => {
		try {
			let userId = req.currentUser._id;
			await UploadTwoFiles(req, res);
			if (req.files.videoFile == null) {
				return apiResponse.validationError(
					res,
					message.errorMsg.VideoFileRequiredError
				);
			} else if (req.files.imageFile == null) {
				return apiResponse.validationError(
					res,
					message.errorMsg.ImageFileRequiredError
				);
			} else {
				let imagePath =	req.protocol +	'://' +	req.headers.host +	'/' +	req.files.imageFile[0].filename;
				let videoPath =	req.protocol +	'://' +	req.headers.host +	'/' +	req.files.videoFile[0].filename;

				const {	title,categoryId,subCategoryId,	sectionId,description,price } = req.body;

				const course = new CourseModel({
					title,
					categoryId,
					subCategoryId,
					sectionId,
					description,
					imageFile: imagePath,
					videoFile: videoPath,
					price,
					createdBy: userId,
				});
				await course.save().then(result => {
					return apiResponse.successResponseWithData(
						res,
						message.successMsg.CourseCreatedSuccessful,
						result
					);
				});
			}
		} catch (err) {
			return apiResponse.serverErrorResponse(res, err.message);
		}
	},
];
//==============================================================================================================

//API for delete course, user & admin both can delete course ===================================================
exports.deleteCourse = [
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
				const deletedCourse = await CourseModel.findOneAndDelete({
					_id: courseId,
				});
				let videoSplit = deletedCourse.videoFile.split('/');
				let imageSplit = deletedCourse.imageFile.split('/');

				let imagePath =
					'./public/uploadImages/' + imageSplit[imageSplit.length - 1];
				let videoPath =
					'./public/uploadVideos/' + videoSplit[videoSplit.length - 1];

				fs.unlink(videoPath, error => {
					if (!error) {
						console.log('video deleted');
					} else {
						console.log('Error deleting the file', error);
					}
				});

				fs.unlink(imagePath, error => {
					if (!error) {
						console.log('old image deleted');
					} else {
						console.log('Error deleting the file', error);
					}
				});

				return apiResponse.successResponseWithData(
					res,
					message.successMsg.CourseDeletedSuccessfull
				);
			}
		} catch (err) {
			return apiResponse.serverErrorResponse(res, err.message);
		}
	},
];
//==============================================================================================================

//API for editing course data ==================================================================================
exports.editCourse = [
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
				let setObject = {};
				if (req.body.title != null && req.body.title != undefined) {
					setObject.title = req.body.title;
				}
				if (req.body.categoryId != null && req.body.categoryId != undefined) {
					setObject.categoryId = req.body.categoryId;
				}
				if (
					req.body.subCategoryId != null &&
					req.body.subCategoryId != undefined
				) {
					setObject.subCategoryId = req.body.subCategoryId;
				}
				if (req.body.sectionId != null && req.body.sectionId != undefined) {
					setObject.sectionId = req.body.sectionId;
				}
				if (req.body.description != null && req.body.description != undefined) {
					setObject.description = req.body.description;
				}
				if (req.body.price != null && req.body.price != undefined) {
					setObject.price = req.body.price;
				}
				const {
					courseId,
					title,
					categoryId,
					subCategoryId,
					sectionId,
					description,
					price,
				} = req.body;

				await CourseModel.findByIdAndUpdate(
					{ _id: courseId },
					{ $set: setObject },
					{ new: true }
				).then(updatedData => {
					return apiResponse.successResponseWithData(
						res,
						message.successMsg.CourseUpdatedSuccessful,
						updatedData
					);
				});
			}
		} catch (err) {
			return apiResponse.serverErrorResponse(res, err.message);
		}
	},
];
//==============================================================================================================

//API for update course image & video ==========================================================================
exports.updateCourseImageAndVideo = [
	async (req, res) => {
		try {
			await UploadTwoFiles(req, res);
			if (req.files.videoFile == null) {
				return apiResponse.validationError(
					res,
					message.errorMsg.VideoFileRequiredError
				);
			} else if (req.files.imageFile == null) {
				return apiResponse.validationError(
					res,
					message.errorMsg.ImageFileRequiredError
				);
			} else {
				let { courseId } = req.body;

				CourseModel.findOne({ _id: courseId }).then(data => {
					let videoSplit = data.videoFile.split('/');
					let imageSplit = data.imageFile.split('/');

					let videoPath =
						'./public/uploadVideos/' + videoSplit[videoSplit.length - 1];
					let imagePath =
						'./public/uploadImages/' + imageSplit[imageSplit.length - 1];

					fs.unlink(videoPath, error => {
						if (!error) {
							console.log(' old video deleted');
						} else {
							console.log('Error deleting the file', error);
						}
					});

					fs.unlink(imagePath, error => {
						if (!error) {
							console.log(' old image deleted');
						} else {
							console.log('Error deleting the file', error);
						}
					});
				});

				let imagePath =
					req.protocol +
					'://' +
					req.headers.host +
					'/' +
					req.files.imageFile[0].filename;
				let videoPath =
					req.protocol +
					'://' +
					req.headers.host +
					'/' +
					req.files.videoFile[0].filename;

				let setObject = {};
				setObject.videoFile = videoPath;
				setObject.imageFile = imagePath;

				CourseModel.findByIdAndUpdate(
					{ _id: courseId },
					{ $set: setObject },
					{ new: true }
				).then(updatedData => {
					return apiResponse.successResponseWithData(
						res,
						message.successMsg.CourseUpdatedSuccessful,
						{
							videoFile: updatedData.videoFile,
							imageFile: updatedData.imageFile,
						}
					);
				});
			}
		} catch (err) {
			return apiResponse.serverErrorResponse(res, err.message);
		}
	},
];
//==============================================================================================================

//API for Adding chapter in  course ============================================================================
exports.addChapter = [
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
	body('chapterTitle')
		.isLength({ min: 1 })
		.trim()
		.withMessage(message.errorMsg.TitleRequiredError),
	sanitizeBody('courseId').escape(),
	sanitizeBody('chapterTitle').escape(),
	async (req, res) => {
		try {
			const errors = validationResult(req);
			const { courseId, chapterTitle } = req.body;
			let course = await CourseModel.findOne({ _id: courseId });
			if (!errors.isEmpty()) {
				// Send only 1 error at a time as per FE requirement.
				return apiResponse.validationError(res, errors.errors[0].msg);
			} else {
				const chapter = new ChapterModel({
					chapterTitle,
					courseId,
				});
				await chapter.save().then(async result => {
					let course = await CourseModel.findOne({ _id: courseId });
					course.chapters.push(result._id);
					course.save();
					return apiResponse.successResponseWithData(
						res,
						message.successMsg.ChapterCreatedSuccessfull,
						result
					);
				});
			}
		} catch (err) {
			return apiResponse.serverErrorResponse(res, err.message);
		}
	},
];
//==============================================================================================================

//API for Adding lecture in  chapter ===========================================================================
exports.addlecture = [
	async (req, res) => {
		try {
			await videoUpload(req, res);
			if (req.file == null) {
				return apiResponse.validationError(
					res,
					message.errorMsg.fileRequiredError
				);
			}

			let path = req.file.filename;
			let videoPath = req.protocol + '://' + req.headers.host + '/' + path;
			const { chapterId, courseId, lectureTitle, description } = req.body;

			let chapterData = await ChapterModel.findOne({ _id: chapterId });

			if (!chapterData) {
				let videoPath = './public/uploadVideos/' + path;
				fs.unlink(videoPath, error => {
					if (!error) {
						console.log(' old video deleted');
					} else {
						console.log('Error deleting the file', error);
					}
				});

				return apiResponse.notFoundResponse(
					res,
					message.errorMsg.ChapterIdNotFoundError
				);
			}

			const lecture = new LectureModel({
				chapterId,
				courseId,
				lectureTitle,
				description,
				videoPath: videoPath,
			});
			await lecture.save().then(async result => {
				//pushing the lecture id in course data
				let course = await CourseModel.findOne({ _id: courseId });
				course.lectures.push(result._id);
				await course.save();
				//pushing the lecture id in chapter data
				let chapter = await ChapterModel.findOne({ _id: chapterId });
				chapter.lectures.push(result._id);
				await chapter.save();

				return apiResponse.successResponseWithData(
					res,
					message.successMsg.lectureCreatedSuccessfull,
					result
				);
			});
		} catch (err) {
			return apiResponse.serverErrorResponse(res, err.message);
		}
	},
];
//==============================================================================================================

//API for Adding rating of course ==============================================================================
exports.addRating = [
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
	body('rating')
		.isLength({ min: 1 })
		.trim()
		.withMessage(message.errorMsg.RatingRequiredError),
	sanitizeBody('courseId').escape(),
	sanitizeBody('rating').escape(),

	async (req, res) => {
		try {
			let userId = req.currentUser._id;
			const { courseId, rating } = req.body;
			const purchasedCourse = await CartModel.findOne({
				userId: userId,
				courseId: courseId,
				isPurchased: true,
			});
			if (!purchasedCourse) {
				return apiResponse.unauthorizedResponse(
					res,
					message.errorMsg.PurchaseRequiredError
				);
			} else {
				const ratingData = await RatingReviewModel.findOne({
					userId: userId,
					courseId: courseId,
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
					const addRate = new RatingReviewModel({
						courseId,
						userId,
						rating,
					});
					await addRate.save();
				}
			}
			let resultData = await RatingReviewModel.find({ courseId: courseId });
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
			let updateRating = await CourseModel.updateOne(
				{ _id: courseId },
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

//API for Adding review of course ==============================================================================
exports.addReview = [
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
	body('review')
		.isLength({ min: 1 })
		.trim()
		.withMessage(message.errorMsg.ReviewRequiredError),
	sanitizeBody('courseId').escape(),
	sanitizeBody('review').escape(),

	async (req, res) => {
		try {
			let userId = req.currentUser._id;
			const { courseId, review } = req.body;
			const purchasedCourse = await CartModel.findOne({
				userId: userId,
				courseId: courseId,
				isPurchased: true,
			});
			if (!purchasedCourse) {
				return apiResponse.unauthorizedResponse(
					res,
					message.errorMsg.PurchaseRequiredError
				);
			} else {
				const reviewData = await RatingReviewModel.findOne({
					userId: userId,
					courseId: courseId,
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
					const course = await CourseModel.findOne({ _id: courseId });
					course.totalReview = course.totalReview + 1;
					await course.save();
				} else {
					const addReview = new RatingReviewModel({
						courseId,
						userId,
						review,
					});
					await addReview.save();
					const course = await CourseModel.findOne({ _id: courseId });
					course.totalReview = course.totalReview + 1;
					await course.save();
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

//API for ading rating & review together =======================================================================
exports.addRatingReview = [
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
	body('rating')
		.isLength({ min: 1 })
		.trim()
		.withMessage(message.errorMsg.RatingRequiredError),
	sanitizeBody('courseId').escape(),
	sanitizeBody('rating').escape(),

	async (req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				// Send only 1 error at a time as per FE requirement.
				return apiResponse.validationError(res, errors.errors[0].msg);
			} else {
				let userId = req.currentUser._id;

				const { courseId, rating } = req.body;
				const obj = { userId: userId, ...req.body };

				const purchasedCourse = await CartModel.findOne({
					userId: userId,
					courseId: courseId,
					isPurchased: true,
				});
				if (purchasedCourse) {
					return apiResponse.unauthorizedResponse(
						res,
						message.errorMsg.PurchaseRequiredError
					);
				} else {
					const ratingData = await RatingReviewModel.findOne({
						userId: userId,
						courseId: courseId,
					});

					if (ratingData) {
						let r1 = await RatingReviewModel.updateOne(
							{ userId: userId, courseId: courseId },
							{ $set: obj },
							{ new: true }
						);
					} else {
						const addRate = new RatingReviewModel(obj);
						await addRate.save();
					}
				}
				let resultData = await RatingReviewModel.find({ courseId: courseId });
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
				let updateRating = await CourseModel.updateOne(
					{ _id: courseId },
					{ $set: { averageRating: avgRating } }
				);

				return apiResponse.successResponseWithData(
					res,
					message.successMsg.RatingAddedSuccessfull
				);
			}
		} catch (err) {
			return apiResponse.serverErrorResponse(res, err.message);
		}
	},
];
//==============================================================================================================

//API for delete chapter  ======================================================================================
exports.deleteChapter = [
	body('chapterId')
		.isLength({ min: 1 })
		.trim()
		.withMessage(message.errorMsg.ChapterIdRequiredError)
		.custom(value => {
			return ChapterModel.findOne({ _id: value }).then(course => {
				if (!course) {
					return Promise.reject(message.errorMsg.chapterIdNotFoundError);
				}
			});
		}),
	sanitizeBody('chapterId').escape(),
	async (req, res) => {
		try {
			const { chapterId } = req.body;

			const deletedChapter = await ChapterModel.findOneAndDelete({
				_id: chapterId,
			});

			deletedChapter.lectures.map(async lectureId => {
				const deletedLecture = await LectureModel.findOneAndDelete({
					_id: lectureId,
				});
				let videoSplit = deletedLecture.videoPath.split('/');

				let videoPath =
					'./public/uploadVideos/' + videoSplit[videoSplit.length - 1];

				fs.unlink(videoPath, error => {
					if (!error) {
						console.log('video deleted');
					} else {
						console.log('Error deleting the file', error);
					}
				});
			});

			return apiResponse.successResponseWithData(
				res,
				message.successMsg.ChapterDeletedSuccessfull
			);
		} catch (err) {
			return apiResponse.serverErrorResponse(res, err.message);
		}
	},
];
//==============================================================================================================

//API for delete lecture  ======================================================================================
exports.deleteLecture = [
	body('lectureId')
		.isLength({ min: 1 })
		.trim()
		.withMessage(message.errorMsg.LectureIdRequiredError)
		.custom(value => {
			return ChapterModel.findOne({ _id: value }).then(course => {
				if (!course) {
					return Promise.reject(message.errorMsg.LectureIdNotFoundError);
				}
			});
		}),

	sanitizeBody('lectureId').escape(),

	async (req, res) => {
		try {
			const { lectureId } = req.body;
			const deletedLecture = await LectureModel.findOneAndDelete({
				_id: lectureId,
			});
			let videoSplit = deletedLecture.videoPath.split('/');

			let videoPath =
				'./public/uploadVideos/' + videoSplit[videoSplit.length - 1];
			fs.unlink(videoPath, error => {
				if (!error) {
					console.log('video deleted');
				} else {
					console.log('Error deleting the file', error);
				}
			});

			return apiResponse.successResponseWithData(
				res,
				message.successMsg.LectureDeletedSuccessfull
			);
		} catch (err) {
			return apiResponse.serverErrorResponse(res, err.message);
		}
	},
];
//==============================================================================================================

//API for delete rating review =================================================================================
exports.deleteRatingReview = [
	body('ratingId')
		.isLength({ min: 1 })
		.trim()
		.withMessage(message.errorMsg.RatingIdRequiredError)
		.custom(value => {
			return RatingReviewModel.findOne({ _id: value }).then(course => {
				if (!course) {
					return Promise.reject(message.errorMsg.RatingIdNotFoundError);
				}
			});
		}),

	sanitizeBody('ratingId').escape(),

	async (req, res) => {
		try {
			let userId = req.currentUser._id;
			const { ratingId } = req.body;
			const RatingReviewData = await RatingReviewModel.findOneAndDelete({
				_id: ratingId,
				userId: userId,
			});
			if (!RatingReviewData) {
				return apiResponse.unauthorizedResponse(
					res,
					message.errorMsg.RatingReviewDeletionError
				);
			} else {
				return apiResponse.successResponseWithData(
					res,
					message.successMsg.RatingReviewDeletionSuccessfull
				);
			}
		} catch (err) {
			return apiResponse.serverErrorResponse(res, err.message);
		}
	},
];
//==============================================================================================================

//API for search Review ========================================================================================
exports.searchReview = [
	async (req, res) => {
		try {
			const { courseId, searchParam } = req.query;
			const RatingReviewData = await RatingReviewModel.find({
				courseId: courseId,
				review: { $regex: searchParam, $options: 'i' },
			});
			if (RatingReviewData.length <= 0) {
				return apiResponse.notFoundResponse(
					res,
					message.errorMsg.NoResultFound
				);
			} else {
				return apiResponse.successResponseWithData(
					res,
					message.successMsg.ReviewRatingDisplayed,
					RatingReviewData
				);
			}
		} catch (err) {
			return apiResponse.serverErrorResponse(res, err.message);
		}
	},
];
//==============================================================================================================

//API for search rating ========================================================================================
exports.searchRating = [
	async (req, res) => {
		try {
			const { courseId, rating } = req.query;
			const RatingReviewData = await RatingReviewModel.find({
				courseId: courseId,
				rating: rating,
			});
			if (RatingReviewData.length <= 0) {
				return apiResponse.notFoundResponse(
					res,
					message.errorMsg.NoResultFound
				);
			} else {
				return apiResponse.successResponseWithData(
					res,
					message.successMsg.ReviewRatingDisplayed,
					RatingReviewData
				);
			}
		} catch (err) {
			return apiResponse.serverErrorResponse(res, err.message);
		}
	},
];
//==============================================================================================================
