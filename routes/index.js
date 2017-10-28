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
//学生主页
router.get('/details', function(req, res) {
  var username = req.session.username;
  if(username){
    conn.getDb((err,db)=>{
      if(err) throw err;
      console.log("数据库连接成功");
      var stu = db.collection("stu");
      stu.find({name:username}).toArray((err,result)=>{
        if(err) throw err;
        res.render("details",{title:"首页",username:username,result:result[0]});
      });
      db.close();
    })
  }else{
    res.send(`<script>alert('已过期，重新登录！');location.href="/login"</script>`);
  }
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
      //res.send({username:req.session.username,password:req.session.password});
    })
  })
})

//添加学生
router.get("/addstu",(req,res)=>{
  res.render('addstu', { username: req.session.username,title:"添加学生"});
});
//学生列表
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
});
//添加课程
router.get("/addcourse",(req,res)=>{
  res.render('addcourse', { username: req.session.username,title:"添加课程"});
});

//课程列表
router.get("/courseinfo",(req,res)=>{
  var username = req.session.username;
  var pageSize = 8;
  var totalPage = 0;
  var count = 0;
  var pageNo = req.query["pageNo"];
  pageNo = pageNo?parseInt(pageNo):1;
  if(username){
      var findData = function(db,callback){
          var cou = db.collection("course");
          async.waterfall([
              (callback)=>{
                cou.find({}).toArray((err,result)=>{
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
                    cou.find({}).sort({_id:-1}).skip((pageNo-1)*pageSize).limit(pageSize).toArray((err,result)=>{
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
            res.render("courseinfo",{
              result:result,
              pageNo:pageNo,
              count:count,
              totalPage:totalPage,
              title:"课程列表",
              username:req.session.username
            });
            db.close();
          })
          
        })
        
    
  }else{
    res.send(`<script>alert('已过期，重新登录！');location.href="/login"</script>`);
  }
});

//学生选课
router.get("/selectcourse",(req,res)=>{
  var username = req.session.username;
  var pageSize = 8;
  var totalPage = 0;
  var count = 0;
  var pageNo = req.query.pageNo;
  pageNo = pageNo?parseInt(pageNo):1;
  if(username){
    var findData = function(db,callback){
      var course = db.collection("course");
     async.waterfall([
       (callback)=>{
        course.find({}).toArray((err,result)=>{
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
           course.find({}).sort({_id:-1}).skip((pageNo-1)*pageSize).limit(pageSize).toArray((err,result)=>{
             if(err) throw err;
             console.log("查询成功");
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
    }
    conn.getDb((err,db)=>{
      if(err) throw err;
      console.log("数据库连接成功");
      //查询选课表
      var select = db.collection("select");
      var arr = [];
      select.find({}).toArray((err,result)=>{
        arr.push(result);
      })
      //课程信息分页
      findData(db,(result)=>{
        res.render("selectcourse",{
          title:"学生选课",
          result:result,
          username:req.session.username,
          pageNo:pageNo,
          count:count,
          totalPage:totalPage,
          arr:arr[0]
        });
      })
    })
  }else{
    res.send(`<script>alert('已过期，重新登录！');location.href="/login"</script>`);
  }
  
});

//学生成绩管理
router.get("/grade",(req,res)=>{
  var username = req.session.username;
  var pageSize = 8;
  var totalPage = 0;
  var count = 0;
  var pageNo = req.query.pageNo; 
  pageNo = pageNo?parseInt(pageNo):1;
  var arr = {};
  var content=[];
  var cname = [];
  var grade=[];
  var findData = function(db,callback){
    var select = db.collection("select");
    var cou = db.collection("course");
    async.waterfall([
      (callback)=>{
        select.find({username:username}).toArray((err,result)=>{        
          for(var i in result){
            grade.push(result[i].grade);
            cname.push(result[i].cname);
          }
          count = result.length;
          if(count>=1){
            totalPage = Math.ceil(count/pageSize);
            pageNo = pageNo<=1?1:pageNo;
            pageNo = pageNo>=totalPage?totalPage:pageNo;
            callback(null,result);
          }else{
            callback(null,false);
          }
          
        })
      },
      (arg,callback)=>{ 
        if(arg){
          cou.find({cname:{$in:cname}}).sort({_id:-1}).skip((pageNo-1)*pageSize).limit(pageSize).toArray((err,result)=>{
            if(err) throw err;
            console.log("查询成功");
            callback(null,result);
          })
        }else{
          callback(null,false);
        }    
    } 
    ],(err,result)=>{
      if(err) throw err;
      for(var i=0; i<result.length; i++){
        result[i].grade = grade[i];
      }
      callback(result);
    })
  }
  if(username){
    conn.getDb((err,db)=>{
      if(err) throw err;
      console.log("数据库连接成功");
     findData(db,(result)=>{
       res.render("grade",{
         title:"学生成绩信息",
         username:req.session.username,
         result:result,
         pageNo:pageNo,
         count:count,
         totalPage:totalPage
        });
     })
      
    })
    
  }else{
    res.send(`<script>alert('已过期，重新登录！');location.href="/login"</script>`);
  }
  
})
module.exports = router;
