const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const Campground = require("../models/campground");
const { campgroundSchema } = require('../schemas.js');


const validateCampground = ( req,res,next) => {
    const { error } = campgroundSchema.validate(req.body);
    if(error){
      const msg = error.details.map(el => el.message).join(',')
      throw new ExpressError(msg,400);
    }else{
      next();
    }
  }
  

router.get("/", async (req, res) => {
    const campgrounds = await Campground.find({});
    //将campgrounds数据发送到了campgrounds/index,所以可以在index页面拿到该数据
    res.render("campgrounds/index", { campgrounds });
  });
  

router.get("/new", (req, res) => {
    res.render("campgrounds/new");
  });
  
  // 出现异常会去catchAsync里然后在catchAsync的next传递到下面的err

router.post("/",validateCampground, catchAsync (async (req, res) => {
      // if(!req.body.campground) throw new ExpressError('Invalid Campground Data',400);
      
      const campground = new Campground(req.body.campground);
      await campground.save();
      req.flash('success','Successfully made a new campground!');
      res.redirect(`/campgrounds/${campground._id}`);
  
  }));
  

router.get("/:id", catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate('reviews');
    if(!campground){
      req.flash('error', 'Cannot find that campground');
      return res.redirect('/campgrounds');
    }
    res.render("campgrounds/show", { campground });
  }));
  

router.get("/:id/edit",catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    if(!campground){
      req.flash('error', 'Cannot find that campground');
      return res.redirect('/campgrounds');
    }
    res.render("campgrounds/edit", { campground });
  }));
  

router.put("/:id",validateCampground, catchAsync (async (req, res) => {
    const { id } = req.params;
    /*
      在这里，... 是 JavaScript 中的扩展运算符（Spread Operator）。
      它用于展开对象或数组，将对象的属性复制到另一个对象中，或者将数组的元素复制到另一个数组中。
      在这个例子中，...req.body.campground 将 req.body.campground 对象中的所有属性复制到 findByIdAndUpdate 方法中需要更新的对象中。
      这个语法通常用于确保更新时只传递了需要更新的属性，而不是整个 req.body.campground 对象。
      这种做法有助于保持代码的清晰性和简洁性，并减少不必要的属性或字段更新。
      */
    const campground = await Campground.findByIdAndUpdate(id, {
      ...req.body.campground,
    });
    req.flash('success', 'Successfully updated campground')
    res.redirect(`/campgrounds/${campground._id}`);
  }));
  

router.delete("/:id", catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted review');
    res.redirect("/campgrounds");
  }));


module.exports = router;