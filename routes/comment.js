var express = require("express");
var async = require("async");
var router = express.Router();
var mongodb = require("mongodb");
var conn = require("../utils/conn");
var obj = mongodb.ObjectID;
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
//删除学生信息
router.get("/delete",(req,res)=>{
    var name = req.query.name;
    var username = req.session.username;
    if(username){
        conn.getDb((err,db)=>{
            if(err) throw err;
            var stu = db.collection("stu");
            stu.removeOne({name:name});
            var select = db.collection("select");
            select.deleteMany({username:name});
           res.send("0");
            db.close();
        })
    }
   /*  res.redirect("/addstu"); */
});

//修改学生信息
router.get("/update",(req,res)=>{
    var id = req.query.id;
    id = new obj(id);
    var name = req.query.name;
    var pwd = req.query.pwd;
    var age = req.query.age;
    var sex = req.query.sex;
    var major = req.query.major;
    var banji = req.query.banji;
    var username = req.session.username;
    if(username){
        conn.getDb((err,db)=>{
            if(err) throw err;
            console.log("数据库======连接成功");
            var stu = db.collection("stu");
            stu.updateOne(
                {_id:id},
                {$set:{
                    name:name,
                    pwd:pwd,
                    age:age,
                    sex:sex,
                    major:major,
                    banji:banji
                }},
                (err,result)=>{
                    if(err) throw err;
                    console.log("修改成功");
                    db.close();
                }
            )
        });
    }else{
        res.send(`<script>alert('session已经过期,请重新登录!');location.href='/login'</script>`);
    }
});

//添加课程
router.post("/addcourse",(req,res)=>{
    var username = req.session.username;
    var cname = req.body.name;
    var ctime = req.body.ctime;
    var credit = req.body.credit;
    var insertData = function(db,callback){
        var course = db.collection("course");
        async.waterfall([
            (callback)=>{
                course.find({cname:cname}).toArray((err,result)=>{
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
                    console.log("可以插入");
                    var date = new Date().toLocaleDateString();
                    course.insert({cname:cname,ctime:ctime,credit:credit,date:date},(err,result)=>{
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
        console.log("数据库连接成功==course");
        insertData(db,(result)=>{
            if(result=="0"){
                console.log("插入成功");   
            }else{
                console.log("插入失败");
            }
            res.redirect("/addcourse");
        })
    })
});

//删除course
router.get("/deletecourse",(req,res)=>{
    var cname = req.query.cname;
    var username = req.session.username;
    if(username){
        conn.getDb((err,db)=>{
            if(err) throw err;
            var cou = db.collection("course");
            cou.deleteOne({cname:cname});
            var select = db.collection("select");
            select.deleteMany({cname:cname});
            res.send("0");
            db.close();
        })
    }else{
        res.send(`<script>alert('session已经过期,请重新登录!');location.href='/login'</script>`);
    }
    

});
//更新course
router.get("/updatecourse",(req,res)=>{
    var id = req.query.id;
    id = new obj(id);
    var cname = req.query.cname;
    var ctime = req.query.ctime;
    var credit = req.query.credit;
    var username = req.session.username;
    if(username){
        conn.getDb((err,db)=>{
            if(err) throw err;
            console.log("数据库====course==连接成功");
            var cou = db.collection("course");
            var date = new Date().toLocaleDateString();
            cou.updateOne(
                {_id:id},
                {$set:{
                    cname:cname,
                    ctime:ctime,
                    credit:credit,
                    date:date
                }},
                (err,result)=>{
                    if(err) throw err;
                    console.log("修改成功");
                    res.send("修改成功");
                    db.close();
                }
            )
        });
    }else{
        res.send(`<script>alert('session已经过期,请重新登录!');location.href='/login'</script>`);
    }
});

//学生选课
router.get("/select",(req,res)=>{
    var username = req.session.username;
    var cname = req.query.cname;
    var flag = false;
    var insertData = function(db,callback){
        var select = db.collection("select");
        async.waterfall([
            (callback)=>{
                for(var i in cname){
                    select.find({cname:cname[i]}).toArray((err,result)=>{
                        if(err) throw err;
                        if(result.length>0){
                            flag = true;
                        }else{
                            flag = false;
                        }
                    })
                }
                callback(null,flag);
            },
            (arg1,result)=>{
                if(!arg1){
                    console.log("可以插入");
                    var date = new Date().toLocaleDateString();
                    for(var i in cname){
                        select.insert({cname:cname[i],username:req.session.username,date:date,grade:-1},(err,result)=>{
                            if(err) throw err;    
                            callback(null,"0");                        
                        });
                    }
                    
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
        console.log("数据库==select==查询成功");
        insertData(db,(result)=>{
            if(result=="0"){
                console.log("插入成功");
            }
            if(result=="1"){
                console.log("插入失败");
            }
            db.close();
        })
        res.redirect("/selectcourse");
    })
});
//退选
router.get("/reselect",(req,res)=>{
    var username = req.session.username;
    var cname = req.query.cname;
    conn.getDb((err,db)=>{
        if(err) throw err;
        console.log("数据库连接成功");
        var select = db.collection("select");
        select.deleteOne({cname:cname,username:username});
        res.send("0");
        db.close();
    })
});


//查询学生选的课程信息
router.get("/searchcou",(req,res)=>{
    var username = req.session.username;
    var name = req.query.name;
    var findData = function(db,callback){
        var select = db.collection("select");
        var cou = db.collection("course");
        var arr = [];
        var content = [];
        var grade = [];
        async.waterfall([
            (callback)=>{
                select.find({username:name},{_id:0}).toArray((err,result)=>{
                   for(var i in result){
                    arr.push(result[i].cname);
                    grade.push(result[i].grade);
                   }
                    callback(null,arr);
                })
            },
            (arg,callback)=>{
                cou.find({cname:{$in:arg}}).toArray((err,result)=>{
                    if(err) throw err;
                    console.log("查询成功");
                    callback(null,result);
                    
                })   
            }
        ],(err,result)=>{
            if(err) throw err;
            for(var i=0; i<result.length;i++){
                for(var j=0; j<grade.length; j++){
                    if(result[i].cname==arr[j]){
                        result[i].grade = grade[j];
                    }
                }
            }   
            callback(result);
        })
    }
    conn.getDb((err,db)=>{
        if(err) throw err;
        console.log("数据库连接成功");
        
        findData(db,(result)=>{
            res.send(result);
        })
    })
});

//查询选某门课程的学生
router.get("/searchstu",(req,res)=>{
    var username = req.session.username;
    var cname = req.query.cname;
  
    conn.getDb((err,db)=>{
        if(err) throw err;
        console.log("数据库连接成功");
        var select = db.collection("select");
        select.find({cname:cname},{_id:0}).toArray((err,result)=>{
            if(err) throw err;
            res.send(result);
        })
    })
});
//修改成绩
router.get("/addscore",(req,res)=>{
    var username = req.session.username;
    var score = req.query.score;
    
    var name = req.query.username;
    var cname= req.query.cname; 

    conn.getDb((err,db)=>{
        if(err) throw err;
        var select = db.collection("select");
        console.log("数据库连接成功");
        var date = new Date().toLocaleDateString();
        for(var i=0; i<name.length; i++){
            select.updateOne({username:name[i],cname:cname[i]},{
                $set:{grade:score[i],date:date}
            },(err,result)=>{
                
            });
        }
        res.send("0");
        db.close();
        
    });
});
module.exports = router;

