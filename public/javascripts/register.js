
var username = $("#username");
var boo = false;
username.on("blur",function(){
    var reg_name = /^[a-zA-Z0-9/_/-]{4,16}$/;
    if(reg_name.test(username.val())){
        $("span").eq(0).text("");
        boo = true;
    }else{
        if(username.val().length<4||username.val().length>16){
            $("span").eq(0).text("用户名在4-16位之间");
        }else{
            $("span").eq(0).text("请输入由字母，数字，下划线，-组成的用户名");
        }
        boo = false;
    }
})

var password = $("#password");
password.on("blur",function(){
    var reg_pwd = /^(\w){4,10}$/;
    if(reg_pwd.test(password.val())){
        $("span").eq(1).text("");
        boo = true;
    }else{
        if(password.val().length<4||password.val().length>10){
            $("span").eq(1).text("用户名在4-10位之间");
        }else{
            $("span").eq(1).text("请输入由字母，数字或下划线组成的密码");
        }
        boo = false;
    }
});

//确认密码
var con = $("#confirm");
con.on("blur",function(){
    if(con.val()!=password.val()){
        boo=false;
        $("span").eq(2).text("输入密码不一致");
    }else{
        $("span").eq(2).text("");
        boo = true;
    }
})


$("form").submit(function(e){
    if(boo&&$("span").text()==""){
        $("button").css({color:"#333"});
    }else{
        e.preventDefault();
        alert("请完善信息");
    }
    console.log()
})

