var express = require('express');
var router = express.Router();


var conn = require("../utils/conn");

var async = require("async");
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: '首页' ,username:req.session.username,password:req.session.password});
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
  req.session.destroy((err)=>{
    if(err) throw err;
    res.redirect("/");
  })
});

//admin更新信息
router.post("/update",(req,res)=>{
  var username = req.body.rname;
  var password = req.body.rpwd;
  req.session.username = username;
  req.session.password = password;


  var updateData = function(db,callback){
    var admin = db.collection("admin");
    async.waterfall([
      (callback)=>{
        admin.findOne({},{_id:1},(err,result)=>{
          if(err) throw err;
          callback(null,result);
        })
      },
      (arg1,callback)=>{
        admin.updateOne(
          {_id:arg1["_id"]},
          {$set:{
            username:username,
            password:password
          }},
          (err,result)=>{
            if(err) throw err;
            console.log("修改成功");
            callback(null,result);
          }
        )
      }
    ],(err,result)=>{
      if(err) throw err;
      callback(result);
    })
  }
  conn.getDb((err,db)=>{
    if(err) throw err;
    console.log("数据库连接成功");
    updateData(db,(result)=>{
      res.redirect("/");
    })
  })
})

router.get("/addstu",(req,res)=>{
  res.render('addstu', { username: req.session.username,title:"添加学生"});
});

router.get("/stuinfo",(req,res)=>{
  var username = req.session.username;
  var pageSize = 8;
  var totalPage = 0;
  var count = 0;
  var pageNo = req.query["pageNo"];
  pageNo = pageNo?parseInt(pageNo):1;
  if(username){
      var findData = function(db,callback){
          var stu = db.collection("stu");
          async.waterfall([
              (callback)=>{
                  stu.find({}).toArray((err,result)=>{
                      if(err) throw err;
                      count = result.length;
                      if(count>=1){
                          totalPage = Math.ceil(count/pageSize);
                          pageNo = pageNo<=1?1:pageNo;
                          pageNo = pageNo>=totalPage?totalPage:pageNo;
                          callback(null,true);
                      }else{
                          callback(null,false);
                      }
                  })
              },
              (flag,callback)=>{
                  if(flag){
                      stu.find({}).sort({_id:-1}).skip((pageNo-1)*pageSize).limit(pageSize).toArray((err,result)=>{
                          if(err) throw err;
                          console.log("查询stu成功");
                          callback(null,result);
                      })
                  }else{
                    callback(null,false);
                  }
              }
          ],(err,result)=>{
              if(err) throw err;
              callback(result);
          })
      };
      conn.getDb((err,db)=>{
        if(err) throw err;
        console.log("数据库连接成功");

          //学生信息分页
          findData(db,(result)=>{
            res.render("stuinfo",{
              result:result,
              pageNo:pageNo,
              count:count,
              totalPage:totalPage,
              title:"学生列表",
              username:req.session.username
            });
            db.close();
          })
          
        })
        
    
  }else{
    res.send(`<script>alert('已过期，重新登录！');location.href="/login"</script>`);
  }

  
  
})
module.exports = router;
