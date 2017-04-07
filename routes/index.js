var express = require('express');
var sche = require('node-schedule');
var router = express.Router();
var orm = require('orm');
var opts = {
  database : "rentpay",
  protocol : "mysql",
  host : "127.0.0.1",
  username : "root",
  password : "...",
  query : {
    pool : true
  }
}

var rule = new sche.RecurrenceRule();
//rule.dayOfWeek = [0,1,2,3,4,5,6];
//rule.hour = 23;
//rule.minute = 59;

//test
var times = [];
for(i=0;i<60;i=i+1)
  times[i]=i*1;
rule.second  = times;

var Hard;
orm.connect(opts,function(err,db){
  Hard = db.define("control",{
    hroom : String,
    days : Number,
    state : Boolean,
    op : Boolean
  })
})

var j = sche.scheduleJob(rule,function(){
  Hard.find({op:true}, function(err,r){
    if(r!=undefined){
      var l = r.length;
      var i = 0;
      for(;i<l;i++) {
        if (r[i].days > 0) {
          r[i].days = r[i].days - 1;
          r[i].save(function (err) {
          });
        }
      };
    }
  });
});


router.post('/open', function(req,res){
  Hard.find({state:true}, function(err,r){
    if(r!=undefined){
      var l = r.length;
      var i = 0;
      var obj = {};
      for(;i<l;i++) {
        obj[i] = {roomnum: r[i].hroom};
        r[i].state = false;
        r[i].save(function(err){});
      };
      if(l==0)
        res.send('false');
      else
        res.send(obj);
    }else
      res.send('false');
  });
});

router.post('/close', function(req,res){
  Hard.find({days:0,op:true}, function(err,r){
    if(r!=undefined){
      var l = r.length;
      var i = 0;
      var obj = {};
      for(;i<l;i++) {
        obj[i] = {roomnum: r[i].hroom};
        r[i].op = false;
        r[i].save(function(err){});
      };
      if(l==0)
        res.send('false');
      else
        res.send(obj);
    }else
      res.send('false');
  });
});


/* GET home page. */
router.get('/', function(req, res, next) {
  req.session.destroy(function(err) {
  });
  res.render('index',{error:''});
});

router.get('/contact', function(req, res, next) {
  res.render('contact',{s:'var a = false'});
});

router.get('/notice_mod', function(req, res, next) {
  res.render('notice_mod');
});

router.get('/register', function(req, res, next) {
  res.render('register',{error:''});
});

router.get('/register_sec', function(req, res, next) {
  res.render('register_sec');
});

router.get('/register_thr', function(req, res, next) {
  res.render('register_thr');
});

router.post('/register', function(req, res, next){
  orm.connect(opts, function(err,db){
    if(err)throw err;

    var User = db.define("users",{
      username: String,
      password: String,
      tname: String,
      phone: String,
      num: String,
      mail: String,
      room: String
    });

    var un = req.body.username;
    req.session.reg_un = un;
    req.session.reg_pw = req.body.password;

    User.exists({username:un}, function(err,judge) {
      if(judge){
        res.render('register',{error:"err()"});//用户名已存在
      }else{
        res.redirect('/register_sec');
      };
    });
  });
});

router.post('/register_sec',function(req,res,next){
  orm.connect(opts, function(err,db){
    if(err)throw err;

    var User = db.define("users",{
      username: String,
      password: String,
      tname: String,
      phone: String,
      num: String,
      mail: String,
      room: String
    });

    var un = req.session.reg_un;
    var pw = req.session.reg_pw;
    var na = req.body.tname;
    var ph = req.body.phone;
    var nu = req.body.number;
    var ro = ''+req.body.dong1+req.body.dong2+'-'+req.body.ceng+req.body.shi1+req.body.shi2;

    if(!un)
      res.redirect('/');
    else{
      var newUser = {};
      newUser.username = un;
      newUser.password = pw;
      newUser.tname = na;
      newUser.phone = ph;
      newUser.num = nu;
      newUser.room = ro;
      newUser.mail = '';

      req.session.username = newUser.username;
      req.session.tname = newUser.tname;
      req.session.phone = newUser.phone;
      req.session.num = newUser.num;
      req.session.room = newUser.room;
      req.session.mail = newUser.mail;

      User.create(newUser, function(err, results) {
        if(err)throw err;
      });
      User.sync(function(err){
        console.log('Renew User table successfully!');
      });
      res.redirect('/register_thr');
    }
  });
});

router.post('/register_thr', function(req, res, next) {
  res.redirect('/user');
});

