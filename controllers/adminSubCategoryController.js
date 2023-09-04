const CategoryModel = require('../models/category');
const SubCategoryModel = require('../models/subCategeory');
const apiResponse = require('../helpers/responses');
const message = require('../helpers/messages');
const { body, validationResult } = require('express-validator');
const { sanitizeBody } = require('express-validator');
let ObjectId = require('mongodb').ObjectID;

//API for adding sub-category Only Admin have access to add:=======================================================
exports.addSubcategory = [
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
	body('subCategoryName')
		.isLength({ min: 1 })
		.trim()
		.withMessage(message.errorMsg.subCategoryNameRequiredError)
		.custom(value => {
			return SubCategoryModel.findOne({ subCategoryName: value }).then(user => {
				if (user) {
					return Promise.reject(message.errorMsg.SubCategoryAlreadyError);
				}
			});
		}),
	sanitizeBody('categoryId').escape(),
	sanitizeBody('subCategoryName').escape(),
	async (req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				// Send only 1 error at a time as per FE requirement.
				return apiResponse.validationError(res, errors.errors[0].msg);
			} else {
				let { categoryId, subCategoryName } = req.body;
				new SubCategoryModel({ categoryId, subCategoryName })
					.save()
					.then(result => {
						return apiResponse.successResponseWithData(
							res,
							message.successMsg.SubCategoryCreatedSuccessful,
							result
						);
					});
			}
		} catch (err) {
			return apiResponse.serverErrorResponse(res, err.message);
		}
	},
];
//=================================================================================================================

//API for deleting sub category Only Admin have access to delete:==================================================
exports.deleteSubCategory = [
	body('subCategoryId')
		.isLength({ min: 1 })
		.trim()
		.withMessage(message.errorMsg.subCategoryIdRequiredError)
		.custom(value => {
			return SubCategoryModel.findOne({ _id: value }).then(subCategory => {
				if (!subCategory) {
					return Promise.reject(message.errorMsg.subCategoryIdNotFoundError);
				}
			});
		}),
	sanitizeBody('subCategoryId').escape(),
	async (req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				// Send only 1 error at a time as per FE requirement.
				return apiResponse.validationError(res, errors.errors[0].msg);
			} else {
				let { subCategoryId } = req.body;
				await SubCategoryModel.deleteOne({ _id: subCategoryId }).then(
					result => {
						return apiResponse.successResponseWithData(
							res,
							message.successMsg.subCategoryDeletedSuccessfull
						);
					}
				);
			}
		} catch (err) {
			return apiResponse.serverErrorResponse(res, err.message);
		}
	},
];
//=================================================================================================================

//API for edit sub-category Only Admin have access to edit:========================================================
exports.editSubCategory = [
	body('subCategoryId')
		.isLength({ min: 1 })
		.trim()
		.withMessage(message.errorMsg.subCategoryIdRequiredError)
		.custom(value => {
			return SubCategoryModel.findOne({ _id: value }).then(subCategory => {
				if (!subCategory) {
					return Promise.reject(message.errorMsg.subCategoryIdNotFoundError);
				}
			});
		}),
	body('subCategoryName')
		.isLength({ min: 1 })
		.trim()
		.withMessage(message.errorMsg.subCategoryNameRequiredError),
	sanitizeBody('subCategoryId').escape(),
	sanitizeBody('subCategoryName').escape(),
	async (req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				// Send only 1 error at a time as per FE requirement.
				return apiResponse.validationError(res, errors.errors[0].msg);
			} else {
				let { subCategoryId, subCategoryName } = req.body;
				SubCategoryModel.findByIdAndUpdate(
					{ _id: subCategoryId },
					{ $set: { subCategoryName: subCategoryName } },
					{ new: true }
				).then(subCategeory => {
					return apiResponse.successResponseWithData(
						res,
						message.successMsg.CategoryUpdatedSuccessful,
						subCategeory
					);
				});
			}
		} catch (err) {
			return apiResponse.serverErrorResponse(res, err.message);
		}
	},
];
//=================================================================================================================
