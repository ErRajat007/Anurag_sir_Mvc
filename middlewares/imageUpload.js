const util = require('util'); 
const path = require('path');
const multer = require('multer');

let storage = multer.diskStorage({
	destination: (req, file, callback) => {
		callback(null, path.join(`${__dirname}/../public/uploadImages`));
	},
	filename: (req, file, callback) => {
		const match = ['image/png', 'image/jpeg', 'images/jpg'];

		if (match.indexOf(file.mimetype) === -1) {
			let newError = new Error(
				`${file.originalname} is invalid. Only accept png/jpeg/jpg format`
			);
			newError.name = 'MulterError';
			callback(newError, false);
		}

		let filename = `${Date.now()}-${file.originalname}`;
		callback(null, filename);
	},
});

let uploadFiles = multer({ storage: storage }).single('imageFile');
let uploadFilesMiddleware = util.promisify(uploadFiles);
module.exports = uploadFilesMiddleware;
