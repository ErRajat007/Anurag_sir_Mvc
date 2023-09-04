const CategoryModel = require('../models/category');
const SubCategoryModel = require('../models/subCategeory');
const CourseReviewRatingModel = require('../models/rating&review');
const SectionModel = require('../models/subCategorySections');
const CourseModel = require('../models/course');
const UserModel = require('../models/user');
const WishModel = require('../models/wishList');
const ContactModel = require('../models/contactUs');
const CartModel = require('../models/cart');
const MyLearningModel = require('../models/myLearning');
const AboutUsModel = require('../models/aboutUs');
const CompanyDetailModel = require('../models/companyDetail');
const FaqModel = require('../models/frequentlyAskedQuestion');
const TermsOfUseModel = require('../models/termsOfUse');
const apiResponse = require('../helpers/responses');
const message = require('../helpers/messages');
const { body, validationResult } = require('express-validator');
const { sanitizeBody } = require('express-validator');
let ObjectId = require('mongodb').ObjectID;
const course = require('../models/course');
const PrivacyPolicyModel = require('../models/privacyPolicy');

//API for getting all categories:===============================================================================
exports.getCategories = [
	async (req, res) => {
		try {
			// find all the category from the database
			const Categories = await CategoryModel.find().lean();
			if (Categories !== null || Categories !== undefined) {
				if (Categories.length > 0) {
					return apiResponse.successResponseWithData(
						res,
						message.successMsg.CategoriesDisplayed,
						Categories
					);
				} else {
					return apiResponse.notFoundResponse(
						res,
						message.errorMsg.CategoriesNotFound
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

//API for getting all categories with subCategories:============================================================
exports.getCategoriesWithSubCategories = [
	async (req, res) => {
		try {
			// find all the category from the database
			const Categories = await CategoryModel.find().lean();

			if (Categories !== null || Categories !== undefined) {
				if (Categories.length > 0) {
					//for every category find the sub-category of it from the database & dispaly it
					for (let i = 0; i < Categories.length; i += 1) {
						let subCategory = await SubCategoryModel.find({
							categoryId: Categories[i]._id,
						});
						Categories[i].subCategory = subCategory;
					}

					return apiResponse.successResponseWithData(
						res,
						message.successMsg.CategoriesDisplayed,
						Categories
					);
				} else {
					return apiResponse.notFoundResponse(
						res,
						message.errorMsg.CategoriesNotFound
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

//API for getting all SubCategories By CategoryId:==============================================================
exports.getSubCategoriesByCategoryId = [
	async (req, res) => {
		try {
			let { categoryId } = req.query;
			const categoryData = await CategoryModel.find({ _id: categoryId });
			if (categoryData.length <= 0) {
				return apiResponse.notFoundResponse(
					res,
					message.errorMsg.CategoryIdNotFoundError
				);
			} else {
				//finding the subcategory by categoryID
				const subCategoryData = await SubCategoryModel.find({
					categoryId: categoryId,
				});
				if (subCategoryData !== null || subCategoryData !== undefined) {
					if (subCategoryData.length > 0) {
						return apiResponse.successResponseWithData(
							res,
							message.successMsg.subCategoriesDisplayed,
							subCategoryData
						);
					} else {
						return apiResponse.notFoundResponse(
							res,
							message.errorMsg.subCategoriesNotFound
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

//API for getting all sections as per SubCategoryId:============================================================
exports.getSectionsBySubCategoryId = [
	async (req, res) => {
		try {
			let { subCategoryId } = req.query;
			const subCategory = await SubCategoryModel.find({ _id: subCategoryId });
			if (subCategory.length <= 0) {
				return apiResponse.notFoundResponse(
					res,
					message.errorMsg.subCategoryIdNotFoundError
				);
			} else {
				//finding the subcategory by categoryID
				const sectionData = await SectionModel.find({
					subCategoryId: subCategoryId,
				});
				if (sectionData !== null || sectionData !== undefined) {
					if (sectionData.length > 0) {
						return apiResponse.successResponseWithData(
							res,
							message.successMsg.sectionsDisplayed,
							sectionData
						);
					} else {
						return apiResponse.notFoundResponse(
							res,
							message.errorMsg.sectionsNotFound
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

//API for getting all Course:===================================================================================
exports.getCourses = [
	async (req, res) => {
		try {
			// find all the category from the database
			const Courses = await CourseModel.find({ allowPermission: 'Approved' })
				.populate('categoryId', 'categoryName')
				.populate('subCategoryId', 'subCategoryName')
				.populate('sectionId', 'sectionName');
			if (Courses !== null || Courses !== undefined) {
				if (Courses.length > 0) {
					Courses.filter(course => {
						let videoPath = course.videoFile.split('/');
						let imagePath = course.imageFile.split('/');
						course.videoFile =	req.protocol +	'://' +	req.headers.host +	'/' + videoPath[videoPath.length - 1];
						course.imageFile =	req.protocol +	'://' +	req.headers.host +	'/' + imagePath[imagePath.length - 1];
					});
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

//API for getting all Courses By CategoryId:====================================================================
exports.getCoursesByCategoryId = [
	async (req, res) => {
		try {
			let { categoryId } = req.query;
			const categoryData = await CategoryModel.find({ _id: categoryId });
			if (categoryData.length <= 0) {
				return apiResponse.notFoundResponse(
					res,
					message.errorMsg.CategoryIdNotFoundError
				);
			} else {
				//finding the courses by categoryID
				const courseData = await CourseModel.find({
					categoryId: categoryId,
					allowPermission: 'Approved',
				});
				if (courseData !== null || courseData !== undefined) {
					if (courseData.length > 0) {
						courseData.filter(course => {
							let videoPath = course.videoFile.split('/');
							let imagePath = course.imageFile.split('/');
							course.videoFile = req.protocol +'://' + req.headers.host +	'/' + videoPath[videoPath.length - 1];
							course.imageFile = req.protocol +'://' + req.headers.host +	'/' + imagePath[imagePath.length - 1];
						});
						return apiResponse.successResponseWithData(
							res,
							message.successMsg.CoursesDisplayed,
							courseData
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
			}
		} catch (error) {
			return apiResponse.serverErrorResponse(res, error.message);
		}
	},
];
//==============================================================================================================

//API for getting all Courses By subCategoryId:=================================================================
exports.getCoursesBysubCategoryId = [
	async (req, res) => {
		try {
			let { subCategoryId } = req.query;
			const subCategoryData = await SubCategoryModel.find({
				_id: subCategoryId,
			});
			if (subCategoryData.length <= 0) {
				return apiResponse.notFoundResponse(
					res,
					message.errorMsg.subCategoryIdNotFoundError
				);
			} else {
				//finding the courses by  subCategoryId
				const courseData = await CourseModel.find({
					subCategoryId: subCategoryId,
					allowPermission: 'Approved',
				});
				if (courseData !== null || courseData !== undefined) {
					if (courseData.length > 0) {
						courseData.filter(course => {
							let videoPath = course.videoFile.split('/');
							let imagePath = course.imageFile.split('/');
							course.videoFile = req.protocol + '://' + req.headers.host + '/' + videoPath[videoPath.length - 1];
							course.imageFile = req.protocol + '://' + req.headers.host + '/' + imagePath[imagePath.length - 1];
						});
						return apiResponse.successResponseWithData(
							res,
							message.successMsg.CoursesDisplayed,
							courseData
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
			}
		} catch (error) {
			return apiResponse.serverErrorResponse(res, error.message);
		}
	},
];
//==============================================================================================================

//API for getting all Courses By sectionId:=====================================================================
exports.getCoursesBysectionId = [
	async (req, res) => {
		try {
			let { sectionId } = req.query;
			const sectionData = await SectionModel.find({ _id: sectionId });
			if (sectionData.length <= 0) {
				return apiResponse.notFoundResponse(
					res,
					message.errorMsg.sectionIdNotFoundError
				);
			} else {
				//finding the courses by  subCategoryId
				const courseData = await CourseModel.find({
					sectionId: sectionId,
					allowPermission: 'Approved',
				});
				if (courseData !== null || courseData !== undefined) {
					if (courseData.length > 0) {
						courseData.filter(course => {
							let videoPath = course.videoFile.split('/');
							let imagePath = course.imageFile.split('/');
							course.videoFile = req.protocol + '://' + req.headers.host + '/' + videoPath[videoPath.length - 1];
							course.imageFile = req.protocol + '://' + req.headers.host + '/' + imagePath[imagePath.length - 1];
						});
						return apiResponse.successResponseWithData(
							res,
							message.successMsg.CoursesDisplayed,
							courseData
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
			}
		} catch (error) {
			return apiResponse.serverErrorResponse(res, error.message);
		}
	},
];
//==============================================================================================================

//API for getting limited categories with courses:==============================================================
exports.getLimitedCategoriesWithCourse = [
	async (req, res) => {
		try {
			// find all the category from the database
			const Categories = await CategoryModel.find()
				.select('categoryName')
				.lean()
				.limit(10);

			if (Categories !== null || Categories !== undefined) {
				if (Categories.length > 0) {
					//for every category find the sub-category of it from the database & dispaly it
					for (let i = 0; i < Categories.length; i += 1) {
						let courses = await CourseModel.find({
							categoryId: Categories[i]._id,
							allowPermission: 'Approved',
						}).limit(10);
						courses.filter( course => {
							let videoPath = course.videoFile.split('/')
							let imagePath = course.imageFile.split("/")
							course.videoFile = req.protocol + '://' + req.headers.host + '/' + videoPath[videoPath.length - 1]
							course.imageFile = req.protocol + '://' + req.headers.host + '/' + imagePath[imagePath.length - 1]
							})
						Categories[i].courseData = courses;
					}

					return apiResponse.successResponseWithData(
						res,
						message.successMsg.CategoriesDisplayed,
						Categories
					);
				} else {
					return apiResponse.notFoundResponse(
						res,
						message.errorMsg.CategoriesNotFound
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

//API for getting all sections as per CategoryId:===============================================================
exports.getSectionsByCategoryId = [
	async (req, res) => {
		try {
			let { categoryId } = req.query;
			const Category = await CategoryModel.find({ _id: categoryId });
			if (Category.length <= 0) {
				return apiResponse.notFoundResponse(
					res,
					message.errorMsg.CategoryIdNotFoundError
				);
			} else {
				//finding the category by categoryID
				const sectionData = await SectionModel.find({
					categoryId: categoryId,
				});
				if (sectionData !== null || sectionData !== undefined) {
					if (sectionData.length > 0) {
						return apiResponse.successResponseWithData(
							res,
							message.successMsg.sectionsDisplayed,
							sectionData
						);
					} else {
						return apiResponse.notFoundResponse(
							res,
							message.errorMsg.sectionsNotFound
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

//API for searching as per title , description and instructor name :============================================
exports.getSearchData = [
	async (req, res) => {
		try {
			let { search } = req.query;
			// find all the category from the database

			await CourseModel.find({
				$or: [
					{ title: { $regex: search, $options: 'i' } },
					{ description: { $regex: search, $options: 'i' } },
				],
				allowPermission: 'Approved',
			})
				.select(
					'title categoryId subCategoryId sectionId description imageFile videoFile createdBy'
				)
				.then(result => {
					if (result.length > 0) {
						result.filter( course => {
							let videoPath = course.videoFile.split('/')
							let imagePath = course.imageFile.split("/")
							course.videoFile = req.protocol + '://' + req.headers.host + '/' + videoPath[videoPath.length - 1]
							course.imageFile = req.protocol + '://' + req.headers.host + '/' + imagePath[imagePath.length - 1]
							})
						
						return apiResponse.successResponseWithData(
							res,
							message.successMsg.CoursesDisplayed,
							{ Course: result }
						);
					} else {
						UserModel.find({
							fullName: { $regex: search, $options: 'i' },
							isInstructor: true,
						})
							.select('fullName email')
							.then(result => {
								if (result.length > 0) {
									return apiResponse.successResponseWithData(
										res,
										message.successMsg.UserDataDisplayed,
										{ Users: result }
									);
								} else {
									return apiResponse.notFoundResponse(
										res,
										message.errorMsg.SearchNotFound
									);
								}
							});
					}
				});
		} catch (error) {
			return apiResponse.serverErrorResponse(res, error.message);
		}
	},
];
//==============================================================================================================

//API for getting all Courses By instructorId:==================================================================
exports.getCoursesByInstructorId = [
	async (req, res) => {
		try {
			let { instructorId } = req.query;
			const instructorCourses = await CourseModel.find({
				createdBy: instructorId,
			});
			if (instructorCourses.length <= 0) {
				return apiResponse.notFoundResponse(
					res,
					message.errorMsg.CoursesNotFoundError
				);
			} else {
				instructorCourses.filter( course => {
					let videoPath = course.videoFile.split('/')
					let imagePath = course.imageFile.split("/")
					course.videoFile = req.protocol + '://' + req.headers.host + '/' + videoPath[videoPath.length - 1]
					course.imageFile = req.protocol + '://' + req.headers.host + '/' + imagePath[imagePath.length - 1]
					})
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

//API for getting the course detail ============================================================================
exports.getCourseDetail = [
	async (req, res) => {
		try {
			let obj = {
				isPurchased: false,
				addedToCart: false,
				addedWishList: false,
			};

			let { courseId } = req.query;
			const courseData = await CourseModel.findOne({ _id: courseId })
				.populate('categoryId', 'categoryName')
				.populate('subCategoryId', 'subCategoryName')
				.populate('sectionId', 'sectionName')
				.populate({
					path: 'chapters',
					select: 'chapterTitle',
					populate: {
						path: 'lectures',
						select: 'lectureTitle description duration videoPath',
					},
				})
				.populate('createdBy', '-password -otp -createdAt -updatedAt');
			if (!courseData) {
				return apiResponse.notFoundResponse(
					res,
					message.errorMsg.CourseIdNotFoundError
				);
			}

			obj.totalChapters = courseData.chapters.length;
			obj.totalLectures = courseData.lectures.length;

			
				let videoPath = courseData.videoFile.split('/')
				let imagePath = courseData.imageFile.split("/")
				let profilePath = courseData.createdBy.profileImage.split('/')

				courseData.videoFile = req.protocol + '://' + req.headers.host + '/' + videoPath[videoPath.length - 1]
				courseData.imageFile = req.protocol + '://' + req.headers.host + '/' + imagePath[imagePath.length - 1]
				courseData.createdBy.profileImage = req.protocol + '://' + req.headers.host + '/' + profilePath[profilePath.length - 1]

				courseData.chapters.filter( chapter => {

				chapter.lectures.filter( lecture => {
				let lectureVideoPath = lecture.videoPath.split('/')

				lecture.videoPath = req.protocol + '://' + req.headers.host + '/' + lectureVideoPath[lectureVideoPath.length - 1]

				})

				})

			
			obj.courseDetails = courseData;
			if (req.currentUser) {
				let userId = req.currentUser._id;
				const purchasedCourse = await CartModel.findOne({
					userId: userId,
					courseId: courseId,
					isPurchased: true,
				});
				const cartItem = await CartModel.findOne({
					userId: userId,
					courseId: courseId,
					isPurchased: false,
				});

				const wishListItem = await WishModel.findOne({
					userId: userId,
					courseId: courseId,
				});
				if (
					purchasedCourse ||
					toString(courseData.createdBy._id) == toString(userId)
				) {
					obj.isPurchased = true;
				}
				if (cartItem) {
					obj.addedToCart = true;
				}
				if (wishListItem) {
					obj.addedWishList = true;
				}
			}
			return apiResponse.successResponseWithData(
				res,
				message.successMsg.CourseDetailsDisplayed,
				obj
			);
		} catch (error) {
			return apiResponse.serverErrorResponse(res, error.message);
		}
	},
];
//==============================================================================================================

//API for getting the detail of  review and Rating of course detail ============================================
exports.getCourseReviewRating = [
	async (req, res) => {
		try {
			let { courseId } = req.query;
			const courseReviewRating = await CourseReviewRatingModel.find({
				courseId: courseId,
			}).populate(
				'userId',
				'fullName email averageRating biography headline totalReview profileImage totalStudent'
			);

			if (courseReviewRating.length <= 0) {
				return apiResponse.notFoundResponse(
					res,
					message.errorMsg.ReviewRatingNotFoundError
				);
			} else {
				return apiResponse.successResponseWithData(
					res,
					message.successMsg.ReviewRatingDisplayed,
					courseReviewRating
				);
			}
		} catch (error) {
			return apiResponse.serverErrorResponse(res, error.message);
		}
	},
];

//API for get user(instructor data) as per instructor ID =======================================================
exports.getInstructorDetailByInstructorId = [
	async (req, res) => {
		try {
			let { instructorId } = req.query;
			// find  user from the database
			const instructor = await UserModel.findOne({ _id: instructorId }).select(
				'fullName email averageRating biography headline totalReview profileImage totalStudent'
			);

			if (instructor !== null || instructor !== undefined) {
				if (instructor) {
					const courseData = await CourseModel.find(
						{ createdBy: instructorId },
						{ lectures: 0 }
					)
						.populate('categoryId', 'categoryName')
						.populate('subCategoryId', 'subCategoryName')
						.populate('sectionId', 'sectionName')
						.populate({
							path: 'chapters',
							select: 'chapterTitle',
							populate: {
								path: 'lectures',
								select: 'lectureTitle description duration videoPath',
							},
						});
				let profilePath = instructor.profileImage.split('/')
				instructor.profileImage = req.protocol + '://' + req.headers.host + '/' + profilePath[profilePath.length - 1]
				
				courseData.filter(course => {
					let videoPath = course.videoFile.split('/')
					let imagePath = course.imageFile.split("/")
				
					course.videoFile = req.protocol + '://' + req.headers.host + '/' + videoPath[videoPath.length - 1]
					course.imageFile = req.protocol + '://' + req.headers.host + '/' + imagePath[imagePath.length - 1]
				
					course.chapters.filter( chapter => {

						chapter.lectures.filter( lecture => {
						let lectureVideoPath = lecture.videoPath.split('/')

						lecture.videoPath = req.protocol + '://' + req.headers.host + '/' + lectureVideoPath[lectureVideoPath.length - 1]

						})

						})

					})						



		
					return apiResponse.successResponseWithData(
						res,
						message.successMsg.InstructorDataDisplayed,
						{ instructorDetails: instructor, courseDetails: courseData }
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

//API for adding data of ContactUs form  =======================================================================
exports.addContactUsFormData = [
	body('userName')
		.isLength({ min: 1 })
		.trim()
		.withMessage(message.errorMsg.FullRequiredError),

	body('emailId')
		.isLength({ min: 1 })
		.trim()
		.withMessage(message.errorMsg.EmailRequiredError),

	body('query')
		.isLength({ min: 1 })
		.trim()
		.withMessage(message.errorMsg.QueryRequiredError),

	body('description')
		.isLength({ min: 1 })
		.trim()
		.withMessage(message.errorMsg.DescriptionRequiredError),

	sanitizeBody('userName').escape(),
	sanitizeBody('emailId').escape(),
	sanitizeBody('query').escape(),
	sanitizeBody('description').escape(),

	async (req, res) => {
		try {
			let { userName, emailId, query, description } = req.body;
			new ContactModel({ userName, emailId, query, description }).save(
				(err, result) => {
					if (err) {
						return apiResponse.serverErrorResponse(res, err.message);
					} else {
						return apiResponse.successResponseWithData(
							res,
							message.successMsg.QuerySubmitedSuccessfully,
							result
						);
					}
				}
			);
		} catch (error) {
			return apiResponse.serverErrorResponse(res, error.message);
		}
	},
];
//==============================================================================================================

//API for get all aboutus data & description====================================================================
exports.getAboutUsData = [
	async (req, res) => {
		try {
			const aboutUsData = await AboutUsModel.find({}).lean();
			if (aboutUsData !== null || aboutUsData !== undefined) {
				if (aboutUsData.length > 0) {
					return apiResponse.successResponseWithData(
						res,
						message.successMsg.AboutUsDisplayedSuccessfull,
						aboutUsData
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

//API for get all company details data (address,country,image)==================================================
exports.getCompanyDetails = [
	async (req, res) => {
		try {
			const companyDetailData = await CompanyDetailModel.find({}).lean();
			if (companyDetailData !== null || companyDetailData !== undefined) {
				if (companyDetailData.length > 0) {
					companyDetailData.filter( company => {
						let imagePath = company.image.split("/")
						if(company.image != ""){
							company.image = req.protocol + '://' + req.headers.host + '/' + imagePath[imagePath.length - 1]
						}
					})
					
					return apiResponse.successResponseWithData(
						res,
						message.successMsg.CompanyDetailDisplayedSuccessfull,
						companyDetailData
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

//API for get all privacy data =================================================================================
exports.getPrivacyPolicy = [
	async (req, res) => {
		try {
			const privacyPolicyData = await PrivacyPolicyModel.find({}).lean();
			if (privacyPolicyData !== null || privacyPolicyData !== undefined) {
				if (privacyPolicyData.length > 0) {
					return apiResponse.successResponseWithData(
						res,
						message.successMsg.PrivacyPolicyDisplayedSuccessfull,
						privacyPolicyData
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

//API for get all term of use data & description================================================================
exports.getTermOfUseData = [
	async (req, res) => {
		try {
			const termOfUseData = await TermsOfUseModel.find({}).lean();
			if (termOfUseData !== null || termOfUseData !== undefined) {
				if (termOfUseData.length > 0) {
					return apiResponse.successResponseWithData(
						res,
						message.successMsg.TermOfUseDisplayedSuccessfull,
						termOfUseData
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

//API for get all fraquently asked question ====================================================================
exports.getFaq = [
	async (req, res) => {
		try {
			const FaqData = await FaqModel.find({}).lean();
			if (FaqData !== null || FaqData !== undefined) {
				if (FaqData.length > 0) {
					return apiResponse.successResponseWithData(
						res,
						message.successMsg.FaqDataDisplayedSuccessfull,
						FaqData
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
