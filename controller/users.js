const User = require("../models/user");


module.exports.renderRegister = (req, res) => {
    res.render("users/register");
  }

module.exports.register = async (req, res) => {
    try {
      const { email, username, password } = req.body;
      const user = new User({ email, username });
      //register方法需要传入密码，会自动hash和加盐,等于自动encrypt
      const registerUser = await User.register(user, password);
      //当用户注册后需要已经是login的状态，用passport的login方法，当用户注册后可以自动登录
      req.login(registerUser, err => {
        if(err) return next(err);
        req.flash("success", "Welcome to YelpCamp");
        res.redirect("/campgrounds");
      })
    } catch (e) {
      req.flash("error", e.message);
      res.redirect("register");
    }
  }

module.exports.renderLogin = (req, res) => {
    res.render("users/login");
  }

module.exports.login = (req, res) => {
    req.flash('success', 'Welcome back!')
    //回溯用户之前在哪个路径触发的登入
    const redirectUrl = res.locals.returnTo || '/campgrounds';
    delete req.session.returnTO; //删除这个信息里面可能包含id信息
    res.redirect(redirectUrl);
  }

module.exports.logout = (req,res,next) => {
    //passport自带功能logout用于终止当前用户的登录会话，并清除在用户会话中存储的数据
    req.logout(function(err){
        if(err){
            return next(err);
        }
        req.flash('success', 'GoodBye');
        res.redirect('/campgrounds');
    })
}