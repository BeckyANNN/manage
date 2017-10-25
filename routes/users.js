var express = require('express');
var router = express.Router();

var conn = require("../utils/conn");

var async = require("async");

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});


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

  var selectData = function(db,callback){
    var admin = db.collection("admin");
    var data = ({username:username,password:password});
    admin.find(data).toArray((err,result)=>{
      if(err) throw err;
      callback(result);
    })
  }

  conn.getDb((err,db)=>{
    if(err) throw err;
    console.log("数据库连接成功");
    selectData(db,(result)=>{
      if(result.length>0){
        req.session.username = username;
        req.session.password = password;
        console.log(req.session.username);
        res.redirect("/");
      }else{
        res.send(`<script>alert("用户名或密码错误,请重新输入");location.href='/login'</script>`)
      }
      db.close();
    })
  })
})
module.exports = router;
