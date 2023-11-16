const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
//web只有get和post所以用put和其他的用来伪装post来实现修改
const methodOverride = require('method-override');
const Campground = require('./models/campground');

mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
})

const app = express();


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));

app.get('/', (req, res) => {
    res.render('home');
});


app.get('/campgrounds',async (req, res) => {
    const campgrounds = await Campground.find({});
    //将campgrounds数据发送到了campgrounds/index,所以可以在index页面拿到该数据
    res.render('campgrounds/index', {campgrounds});
})


app.get('/campgrounds/new' , (req,res) => {
    res.render('campgrounds/new');
})

app.post('/campgrounds', async(req,res)=>{
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`)
})

app.get('/campgrounds/:id', async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/show', { campground });
})

app.get('/campgrounds/:id/edit', async(req,res) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/edit', { campground })
})

app.put('/campgrounds/:id',  async(req ,res) => {
    const { id } = req.params;
    /*
    在这里，... 是 JavaScript 中的扩展运算符（Spread Operator）。
    它用于展开对象或数组，将对象的属性复制到另一个对象中，或者将数组的元素复制到另一个数组中。
    在这个例子中，...req.body.campground 将 req.body.campground 对象中的所有属性复制到 findByIdAndUpdate 方法中需要更新的对象中。
    这个语法通常用于确保更新时只传递了需要更新的属性，而不是整个 req.body.campground 对象。
    这种做法有助于保持代码的清晰性和简洁性，并减少不必要的属性或字段更新。
    */
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground});
    res.redirect(`/campgrounds/${campground._id}`);
});

app.delete('/campgrounds/:id', async(req, res)=>{
    const {id} = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
})


app.listen(3000, () => {
    console.log('Serving on port 3000');
});







