var express = require("express");
var async = require("async");
var router = express.Router();
var mongodb = require("mongodb");
var conn = require("../utils/conn");

var fs = require("fs");

router.get("/index",(req,res)=>{
    res.send("信息模块");
});

router.post("/addstu",(req,res)=>{
    var name = req.body.name;
    var pwd = req.body.pwd;
    var age = req.body.age;
    var sex = req.body.sex;
    var major = req.body.major;
    var banji = req.body.banji;

    var insertData = function(db,callback){
        var stu = db.collection("stu");
        async.waterfall([
            (callback)=>{
                stu.find({name:name}).toArray((err,result)=>{
                    if(err) throw err;
                    if(result.length>0){
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
                    stu.insert({name:name,pwd:pwd,age:age,sex:sex,major:major,banji:banji},(err,result)=>{
                        if(err) throw err;
                        callback(null,"0");
                    })
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
                console.log("数据插入成功");
                res.redirect("/stuinfo");
            }else{
                console.log("数据插入失败");
                res.redirect("/addstu");
            }
        })
    })
});

router.get("/delete",(req,res)=>{
    var name = req.query.name;
    var username = req.session.username;
    if(username){
        conn.getDb((err,db)=>{
            if(err) throw err;
            var stu = db.collection("stu");
            stu.removeOne({name:name});
           /*  res.render("/stuinfo"); */
            db.close();
        })
    }
})
module.exports = router;
