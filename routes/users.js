const express = require("express");
const router = express.Router();
const users = require("../controller/users");
const catchAsync = require("../utils/catchAsync");
const passport = require("passport");
const User = require("../models/user");
const { storeReturnTo } = require("../middleware");


router.route('/register')
  .get(users.renderRegister)
  .post(catchAsync(users.register));

router.route('/login')
  .get(users.renderLogin)
  .post(storeReturnTo,
    //passport自带的local代表本地，也可以有google facebook等，失败自动flash消息(passport自带)和redirect
    passport.authenticate("local", {
      failureFlash: true,
      failureRedirect: "/login",
    }),
    users.login);



router.get("/logout", users.logout);

module.exports = router;
