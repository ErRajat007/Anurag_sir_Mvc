const CategoryModel = require('../models/category');
const SubCategoryModel = require('../models/subCategeory');
const SectionModel = require('../models/subCategorySections');
const apiResponse = require('../helpers/responses');
const message = require('../helpers/messages');
const { body, validationResult } = require('express-validator');
const { sanitizeBody } = require('express-validator');
let ObjectId = require('mongodb').ObjectID;

//API for adding sub-category  section Only Admin have access to add:==============================================
exports.addSection = [
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
	body('sectionName')
		.isLength({ min: 1 })
		.trim()
		.withMessage(message.errorMsg.sectionNameRequiredError)
		.custom(value => {
			return SectionModel.findOne({ sectionName: value }).then(section => {
				if (section) {
					return Promise.reject(message.errorMsg.sectionAlreadyError);
				}
			});
		}),
	sanitizeBody('categoryId').escape(),
	sanitizeBody('subCategoryId').escape(),
	sanitizeBody('sectionName').escape(),
	async (req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				// Send only 1 error at a time as per FE requirement.
				return apiResponse.validationError(res, errors.errors[0].msg);
			} else {
				let { categoryId,subCategoryId, sectionName } = req.body;
				new SectionModel({ categoryId, subCategoryId, sectionName }).save().then(result => {
					return apiResponse.successResponseWithData(
						res,
						message.successMsg.sectionCreatedSuccessfully,
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

//API for deleting sub category  section Only Admin have access to delete:=========================================
exports.deleteSection = [
	body('sectionId')
		.isLength({ min: 1 })
		.trim()
		.withMessage(message.errorMsg.sectionIdRequiredError)
		.custom(value => {
			return SectionModel.findOne({ _id: value }).then(section => {
				if (!section) {
					return Promise.reject(message.errorMsg.sectionIdNotFoundError);
				}
			});
		}),
	sanitizeBody('sectionId').escape(),
	async (req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				// Send only 1 error at a time as per FE requirement.
				return apiResponse.validationError(res, errors.errors[0].msg);
			} else {
				let { sectionId } = req.body;
				await SectionModel.deleteOne({ _id: sectionId }).then(result => {
					return apiResponse.successResponseWithData(
						res,
						message.successMsg.sectionDeletedSuccessfully
					);
				});
			}
		} catch (err) {
			return apiResponse.serverErrorResponse(res, err);
		}
	},
];
//=================================================================================================================

//API for edit  section Only Admin have access to edit:============================================================
exports.editSection = [
	body('sectionId')
		.isLength({ min: 1 })
		.trim()
		.withMessage(message.errorMsg.sectionIdRequiredError)
		.custom(value => {
			return SectionModel.findOne({ _id: value }).then(section => {
				if (!section) {
					return Promise.reject(message.errorMsg.sectionIdNotFoundError);
				}
			});
		}),
	body('sectionName')
		.isLength({ min: 1 })
		.trim()
		.withMessage(message.errorMsg.subCategoryNameRequiredError),
	sanitizeBody('sectionId').escape(),
	sanitizeBody('sectionName').escape(),
	async (req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				// Send only 1 error at a time as per FE requirement.
				return apiResponse.validationError(res, errors.errors[0].msg);
			} else {
				let { sectionId, sectionName } = req.body;
				SectionModel.findByIdAndUpdate(
					{ _id: sectionId },
					{ $set: { sectionName: sectionName } },
					{ new: true }
				).then(subCategeory => {
					return apiResponse.successResponseWithData(
						res,
						message.successMsg.SectionUpdatedSuccessful,
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
