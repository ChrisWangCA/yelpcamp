const Campground = require('../models/campground');

module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    //将campgrounds数据发送到了campgrounds/index,所以可以在index页面拿到该数据
    res.render("campgrounds/index", { campgrounds });
  }


module.exports.renderNewForm = (req, res) => {
    res.render("campgrounds/new");
  }


module.exports.createCampground = async (req, res) => {
    // if(!req.body.campground) throw new ExpressError('Invalid Campground Data',400);

    const campground = new Campground(req.body.campground);
    campground.author = req.user._id;
    await campground.save();
    req.flash("success", "Successfully made a new campground!");
    res.redirect(`/campgrounds/${campground._id}`);
  }

module.exports.showCampground = async (req, res) => {
    const campground = await Campground.findById(req.params.id)
      .populate(
        {
          //得到reviews里面的author 和 campground不同
          path: 'reviews',
          populate: {
            path: 'author'
          }
        }
      )
      .populate("author");
    if (!campground) {
      req.flash("error", "Cannot find that campground");
      return res.redirect("/campgrounds");
    }
    res.render("campgrounds/show", { campground });
  }

module.exports.renderEditForm = async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    if (!campground) {
      req.flash("error", "Cannot find that campground");
      return res.redirect("/campgrounds");
    }
    res.render("campgrounds/edit", { campground });
  }

module.exports.updateCampground = async (req, res) => {
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
    req.flash("success", "Successfully updated campground");
    res.redirect(`/campgrounds/${campground._id}`);
  }

module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash("success", "Successfully deleted review");
    res.redirect("/campgrounds");
  }