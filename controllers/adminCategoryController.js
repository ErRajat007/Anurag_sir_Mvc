const CategoryModel = require('../models/category');
const apiResponse = require('../helpers/responses');
const message = require('../helpers/messages');
const { body, validationResult } = require('express-validator');
const { sanitizeBody } = require('express-validator');
let ObjectId = require('mongodb').ObjectID;

//API for adding category Only Admin have access to add:===========================================================
exports.addCategory = [
	body('categoryName')
		.isLength({ min: 1 })
		.trim()
		.withMessage(message.errorMsg.CategoryNameRequiredError)
		.custom(value => {
			return CategoryModel.findOne({ categoryName: value }).then(user => {
				if (user) {
					return Promise.reject(message.errorMsg.CategoryAlreadyError);
				}
			});
		}),
	sanitizeBody('categoryName').escape(),
	async (req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				// Send only 1 error at a time as per FE requirement.
				return apiResponse.validationError(res, errors.errors[0].msg);
			} else {
				let { categoryName } = req.body;
				new CategoryModel({ categoryName }).save().then(categeory => {
					return apiResponse.successResponseWithData(
						res,
						message.successMsg.CategoryCreatedSuccessful,
						categeory
					);
				});
			}
		} catch (err) {
			return apiResponse.serverErrorResponse(res, err.message);
		}
	},
];
//=================================================================================================================

//API for deleting category Only Admin have access to delete:======================================================
exports.deleteCategory = [
	body('categoryId')
		.isLength({ min: 1 })
		.trim()
		.withMessage(message.errorMsg.CategoryIdRequiredError)
		.custom(value => {
			return CategoryModel.findOne({ _id: value }).then(category => {
				if (!category) {
					return Promise.reject(message.errorMsg.CategoryIdNotFoundError);
				}
			});
		}),
	sanitizeBody('categoryId').escape(),
	async (req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				// Send only 1 error at a time as per FE requirement.
				return apiResponse.validationError(res, errors.errors[0].msg);
			} else {
				let { categoryId } = req.body;
				await CategoryModel.deleteOne({ _id: categoryId }).then(result => {
					return apiResponse.successResponseWithData(
						res,
						message.successMsg.CategoryDeletedSuccessfull
					);
				});
			}
		} catch (err) {
			return apiResponse.serverErrorResponse(res, err.message);
		}
	},
];
//=================================================================================================================

//API for edit  category Only Admin have access to edit:===========================================================
exports.editCategory = [
	body('categoryId')
		.isLength({ min: 1 })
		.trim()
		.withMessage(message.errorMsg.CategoryIdRequiredError)
		.custom(value => {
			return CategoryModel.findOne({ _id: value }).then(category => {
				if (!category) {
					return Promise.reject(message.errorMsg.CategoryIdNotFoundError);
				}
			});
		}),
	body('categoryName')
		.isLength({ min: 1 })
		.trim()
		.withMessage(message.errorMsg.CategoryNameRequiredError),
	sanitizeBody('categoryId').escape(),
	sanitizeBody('categoryName').escape(),
	async (req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				// Send only 1 error at a time as per FE requirement.
				return apiResponse.validationError(res, errors.errors[0].msg);
			} else {
				let { categoryId, categoryName } = req.body;
				CategoryModel.findByIdAndUpdate(
					{ _id: categoryId },
					{ $set: { categoryName: categoryName } },
					{ new: true }
				).then(categeory => {
					return apiResponse.successResponseWithData(
						res,
						message.successMsg.CategoryUpdatedSuccessful,
						categeory
					);
				});
			}
		} catch (err) {
			return apiResponse.serverErrorResponse(res, err.message);
		}
	},
];
//=================================================================================================================
