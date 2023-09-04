let express = require('express');
const courseController = require('../controllers/courseController');
const userController = require('../controllers/userController');
const paymentController = require('../controllers/paymentController');

let router = express.Router(); 
  
//Course Controller
router.post('/add-course', courseController.addCourse);
router.delete('/delete-course', courseController.deleteCourse);
router.put('/edit-course', courseController.editCourse);
router.put('/update-course-image-and-video', courseController.updateCourseImageAndVideo);
router.post('/add-chapter-to-course', courseController.addChapter);
router.post('/add-lecture', courseController.addlecture);
router.post('/add-rating', courseController.addRating);
router.post('/add-review', courseController.addReview);
router.post('/add-rating&review', courseController.addRatingReview);
router.delete("/delete-chapter", courseController.deleteChapter)
router.delete("/delete-lecture", courseController.deleteLecture)
router.delete("/delete-rating-review", courseController.deleteRatingReview)

//User controller
router.post('/upload-profile-image', userController.uploadProfileImage);
router.put('/update-profile-data', userController.updateProfileData);
router.post('/add-to-wish-list', userController.addToWishList);
router.delete('/remove-from-wishlist', userController.removeFromWishList);
router.get('/get-wishlist', userController.getWishList);
router.post('/add-to-cart', userController.addToCart);
router.get('/get-cart-items', userController.getCart);
router.delete('/remove-items-from-cart', userController.removeItemFromCart);
router.post('/add-rating-to-instructor', userController.addRatingToInstructor);
router.post('/add-relation', userController.addRelation);
router.post('/add-instructor-review', userController.addInstructorReview);
router.get(	'/get-own-courses-of-instructor', userController.getOwnCoursesOfInstructor);
router.post('/off-sync-add-to-cart', userController.offSyncAddToCart);
router.patch('/enable-or-disable-notifications', userController.enableOrDisableNotifications);
router.patch('/become-instructor', userController.becomeInstructor);
router.get('/check-notification-status', userController.checkNotificationStatus);
router.post('/change-password', userController.changePassword);
router.get('/get-my-learning-data', userController.getMyLearningData);
router.patch('/request-permission-for-course-publish',userController.requestPermissionForCoursePublish)
router.post('/add-review-report', userController.addReviewReport);
router.post('/add-reminder', userController.addReminder);
router.get('/get-reminder-as-per-course', userController.getReminderAsPerCourse)
router.get('/get-reminder-as-per-user', userController.getReminderAsPerUser)
router.delete('/delete-reminder', userController.deleteReminder)


//payment controller
router.post('/generate-razorpay-orderId', paymentController.generateRazorPayOrderId);
router.post('/verify-razorpay-Payment',	paymentController.verifyRazorPayPayment);
router.post('/verify-all-payment', paymentController.verifyAllPayment);


module.exports = router;
