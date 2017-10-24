var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: '首页' ,username:req.session.username,time:new Date("yyyy-MM-dd HH:mm:ss")});
});

//登录
router.get('/login', function(req, res) {
  res.render('login', { title: "Login" });
});
//注册
router.get('/register', function(req, res) {
  res.render('register', { title: "Register" });
});


//注销
router.get('/logout',(req,res)=>{
  req.session.distroy((err)=>{
    if(err) throw err;
    res.redirect("/");
  })
});
module.exports = router;
