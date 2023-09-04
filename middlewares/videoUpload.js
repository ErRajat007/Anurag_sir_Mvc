const util = require("util");
const path = require("path");
const multer = require("multer");

let storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, path.join(`${__dirname}/../public/uploadVideos`));
  },
  filename: (req, file, callback) => {
    

    if (file.mimetype !== "video/mp4") {
      //prevent the upload
      let newError = new Error("File type is incorrect");
      newError.name = "MulterError";
      callback(newError, false);
      }

    var filename = `${Date.now()}-${file.originalname}`;
    callback(null, filename);
  }
});

let uploadFiles = multer({ storage: storage }).single("videoFile");
let uploadFilesMiddleware = util.promisify(uploadFiles);
module.exports = uploadFilesMiddleware;