router.post('/',function(req, res, next){
  orm.connect(opts, function(err,db) {
    if (err)throw err;

    var User = db.define("users", {
      username: String,
      password: String,
      tname: String,
      phone: String,
      num: String,
      mail: String,
      room: String
    });

    var loun = req.body.login_user;
    var lopw = req.body.login_pass;

    User.find({username:loun}, function(err,u){
      if(u == undefined)
        res.render('index',{error:"<script>alert('鐢ㄦ埛鍚嶄笉瀛樺湪!')</script>"});//用户不存在,请注册!
      else if(u.length==1){
        if(u[0].password==lopw){
          req.session.username = loun;
          res.redirect('/user');
        }else
          res.render('index',{error:"<script>alert('瀵嗙爜閿欒! ');</script>"})//密码错误!
      }else
        res.render('index',{error:"<script>alert('鐢ㄦ埛鍚嶄笉瀛樺湪!')</script>"});//用户不存在,请注册!
    });
  });
});

router.post('/contact',function(req,res,next){
  orm.connect(opts,function(err,db){
    if(err)throw err;

    var Contact = db.define("contact",{
      cname : String,
      cmail : String,
      ccontent: String
    });

    var cn = req.body.username;
    var cm = req.body.mail;
    var len = req.body.contact.length;
    console.log(len);
    if(len<250)
      var ccon = req.body.contact;
    else
      var ccon = '';

    var newContact = {};
    newContact.cname = cn;
    newContact.cmail = cm;
    newContact.ccontent = ccon;
    Contact.create(newContact, function(err, results) {
      if(err)throw err;
    });
    res.render('contact',{s:"var a = true"});
    Contact.sync(function(err){
      console.log('Renew User table successfully!');
    });
  });
});



//after login
router.get('/user',function(req,res){
  if(req.session.paystate){
    req.session.paystate = false;
    res.render('user',{username: req.session.username,room: req.session.room,f: "s();"});
  } else if(req.session.change){
    req.session.change = false;
    res.render('user',{username: req.session.username,room: req.session.room,f: "c();"});
  } else if(req.session.username){
    orm.connect(opts, function(err,db) {
      if (err)throw err;

      var User = db.define("users", {
        username: String,
        room: String
      });

      User.find({username: req.session.username}, function (err, u) {
        var ro = u[0].room;
        req.session.room = ro;
        res.render('user', {username: req.session.username,room:ro,f: ''});
      });
    });
  }else
    res.redirect('/');
});

router.post('/user',function(req,res){
  orm.connect(opts, function(err,db) {
    if (err)throw err;

    req.session.month = req.body.month;
    req.session.payway = req.body.pay_way;
    req.session.money = req.body.month*50;

    var Control = db.define("control", {
      hroom: String
    });

    Control.exists({hroom:req.session.room }, function (err, ju) {
      if(!ju)
        res.render('user', {username: req.session.username,room: req.session.room,f: "f();"});
      else
        res.render('userpay',{username:req.session.username,room:req.session.room,month:req.session.month,payway:req.session.payway,money:req.session.money});
    });
  });
});

router.post('/userpay',function(req,res){
  orm.connect(opts, function(err,db) {
    if (err)throw err;

    var Pay = db.define("pays", {
      username: String,
      room: String,
      month:Number,
      payway:String,
      money:Number,
      paydate:String
    });

    var newPay = {};
    newPay.username = req.session.username;
    newPay.room = req.session.room;
    newPay.month = req.session.month;
    newPay.payway = req.session.payway;
    newPay.paydate = new Date();
    newPay.money = req.session.money;

    Pay.create(newPay, function (err, results) {
      if (err)throw err;
    });
    Pay.sync(function (err) {
      console.log('Renew User table successfully!');
    });

    var Control = db.define('control',{
      hroom: String,
      days: Number,
      state: Boolean,
      op: Boolean
    });

    Control.find({hroom:newPay.room},function(err,u){
      u[0].state = true;
      u[0].days += newPay.month*30;
      u[0].op = true;
      u[0].save(function(err){});
    });

    req.session.paystate = true;
    res.redirect('/user');
  });
});

router.get('/timesearch',function(req,res){
  if(req.session.username){
    res.render('timesearch', {username: req.session.username});
  }else
    res.redirect('/');
});

router.post('/searchday',function(req,res){
  var ro = req.body.room;
  orm.connect(opts, function(err,db) {
    if (err)throw err;

    var C = db.define("control",{
      hroom: String,
      days: Number,
      state: Boolean,
      op: Boolean
    });

    C.find({hroom:ro}, function(err,u){
      var d = '' + u[0].days;
      res.send(d);
    });

  });
});

router.get('/userinfo',function(req,res){
  if(req.session.username){
    orm.connect(opts, function(err,db) {
      if (err)throw err;

      var User = db.define("users", {
        username: String,
        password: String,
        tname: String,
        phone: String,
        num: String,
        mail: String,
        room: String
      });

      User.find({username:req.session.username}, function(err,u){
        var na = u[0].tname;
        var nu = u[0].num;
        var ph = u[0].phone;
        var ro = u[0].room;
        var ma = u[0].mail;
        res.render('userinfo',{username:req.session.username,name:na,num:nu,phone:ph,room:ro,mail:ma});
      });

    });
  }
  else
    res.redirect('/');
});

