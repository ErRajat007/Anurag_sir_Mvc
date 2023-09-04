const util = require('util');
const path = require('path');
const multer = require('multer');

let storage = multer.diskStorage({
	destination: (req, file, callback) => {
		if (file.fieldname == 'videoFile') {
			callback(null, path.join(`${__dirname}/../public/uploadVideos`));
		}
		if (file.fieldname == 'imageFile') {
			callback(null, path.join(`${__dirname}/../public/uploadImages`));
		}
	},
	filename: (req, file, callback) => {
		var filename = `${Date.now()}-${file.originalname}`;
		callback(null, filename);
	},
});

const fileFilter = (req, file, cb) => {
	if (file.fieldname === 'videoFile') {
		// if uploading resume
		if (file.mimetype === 'video/mp4') {
			// check file type to be pdf, doc, or docx
			cb(null, true);
		} else {
			let newError = new Error('File type of video is incorrect');
			newError.name = 'MulterError';
			callback(newError, false);
		}
	} else {
		// else uploading image
		if (
			file.mimetype === 'image/png' ||
			file.mimetype === 'image/jpg' ||
			file.mimetype === 'image/jpeg'
		) {
			// check file type to be png, jpeg, or jpg
			cb(null, true);
		} else {
			let newError = new Error('File type of image is incorrect');
			newError.name = 'MulterError';
			callback(newError, false);
		}
	}
};
let uploadFiles = multer({ storage: storage, fileFilter: fileFilter }).fields([
	{
		name: 'imageFile',
		maxCount: 1,
	},
	{
		name: 'videoFile',
		maxCount: 1,
	},
]);
let uploadFilesMiddleware = util.promisify(uploadFiles);
module.exports = uploadFilesMiddleware;
