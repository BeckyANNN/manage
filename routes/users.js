var express = require('express');
var router = express.Router();

var conn = require("../utils/conn");

var async = require("async");

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

//注册
router.post('/register',(req,res)=>{
    var username = req.body.username;
    var password = req.body.password;
    var insertData = function(db,callback){
      var admin = db.collection("admin");
      async.waterfall([
        (callback)=>{
          admin.find({username:username}).toArray((err,result)=>{
            if(err) throw err;
            if(result>0){
              callback(null,true);
            }else{
              callback(null,false);
            }
          })
        },
        (arg1,callback)=>{
          if(!arg1){
            console.log("未被注册，可以插入");
            var date = new Date();
            admin.insert({username:username,password:password,time:date},(err,result)=>{
              if(err) throw err;
              callback(null,"0");
            });
          }else{
            callback(null,"1");
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
      insertData(db,(result)=>{
        if(result=="0"){
          console.log("插入成功");
          res.redirect("/login");
        }else{
          console.log("插入失败");
          res.redirect("/register");
        }
        db.close();
      })
    })
});

router.post("/login",(req,res)=>{
  var username = req.body.username;
  var password = req.body.password;
  var identify = req.body.identify;
  //查询管理员
  var selectAdmin = function(db,callback){
    var admin = db.collection("admin");
    var data = ({username:username,password:password});
    admin.find(data).toArray((err,result)=>{
      if(err) throw err;
      callback(result);
    });
  };

  //查询学生
  var selectStu = function(db,callback){
    var stu = db.collection("stu");
    var data = ({name:username});
    stu.find(data).toArray((err,result)=>{
      if(err) throw err;
      callback(result);
    });
  };

  conn.getDb((err,db)=>{
    if(err) throw err;
    console.log("数据库连接成功");
    if(identify=="admin"){
      selectAdmin(db,(result)=>{
        if(result.length>0){
          req.session.username = username;
          req.session.password = password;
          res.render("index",{username:req.session.username,title:"首页",password:password});
        }else{
          res.send(`<script>alert("用户名或密码错误,请重新输入");location.href='/login'</script>`)
        }
        db.close();
      })
    }
    if(identify=="student"){
      selectStu(db,(result)=>{
        if(result.length>0){
          req.session.username = username;
          
          res.render("details",{title:"首页",username:req.session.username,result:result[0]});
        }else{
          res.send(`<script>alert("用户名或密码错误,请重新输入");location.href='/login'</script>`)
        }
        db.close();
      })
    }
    if(identify==undefined){
      res.send(`<script>alert("请完善信息");location.href='/login'</script>`)
    }
  })
});
//学生登录--更新学生信息
router.post("/update",(req,res)=>{
  var username = req.session.username;
  var password = req.body.rpwd;
  var age = req.body.rage;
  var sex = req.body.rsex;
  var major = req.body.rmajor;
  var banji = req.body.rbanji;
  console.log(major,banji);
  if(username){
      conn.getDb((err,db)=>{
          if(err) throw err;
          console.log("数据库===stu==连接成功");
          var stu = db.collection("stu");
          stu.updateOne(
              {name:username},
              {$set:{   
                  pwd:password,
                  age:age,
                  sex:sex,
                  major:major,
                  banji:banji
              }},
              (err,result)=>{
                  if(err) throw err;
                  res.redirect("/details");
                  db.close();
              }
          )
      });
  }else{
      res.send(`<script>alert('session已经过期,请重新登录!');location.href='/login'</script>`);
  }
});



module.exports = router;