router.get('/passchange',function(req,res){
  if(req.session.username)
    res.render('passchange',{username:req.session.username,error:''});
  else
    res.redirect('/');
});

router.get('/infochange',function(req,res){
  if(req.session.username){
    orm.connect(opts, function(err,db) {
      if (err)throw err;

      var User = db.define("users", {
        username: String,
        password: String,
        tname: String,
        phone: String,
        num: String,
        mail: String,
        room: String
      });

      User.find({username:req.session.username}, function(err,u){
        var un = u[0].username;
        var na = u[0].tname;
        var nu = u[0].num;
        var ph = u[0].phone;
        var ma = u[0].mail;
        if(ma=='')
          res.render('infochange',{username:un,name:'value='+na,num:'value='+nu,phone:'value='+ph,mail:'',room:req.session.room});
        else
          res.render('infochange',{username:un,name:'value='+na,num:'value='+nu,phone:'value='+ph,mail:'value='+ma,room:req.session.room});
      });

    });
  }
  else
    res.redirect('/');
});

router.get('/roomchange',function(req,res){
  if(req.session.username){
    orm.connect(opts, function(err,db) {
      if (err)throw err;

      var User = db.define("users", {
        username: String,
        password: String,
        tname: String,
        phone: String,
        num: String,
        mail: String,
        room: String
      });

      User.find({username:req.session.username}, function(err,u){
        var un = u[0].username;
        var na = u[0].tname;
        var nu = u[0].num;
        var ph = u[0].phone;
        var ma = u[0].mail;
        if(ma=='')
          res.render('roomchange',{username:un,name:'value='+na,num:'value='+nu,phone:'value='+ph,mail:''});
        else
          res.render('roomchange',{username:un,name:'value='+na,num:'value='+nu,phone:'value='+ph,mail:'value='+ma});
      });

    });
  }
  else
    res.redirect('/');
});

router.post('/passchange', function(req,res){
  orm.connect(opts,function(err,db){
    if(err) throw err;

    var User = db.define("users",{
      username:String,
      password:String,
      room:String
    });

    var opass = req.body.origin_pass;
    var npass = req.body.new_pass;
    User.find({username:req.session.username,password:opass},function(err,u){
      if(u[0] == undefined)
        res.render('passchange',{username:req.session.username,error:"a()"})
      else{
        req.session.password = npass;
        u[0].password = npass;
        u[0].save(function(err){});
        req.session.change = true;
        res.redirect('/user');
      }
    });
  });
});

router.post('/infochange', function(req,res){
  orm.connect(opts, function(err,db){
    if(err)throw err;

    var User = db.define("users",{
      username:String,
      password:String,
      tname: String,
      phone: String,
      num: String,
      mail: String,
      room: String
    });

    var tn = req.body.myname;
    var ph = req.body.myphone;
    var nu = req.body.mynum;
    var ma = req.body.mymail;

    req.session.tname = tn;
    req.session.phone = ph;
    req.session.num = nu;
    req.session.mail = ma;

    User.find({username:req.session.username}, function (err,u) {
      u[0].tname = tn;
      u[0].phone = ph;
      u[0].num = nu;
      u[0].mail = ma;

      u[0].save(function(err){});
    });
    req.session.change = true;
    res.redirect('/user');
  });
});

router.post('/roomchange', function(req,res){
  orm.connect(opts, function(err,db){
    if(err)throw err;

    var User = db.define("users",{
      username:String,
      password:String,
      tname: String,
      phone: String,
      num: String,
      mail: String,
      room: String
    });

    var tn = req.body.myname;
    var ph = req.body.myphone;
    var nu = req.body.mynum;
    var ma = req.body.mymail;
    var ro = ''+req.body.dong1+req.body.dong2+'-'+req.body.ceng+req.body.shi1+req.body.shi2;

    req.session.room = ro;

    User.find({username:req.session.username}, function (err,u) {
      u[0].tname = tn;
      u[0].phone = ph;
      u[0].num = nu;
      u[0].mail = ma;
      u[0].room = ro;
      u[0].save(function(err){});
    });
    req.session.change = true;
    res.redirect('/user');
  });
});

router.get('/history',function(req,res){
  if(req.session.username){
      res.render('history');
  }
  else
    res.redirect('/');
});

router.post('/historydata',function(req,res,err){
  orm.connect(opts,function(err,db){
    if (err) throw  err;

    var Pay = db.define("pays", {
      username: String,
      room: String,
      month:Number,
      payway:String,
      money:Number,
      paydate:String
    });

    Pay.find({username:req.session.username},function(err,p){
      res.send(p);
    })
  });
});

//router.get('/c',function(req,res){
//  orm.connect(opts, function(err,db){
//    if(err)throw err;
//
//    var C = db.define("control",{
//      hroom: String,
//      days: Number,
//      state: Boolean,
//      op: Boolean
//    });
//
//    C.sync(function(err){
//      console.log('Renew User table successfully!');
//    });
//  });
//});

module.exports = router;
