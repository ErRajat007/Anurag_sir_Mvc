const express = require("express");
const commonController = require('../controllers/commonController')
const courseController = require('../controllers/courseController')

const router = express.Router();

// Controller
router.get("/get-categories-list", commonController.getCategories);
router.get("/get-categories-with-subCategories", commonController.getCategoriesWithSubCategories);
router.get("/get-subCategories-by-categoryId", commonController.getSubCategoriesByCategoryId);
router.get("/get-sections-by-subCategoryId", commonController.getSectionsBySubCategoryId);
router.get("/get-courses-list", commonController.getCourses);
router.get("/get-courses-by-categoryId", commonController.getCoursesByCategoryId);
router.get("/get-courses-by-subCategoryId", commonController.getCoursesBysubCategoryId);
router.get("/get-courses-by-sectionId", commonController.getCoursesBysectionId);
router.get("/get-limited-categories-wtih-courses", commonController.getLimitedCategoriesWithCourse);
router.get("/get-sections-by-categoryId", commonController.getSectionsByCategoryId);
router.get("/get-searchData", commonController.getSearchData);
router.get("/get-courses-by-instructorId",commonController.getCoursesByInstructorId)
router.get("/get-instructorDetail-by-instructorId",commonController.getInstructorDetailByInstructorId)
router.get("/get-courseDetail",commonController.getCourseDetail)
router.get("/get-courseReviewRatingDetail",commonController.getCourseReviewRating);
router.post("/add-contact-us-formData",commonController.addContactUsFormData)
router.get('/get-aboutUs', commonController.getAboutUsData)
router.get('/get-companyDetails', commonController.getCompanyDetails);
router.get('/get-privacy-policy', commonController.getPrivacyPolicy);

router.get('/get-term-of-use-data', commonController.getTermOfUseData);
router.get('/get-frequently-asked-question-answer', commonController.getFaq)
router.get("/search-review", courseController.searchReview);
router.get("/search-rating", courseController.searchRating);



module.exports = router;