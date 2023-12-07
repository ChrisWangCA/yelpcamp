const express = require("express");
const router = express.Router();
const campgrounds = require("../controller/campgrounds");
const catchAsync = require("../utils/catchAsync");
const ExpressError = require("../utils/ExpressError");
const Campground = require("../models/campground");
const { campgroundSchema } = require("../schemas.js");
const { isLoggedIn, isAuthor, validateCampground } = require("../middleware");

/**
 * multer 是一个 Node.js 的中间件，用于处理 multipart/form-data 类型的表单数据，例如上传文件。
它的主要作用是解析从客户端上传的文件，将文件保存到指定位置，
并将文件信息添加到 Express 的 request 对象中，
以便后续在处理请求时能够访问这些文件的相关信息，比如文件名、大小等。
通过 multer，你可以在 Express 应用中轻松地处理文件上传的逻辑，
例如用户上传头像、图片或其他文件。你可以配置 multer 来限制文件类型、文件大小等，
以确保安全地处理用户上传的文件。
 */
const multer = require("multer");
const { storage } = require('../cloudinary'); //不需要写index，因为node自动寻找index file
const upload = multer({ storage });


router
  .route("/")
  .get(catchAsync(campgrounds.index))
  .post(
    isLoggedIn,
    upload.array('image'),
    validateCampground,
    catchAsync(campgrounds.createCampground)
  );

//new要放在id前，否则:id会将new识别为id
router.get("/new", isLoggedIn, campgrounds.renderNewForm);

// 出现异常会去catchAsync里然后在catchAsync的next传递到下面的err

router
  .route("/:id")
  .get(catchAsync(campgrounds.showCampground))
  .put(
    isLoggedIn,
    isAuthor,
    upload.array('image'),
    validateCampground,
    catchAsync(campgrounds.updateCampground)
  )
  .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));

router.get(
  "/:id/edit",
  isLoggedIn,
  isAuthor,
  catchAsync(campgrounds.renderEditForm)
);

module.exports = router;
