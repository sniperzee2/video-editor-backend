const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, files, cb) => {
    cb(null, "Documents");
  },
  filename: (req, file, cb) => {
    cb(null, `${file.originalname}`.replace(/ /g, "_"));
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 500000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpeg|png|jpg|txt|mp4|mp3)$/)) {
      return cb(new Error("Please upload correct format"));
    }
    cb(undefined, true);
  },
});

module.exports = upload;
