const express = require('express');
const adminCategoryController = require('../controllers/adminCategoryController');
const adminSubcategoryController = require('../controllers/adminSubCategoryController');
const adminSubCategorySectionsController = require('../controllers/adminSubCategorySectionsController');
const adminController = require('../controllers/adminController');

const router = express.Router();

//Category Controller
router.post('/add-category', adminCategoryController.addCategory);
router.delete('/delete-category', adminCategoryController.deleteCategory);
router.post('/edit-category', adminCategoryController.editCategory);

//Sub-category controller
router.post('/add-subCategory', adminSubcategoryController.addSubcategory);
router.delete('/delete-subCategory',adminSubcategoryController.deleteSubCategory);
router.post('/edit-subCategory', adminSubcategoryController.editSubCategory);

//Sub-category sections controller
router.post('/add-section', adminSubCategorySectionsController.addSection);
router.delete('/delete-section',adminSubCategorySectionsController.deleteSection);
router.post('/edit-section', adminSubCategorySectionsController.editSection);

//Admin fuctionality
router.get('/get-user-List', adminController.getUserList);
router.get('/get-user-by-id', adminController.getUserById);
router.post('/add-aboutUs', adminController.addAboutUs);
router.post('/add-companyDetail', adminController.addCompanyDetail);
router.post('/add-frequently-asked-question', adminController.addFrequentlyAskedQuestion);
router.post('/add-privacy-policy-data', adminController.addPrivacyPolicyData);
router.post('/add-terms-of-use', adminController.addTermsOfUse);
router.delete('/soft-delete-user', adminController.softDelete);
router.delete('/get-course-for-approval', adminController.getCourseForApproval);
router.patch("/give-permission-to-course",adminController.givePermissionToCourse)
router.patch("/reject-course-with-reason",adminController.rejectCourseWithReason)
router.get('/get-review-reports', adminController.getReviewReports);
router.delete('/delete-reported-review-by-admin', adminController.deleteReportedReviewByAdmin);

module.exports = router;
