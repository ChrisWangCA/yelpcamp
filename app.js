// 如果环境是production mode 不是development mode 它会去.env文件添加到process的dotenv添加到node app
if(process.env.NODE_ENV != 'production'){
  require('dotenv').config();
}



const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const session = require('express-session');
const flash = require('connect-flash');
const Joi = require("joi");
const { campgroundSchema, reviewSchema } = require("./schemas.js");
const catchAsync = require("./utils/catchAsync");
const ExpressError = require("./utils/ExpressError");
const passport =  require('passport');
const localStrategy = require('passport-local');
const User = require('./models/user.js');
//web只有get和post所以用put和其他的用来伪装post来实现修改
const methodOverride = require("method-override");
//用帮防止一些dns或者http安全方面的功能, 会自动触发它的11个middleware来保护
const helmet = require('helmet');

//防止注入，Nosql一样可以用$gt注入
const mongoSanitize = require('express-mongo-sanitize');


const userRoutes = require('./routes/users');
const campgroundRoutes = require("./routes/campgrounds");
const reviewRoutes = require("./routes/reviews");
const MongoStore = require('connect-mongo');

const dbUrl = process.env.DB_URL || 'mongodb://127.0.0.1:27017/yelp-camp';
// mongodb://127.0.0.1:27017/yelp-camp
mongoose.connect(dbUrl, {
  // useNewUrlParser: true,
  // useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});

const app = express();

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, 'public')));
app.use(mongoSanitize({
  replaceWith:'_'}));

const secret = process.env.SECRET || 'thisshouldbebettersecret';

const store = MongoStore.create({
  mongoUrl:dbUrl,
  touchAfter: 24 * 60 * 60, //更新数据的时间如果数据没有变化的话用户刷新页面也不需要更新
  crypto: {
    secret
  }
});

store.on('error', function(e){
  console.log("SESSION STORE ERROR:", e);
})

const sessionConfig = {
  store,
  // name:'xxx' 可以给cookie设置名字容易在inspect里找到 
  secret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    // secure: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge:1000 * 60 * 60 * 24 * 7
  }
}
app.use(session(sessionConfig));
app.use(flash());
app.use(helmet()); //helmet自动运行11个middleware除非自己设置哪些不运行

//helmet其中一个中间件contentSecurityPolicy获取的资源只能从自己设置的里面获得，其他的来源的不会显示
const scriptSrcUrls = [
  "https://stackpath.bootstrapcdn.com",
  "https://api.tiles.mapbox.com",
  "https://api.mapbox.com",
  "https://kit.fontawesome.com",
  "https://cdnjs.cloudflare.com",
  "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
  "https://kit-free.fontawesome.com",
  "https://stackpath.bootstrapcdn.com",
  "https://api.mapbox.com",
  "https://api.tiles.mapbox.com",
  "https://fonts.googleapis.com",
  "https://use.fontawesome.com",
];
const connectSrcUrls = [
  "https://api.mapbox.com",
  "https://*.tiles.mapbox.com",
  "https://events.mapbox.com",
];
const fontSrcUrls = [];
app.use(
  helmet.contentSecurityPolicy({
      directives: {
          defaultSrc: [],
          connectSrc: ["'self'", ...connectSrcUrls],
          scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
          styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
          workerSrc: ["'self'", "blob:"],
          childSrc: ["blob:"],
          objectSrc: [],
          imgSrc: [
              "'self'",
              "blob:",
              "data:",
              "https://res.cloudinary.com/douqbebwk/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
              "https://images.unsplash.com",
          ],
          fontSrc: ["'self'", ...fontSrcUrls],
      },
  })
);

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
//tell passport how to serialize/deserialize the User, tell it how to get the user in session
//and out of the session
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
})

// app.get('/fakeUser', async(req,res)=>{
//   const user = new User({email: 'chris@gmail.com', username: 'chris'});
//   //register方法需要传入密码，会自动hash和加盐,等于自动encrypt
//   const newUser = await User.register(user, 'chris');
//   res.send(newUser);
// })

const validateCampground = (req, res, next) => {
  const { error } = campgroundSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

const validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

app.use('/', userRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/reviews", reviewRoutes);


app.get("/", (req, res) => {
  res.render("home");
});

app.all("*", (req, res, next) => {
  next(new ExpressError("Page Not Found", 404));
});

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "Something Went Wrong";
  res.status(statusCode).render("error", { err });
});

app.listen(3000, () => {
  console.log("Serving on port 3000");
});
