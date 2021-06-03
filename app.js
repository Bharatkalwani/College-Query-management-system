//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose=require("mongoose");
const md5=require("md5");//level 3
const nodemailer = require('nodemailer');//email sending

let posts=[];

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

//database connection
mongoose.connect("mongodb://localhost:27017/projectDB",{ useNewUrlParser:true});

// student register and login schema
const userSchema=new mongoose.Schema({
email:String,
password:String,
status:Number,
token:String
});

// login tch schema
const teacherlogin=new mongoose.Schema({
  teacher_name:String,
  email:String,
  password:String,
  status:Number,
  token:String
  });
  
 // Parents register and login schema
 const parentSchema=new mongoose.Schema({
  email:String,
  password:String,
  status:Number,
  token:String
  });

// Management register and login schema
const manageSchema=new mongoose.Schema({
  email:String,
  password:String,
  status:Number,
  token:String
  });

  
  // Admin register and login schema
const adminSchema=new mongoose.Schema({
  email:String,
  password:String
  });
  
  //reply schema
const replySchema={  
  teacher_name:String,
  desc:String,
  total:Number  //for count 
  };
  
//compose schema for  hostel complain
const hostelSchema={
  email:String,
  name:String,
  hostel_no:String,
  room_no:String,
  content:String,
  year:Number,
  replyHostel:Array,
};
  
//compose schema for  college complain
const collegeSchema={
  email:String,
  name:String,
  title:String,
  content:String,
  teacher:String,
  branch:String,
  section:String,
  year:Number,
  reply: Array,
};

//compose schema for  teacher complain
const teacherSchema={
  name:String,
  title:String,
  content:String,
  branch:String,
  year:Number,
  section:String
};

//compose schema for  suggestion complain

 const suggestionSchema={
   name:String,
  title:String,
  content:String,
  branch:String,
  year:Number,
  section:String
 };

//compose schema for  parents complain
const parentsSchema={
  email:String,
  name:String,
  title:String,
  content:String,
  mobile:Number,
  replyParent: Array
};



const loginS=mongoose.model("loginS",userSchema);//student collection for login crential   
const Hostel=mongoose.model("Hostel",hostelSchema); //Complain collection name
 const College=mongoose.model("College",collegeSchema); //Complain collection name
 const Teacher=mongoose.model("Teacher",teacherSchema);//complain Teacher name
 const loginParent=mongoose.model("loginParent",parentSchema);//Parents collection for login crential
 const Parent=mongoose.model("Parent",parentsSchema);//complain Parent name
 const Suggestion=mongoose.model("Suggestion",suggestionSchema);
 const Feedback=mongoose.model("Feedback",replySchema);//feedback or reply
 const Management=mongoose.model("Management",manageSchema);
 const loginTcher=mongoose.model("loginTcher",teacherlogin);//loginTch collection for login crential
 const loginAdmin=mongoose.model("loginAdmin",adminSchema);//admin collection for login crential

// const newDoc =  await Parent.findOneAndUpdate({_id: id}, {replyParent: [{teacherName, replyMessage}]}, {new: true});
      
//for register
app.post("/registerStd", function(req,res){
  var pass=req.body.password;
  console.log('password is '+pass)
const newUser=new loginS({
email:req.body.username,
password:md5(req.body.password),
status:0,
token:""

});
newUser.save(function(err){
if(err)
{
  console.log(err);
}else{
    console.log("email is "+newUser.email);
  let transport = nodemailer.createTransport({
	
		service: "Gmail",
		auth: {
		   user: 'kalwanibharat40@gmail.com',
		   pass: '8852967270'
		}
	});

	const message = {
		from: 'kalwanibharat40@gmail.com', // Sender address
		to: newUser.email,         // List of recipients
		subject: 'Git Login Credentials For Complain Portal ', // Subject line
		
    html:'<p>Hello student please check the email and password for college complain portal.</p><p>Email id - </p>'+newUser.email+'<p>password </p>'+pass+'<p>Please change you password as soon as possible</p><h2>THANK YOU</h2>'
	};
  transport.sendMail(message, function(err) {

		if (err) {
      res.send(err);
		} else {
		  console.log("email sent");
      res.render("registered");  
		}
	});

  //res.render("registered");
}
  });

});

//for login student
app.post("/loginStd", function(req, res){
    const user=req.body.username;
  const pass=md5(req.body.password);
  
  loginS.findOne({email: user}, (err, userData) => {
   console.log("userdata is "+userData);
    if(userData==null){
        res.render('loginStd', {msg: 'Email Does Not Match', error: true});
    }else{
      if(userData !== null && userData.password === pass){
        
        if(userData.status==0)
        {
          res.render("updatePasswordStd", {error: false, msg: '',email:userData.email});
                 
        }
        else{
                //res.render("student");
        Hostel.find({},function(err,students){   //before any method of moongoose we use document variable
          posts=students;
        res.render("homeStd",{
                  posts:posts ,email:userData.email  });
                  });

        }
        

      }else{
        res.render('loginStd', {msg: ' Password Does Not Match', error: true});
      }
    }
  })
  });

 //updatePassword for student

app.post("/UpdatePasswordStd/:email",   function(req, res){
  var email=[req.params.email]
  //console.log(email);
const new_pass=md5(req.body.new_password);
//console.log("new passs is "+new_pass)

const confirm_pass=md5(req.body.confirm_password);
//console.log("new pass is "+confirm_pass);

if(new_pass===confirm_pass)
{
 loginS.findOneAndUpdate({email:email},{password:confirm_pass,status:1},{new:true},(err,result)=>{
if(err)
{ console.log("error is "+err)
  res.render('updatePasswordStd', {msg: ' Password Does Not Match', error: true,email:email});
}
else{

  console.log("result is "+result);
 // res.render("student");
 Hostel.find({},function(err,students){   //before any method of moongoose we use document variable
  posts=students;
res.render("homeStd",{
          posts:posts,email:email   });
          });

}

});

}

else{
  res.render('updatePasswordStd', {msg: ' Password Does Not Match', error: true,email:email});
}

});


//for forget email student
app.post("/forgetEmailStd", function(req, res){
  const email=req.body.username;
//const pass=md5(req.body.password);

loginS.findOne({email: email}, (err, userData) => {
 console.log("userdata is "+userData);
  if(userData==null){
      res.render('forgetEmailStd', {msg: 'Email Does Not Match', error: true});
  }else{
   
   var length=6;
   var token = "";
	 var charset = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
		for( var i=0; i < length; i++ )
    token += charset.charAt(Math.floor(Math.random() * charset.length));
         console.log("token is "+token);

         loginS.findOneAndUpdate({email:email},{token:token},{new:true},(err,result)=>{
           if(result==null)
           {
                 console.log("token err"+err)
           }
           else{

             console.log("token update result is "+result)
             let transport = nodemailer.createTransport({
	
              service: "Gmail",
              auth: {
                 user: 'kalwanibharat40@gmail.com',
                 pass: '8852967270'
              }
            });
          
            const message = {
              from: 'kalwanibharat40@gmail.com', // Sender address
              to: result.email,         // List of recipients
              subject: 'Reset Password Token ', // Subject line
              
              html:'<p>Hello student here is token number for reset password .</p>'+result.token+'<h2>THANK YOU</h2>'
            };
            transport.sendMail(message, function(err) {
          
              if (err) {
                res.send(err);
              } else {
                console.log("email sent");
                //alert("email sent successfully")
                res.render("forgetPassStd",{msg: 'Token  is sent to your email box.', error: true});  
              }
            });
           }
          });

  }
})
});

//for forget reset password student

app.post("/forgetPassStd",   function(req, res){
  var data=req.body;
  console.log(data)

const new_pass=md5(req.body.new_password);
console.log("new passs is "+new_pass)

const confirm_pass=md5(req.body.confirm_password);
console.log("confirm pass is "+confirm_pass);

loginS.findOne({token: data.token}, (err, userData) => {

  if(userData==null)
  {  
    res.render('forgetPassStd', {msg: 'Please Enter the valid token sent in your email id', error: true});
  }
  else{
    console.log("else token part")

    if(new_pass===confirm_pass)
{
  console.log("new pass enter")
 loginS.findOneAndUpdate({token:userData.token},{password:confirm_pass,token:""},{new:true},(err,result)=>{
if(err)
{ 
  console.log("error is "+err)
  res.render('forgetPassStd', {msg: ' Password Does Not Match', error: true});
}
else{

  console.log("result is "+result);
  res.render("home");
}

});

}
  
else{
  res.render('forgetPassStd', {msg: ' Password Does Not Match', error: true});
}


  }

});

});


app.post("/registerTch",function(req,res){
  var pass=req.body.password;
  const newUser2=new loginTcher({
    teacher_name:req.body.teacher_name,
  email:req.body.username,
  password:md5(req.body.password),
  status:0,
  token:""
  
  });
  
  newUser2.save(function(err){
  if(err)
  {
    console.log(err);
  }
  else{
    console.log("email is "+newUser2.email);
  
      let transport = nodemailer.createTransport({
    
      service: "Gmail",
      auth: {
         user: 'kalwanibharat40@gmail.com',
         pass: '8852967270'
      }
    });
  
    const message = {
      from: 'kalwanibharat40@gmail.com', // Sender address
      to: newUser2.email,         // List of recipients
      subject: 'Git Login Credentials For Complain Portal ', // Subject line
        html:'<p>Hello teacher please check the email and password for college complain portal.</p><p>Email id - </p>'+newUser2.email+'<p>password </p>'+pass+'<p>Please change you password as soon as possible</p><h2>THANK YOU</h2>'
    
    };
  
    transport.sendMail(message, function(err) {
  
      if (err) {
              res.send(err);
      } else {
        console.log("email sent");
        res.render("registered");  
      }
   
    });
  
  }
  });
  
  });
    
  
  //for login teacher
  app.post("/loginTch", function(req, res){
   // const name=req.body.teacher_name;
    const user=req.body.username;
    const pass=md5(req.body.password);
    
    loginTcher.findOne({email: user}, (err, userData) => {
      //console.log(userData==null)
      // console.log(userData)
      if(userData==null){
        // res.send('Something Went Wrong')
          res.render('loginTch', {msg: 'Username Password Does Not Match', error: true});
      }else{
        //console.log("teacher name is "+userData.teacher_name)
        if(userData !== null && userData.password === pass){

          if(userData.status==0)
          {
            res.render("updatePasswordTch", {error: false, msg: '',email:userData.email});
                   
          }
          else{
            Teacher.find({},function(err,teachers){   //before any method of moongoose we use document variable
              posts=teachers;
              
            res.render("homeTch",{
                      posts:posts ,name:userData.teacher_name });
                      
                      });
          }

        }else{
          res.render('loginTch', {msg: 'Username Password Does Not Match', error: true});
        }
      }
    })
    });
  

 //updatePassword for teacher

 app.post("/UpdatePasswordTch/:email",   function(req, res){
  var email=[req.params.email]
  console.log("techer mail is "+email);
const new_pass=md5(req.body.new_password);
//console.log("new passs is "+new_pass)

const confirm_pass=md5(req.body.confirm_password);
//console.log("new pass is "+confirm_pass);

if(new_pass===confirm_pass)
{
  loginTcher.findOneAndUpdate({email:email},{password:confirm_pass,status:1},{new:true},(err,result)=>{
if(err)
{ console.log("error is "+err)
  res.render('updatePasswordTch', {msg: ' Password Does Not Match', error: true,email:email});
}
else{

  console.log(" Teacher result is "+result);

 Teacher.find({},function(err,teachers){   //before any method of moongoose we use document variable userData.teacher_name
  posts=teachers;
  
res.render("homeTch",{
          posts:posts ,name:result.teacher_name });
          
          });
}

});

}

else{
  res.render('updatePasswordTch', {msg: ' Password Does Not Match', error: true,email:email});
}

});



//for forget email teacher
app.post("/forgetEmailTch", function(req, res){
  const email=req.body.username;
//const pass=md5(req.body.password);

loginTcher.findOne({email: email}, (err, userData) => {
 console.log("userdata is "+userData);
  if(userData==null){
      res.render('forgetEmailTch', {msg: 'Email Does Not Match', error: true});
  }else{
   
   var length=6;
   var token = "";
	 var charset = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
		for( var i=0; i < length; i++ )
    token += charset.charAt(Math.floor(Math.random() * charset.length));
         console.log("token is "+token);

         loginTcher.findOneAndUpdate({email:email},{token:token},{new:true},(err,result)=>{
           if(result==null)
           {
                 console.log("token err"+err)
           }
           else{

             console.log("token update result is "+result)
             let transport = nodemailer.createTransport({
	
              service: "Gmail",
              auth: {
                 user: 'kalwanibharat40@gmail.com',
                 pass: '8852967270'
              }
            });
          
            const message = {
              from: 'kalwanibharat40@gmail.com', // Sender address
              to: result.email,         // List of recipients
              subject: 'Reset Password Token ', // Subject line
              
              html:'<p>Hello teacher here is token number for reset password .</p>'+result.token+'<h2>THANK YOU</h2>'
            };
            transport.sendMail(message, function(err) {
          
              if (err) {
                res.send(err);
              } else {
                console.log("email sent");
                //alert("email sent successfully")
                res.render("forgetPassTch",{msg: 'Token  is sent to your email box.', error: true});  
              }
            });
           }
          });

  }
})
});

//for forget reset password teacher

app.post("/forgetPassTch",   function(req, res){
  var data=req.body;
  console.log(data)

const new_pass=md5(req.body.new_password);
console.log("new passs is "+new_pass)

const confirm_pass=md5(req.body.confirm_password);
console.log("confirm pass is "+confirm_pass);

loginTcher.findOne({token: data.token}, (err, userData) => {

  if(userData==null)
  {  
    res.render('forgetPassTch', {msg: 'Please Enter the valid token sent in your email id', error: true});
  }
  else{
    console.log("else token part")

    if(new_pass===confirm_pass)
{
  console.log("new pass enter")
  loginTcher.findOneAndUpdate({token:userData.token},{password:confirm_pass,token:""},{new:true},(err,result)=>{
if(err)
{ 
  console.log("error is "+err)
  res.render('forgetPassTch', {msg: ' Password Does Not Match', error: true});
}
else{

  console.log("result is "+result);
  res.render("home");
}

});

}
  
else{
  res.render('forgetPassTch', {msg: ' Password Does Not Match', error: true});
}


  }

});

});


  //for register Parent
  app.post("/registerParent",function(req,res){
    var pass=req.body.password
  const newUser=new loginParent({
  email:req.body.username,
  password:md5(req.body.password),
  status:0,
  token:""
  });
  newUser.save(function(err){
  if(err)
  {
    console.log(err);
  }else{

    let transport = nodemailer.createTransport({
	
      service: "Gmail",
      auth: {
         user: 'kalwanibharat40@gmail.com',
         pass: '8852967270'
      }
    });
  
    const message = {
      from: 'kalwanibharat40@gmail.com', // Sender address
      to: newUser.email,         // List of recipients
      subject: 'Git Login Credentials For Complain Portal ', // Subject line
     
      html:'<p>Hello teacher please check the email and password for college complain portal.</p><p>Email id - </p>'+newUser.email+'<p>Password </p>'+pass+'<p>Please change you password as soon as possible</p><h2>THANK YOU</h2>'
	
    };
    transport.sendMail(message, function(err) {
  
      if (err) {
        res.send(err);
      } else {
        console.log("email sent");
        res.render("registered");  
      }
    });
  
   // res.render("registered");
  }
    });
  
  });

  //for login parents
  app.post("/loginParent", function(req, res){
    const user=req.body.username;
    const pass=md5(req.body.password);
    
    loginParent.findOne({email: user}, (err, userData) => {
  
      if(userData==null){
   
          res.render('loginParent', {msg: 'Email Does Not Match', error: true});
      }else{
        if(userData !== null && userData.password === pass){
           
          if(userData.status==0)
          {
            res.render("updatePasswordParent", {error: false, msg: '',email:userData.email});
                   
          }
          else{
        
            Parent.find({email:userData.email},function(err,parents){   //before any method of moongoose we use document variable
              posts=parents;
            res.render("homeParent",{
                      posts:posts , email:userData.email });
                      });
  
          }
        }else{
         
          res.render('loginParent', {msg: ' Password Does Not Match', error: true});
        }
      }
    })
    });
  
   //updatePassword for Parents
 app.post("/UpdatePasswordParent/:email",   function(req, res){
  var email=[req.params.email]
  console.log("parent mail is "+email);
const new_pass=md5(req.body.new_password);
//console.log("new passs is "+new_pass)

const confirm_pass=md5(req.body.confirm_password);
//console.log("new pass is "+confirm_pass);

if(new_pass===confirm_pass)
{
  loginParent.findOneAndUpdate({email:email},{password:confirm_pass,status:1},{new:true},(err,result)=>{
if(err)
{ console.log("error is "+err)
  res.render('updatePasswordParent', {msg: ' Password Does Not Match', error: true,email:email});
}
else{

  console.log(" Parent result is "+result);
  Parent.find({email:email},function(err,parents){   //before any method of moongoose we use document variable
    posts=parents;
  res.render("homeParent",{
            posts:posts , email:email });
            });
}

});

}

else{
  res.render('updatePasswordParent', {msg: ' Password Does Not Match', error: true,email:email});
}

});


//for forget email parent
app.post("/forgetEmailParent", function(req, res){
  const email=req.body.username;
//const pass=md5(req.body.password);

loginParent.findOne({email: email}, (err, userData) => {
 console.log("userdata is "+userData);
  if(userData==null){
      res.render('forgetEmailParent', {msg: 'Email Does Not Match', error: true});
  }else{
   
   var length=6;
   var token = "";
	 var charset = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
		for( var i=0; i < length; i++ )
    token += charset.charAt(Math.floor(Math.random() * charset.length));
         console.log("token is "+token);

         loginParent.findOneAndUpdate({email:email},{token:token},{new:true},(err,result)=>{
           if(result==null)
           {
                 console.log("token err"+err)
           }
           else{

             console.log("token update result is "+result)
             let transport = nodemailer.createTransport({
	
              service: "Gmail",
              auth: {
                 user: 'kalwanibharat40@gmail.com',
                 pass: '8852967270'
              }
            });
          
            const message = {
              from: 'kalwanibharat40@gmail.com', // Sender address
              to: result.email,         // List of recipients
              subject: 'Reset Password Token ', // Subject line
              
              html:'<p>Hello Parent here is token number for reset password .</p>'+result.token+'<h2>THANK YOU</h2>'
            };
            transport.sendMail(message, function(err) {
          
              if (err) {
                res.send(err);
              } else {
                console.log("email sent");
                //alert("email sent successfully")
                res.render("forgetPassParent",{msg: 'Token  is sent to your email box.', error: true});  
              }
            });
           }
          });

  }
})
});

//for forget reset password parent

app.post("/forgetPassParent",   function(req, res){
  var data=req.body;
  console.log(data)

const new_pass=md5(req.body.new_password);
console.log("new passs is "+new_pass)

const confirm_pass=md5(req.body.confirm_password);
console.log("confirm pass is "+confirm_pass);

loginParent.findOne({token: data.token}, (err, userData) => {

  if(userData==null)
  {  
    res.render('forgetPassParent', {msg: 'Please Enter the valid token sent in your email id', error: true});
  }
  else{
    console.log("else token part")

    if(new_pass===confirm_pass)
{
  console.log("new pass enter")
  loginParent.findOneAndUpdate({token:userData.token},{password:confirm_pass,token:""},{new:true},(err,result)=>{
if(err)
{ 
  console.log("error is "+err)
  res.render('forgetPassParent', {msg: ' Password Does Not Match', error: true});
}
else{

  console.log("result is "+result);
  res.render("home");
}

});

}
  
else{
  res.render('forgetPassParent', {msg: ' Password Does Not Match', error: true});
}


  }

});

});


//Management register

app.post("/registerMng", function(req,res){
  var pass=req.body.password;
  console.log('password is '+pass)
const newUser=new Management({
email:req.body.username,
password:md5(req.body.password),
status:0,
token:""

});
newUser.save(function(err){
if(err)
{
  console.log(err);
}else{
    console.log("email is "+newUser.email);
  let transport = nodemailer.createTransport({
	
		service: "Gmail",
		auth: {
		   user: 'kalwanibharat40@gmail.com',
		   pass: '8852967270'
		}
	});

	const message = {
		from: 'kalwanibharat40@gmail.com', // Sender address
		to: newUser.email,         // List of recipients
		subject: 'Git Login Credentials For Complain Portal ', // Subject line
		
    html:'<p>Hello Management please check the email and password for college complain portal.</p><p>Email id - </p>'+newUser.email+'<p>password </p>'+pass+'<p>Please change you password as soon as possible</p><h2>THANK YOU</h2>'
	};
  transport.sendMail(message, function(err) {

		if (err) {
      res.send(err);
		} else {
		  console.log("email sent");
      res.render("registered");  
		}
	});


}
  });

});

//for login managemet
app.post("/loginMng", function(req, res){
    const user=req.body.username;
  const pass=md5(req.body.password);
  
  Management.findOne({email: user}, (err, userData) => {
   console.log("userdata is "+userData);
    if(userData==null){
      // res.send('Something Went Wrong') 
     // console.log("error is "+err)
        res.render('loginMng', {msg: 'Email Does Not Match', error: true});
    }else{
      if(userData !== null && userData.password === pass){
        
              
        if(userData.status==0)
        {
          res.render("updatePasswordMng", {error: false, msg: '',email:userData.email});
                 
        }
        else{
          Parent.find({},function(err,parents){   //before any method of moongoose we use document variable
            if(err)
            console.log("error is "+err)
            else{
              posts=parents;
             res.render("management",{
                        posts:posts   });
              
            }         
        });
     
        }
       
      }else{
        res.render('loginMng', {msg: ' Password Does Not Match', error: true});
      }
    }
  })
  });


//updatePassword for Managements

app.post("/UpdatePasswordMng/:email",   function(req, res){
  var email=[req.params.email]
  console.log("parent mail is "+email);
const new_pass=md5(req.body.new_password);
//console.log("new passs is "+new_pass)

const confirm_pass=md5(req.body.confirm_password);
//console.log("new pass is "+confirm_pass);

if(new_pass===confirm_pass)
{
  Management.findOneAndUpdate({email:email},{password:confirm_pass,status:1},{new:true},(err,result)=>{
if(err)
{ console.log("error is "+err)
  res.render('updatePasswordMng', {msg: ' Password Does Not Match', error: true,email:email});
}
else{

  console.log(" Mng result is "+result);
  Parent.find({},function(err,parents){   //before any method of moongoose we use document variable
    posts=parents;
  res.render("management",{
            posts:posts   });
            });
}

});

}

else{
  res.render('updatePasswordMng', {msg: ' Password Does Not Match', error: true,email:email});
}

});


//for forget email Management
app.post("/forgetEmailMng", function(req, res){
  const email=req.body.username;
//const pass=md5(req.body.password);

Management.findOne({email: email}, (err, userData) => {
 console.log("userdata is "+userData);
  if(userData==null){
      res.render('forgetEmailMng', {msg: 'Email Does Not Match', error: true});
  }else{
   
   var length=6;
   var token = "";
	 var charset = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
		for( var i=0; i < length; i++ )
    token += charset.charAt(Math.floor(Math.random() * charset.length));
         console.log("token is "+token);

         Management.findOneAndUpdate({email:email},{token:token},{new:true},(err,result)=>{
           if(result==null)
           {
                 console.log("token err"+err)
           }
           else{

             console.log("token update result is "+result)
             let transport = nodemailer.createTransport({
	
              service: "Gmail",
              auth: {
                 user: 'kalwanibharat40@gmail.com',
                 pass: '8852967270'
              }
            });
          
            const message = {
              from: 'kalwanibharat40@gmail.com', // Sender address
              to: result.email,         // List of recipients
              subject: 'Reset Password Token ', // Subject line
              
              html:'<p>Hello Management here is token number for reset password .</p>'+result.token+'<h2>THANK YOU</h2>'
            };
            transport.sendMail(message, function(err) {
          
              if (err) {
                res.send(err);
              } else {
                console.log("email sent");
                //alert("email sent successfully")
                res.render("forgetPassMng",{msg: 'Token  is sent to your email box.', error: true});  
              }
            });
           }
          });

  }
})
});

//for forget reset password parent

app.post("/forgetPassMng",   function(req, res){
  var data=req.body;
  console.log(data)

const new_pass=md5(req.body.new_password);
console.log("new passs is "+new_pass)

const confirm_pass=md5(req.body.confirm_password);
console.log("confirm pass is "+confirm_pass);

Management.findOne({token: data.token}, (err, userData) => {

  if(userData==null)
  {  
    res.render('forgetPassMng', {msg: 'Please Enter the valid token sent in your email id', error: true});
  }
  else{
    console.log("else token part")

    if(new_pass===confirm_pass)
{
  console.log("new pass enter")
  Management.findOneAndUpdate({token:userData.token},{password:confirm_pass,token:""},{new:true},(err,result)=>{
if(err)
{ 
  console.log("error is "+err)
  res.render('forgetPassMng', {msg: ' Password Does Not Match', error: true});
}
else{

  console.log("result is "+result);
  res.render("home");
}

});

}
  
else{
  res.render('forgetPassMng', {msg: ' Password Does Not Match', error: true});
}


  }

});

});



    //for register admin
    app.post("/registerAdmin",function(req,res){
    const newUser=new loginAdmin({
    email:req.body.username,
    password:md5(req.body.password)
    
    });
    newUser.save(function(err){
    if(err)
    {
      console.log(err);
    }else{
      res.render("registered");
    }
      });
    
    });
  
    //for login admin
    app.post("/loginAdmin", function(req, res){
        const user=req.body.username;
      const pass=md5(req.body.password);
      
      loginAdmin.findOne({email: user}, (err, userData) => {
    
        if(err){
     
            res.render('loginAdmin', {msg: 'Email Does Not Match', error: true});
        }else{
          if(userData !== null && userData.password === pass){
            
            res.render("admin");
          }else{
           
            res.render('loginAdmin', {msg: ' Password Does Not Match', error: true});
          }
        }
      })
      });
    //admin end
      


 //compose page post
app.post("/composeStd/:email",function(req,res){
  var e=[req.params.email]
  var email=e[0];
const post={
  email:email,
  name:req.body.postName,
  hostel_no:req.body.postHostel,
  room_no:req.body.postRoom,
  content:req.body.postContent,
  year:req.body.year,
  replyHostel: []
};
var value=req.body.year;
//console.log(value);
const hostel =new Hostel({
  email:post.email,
  name:post.name,
hostel_no:post.hostel_no,
room_no:post.room_no,
content:post.content,
year:post.year,
replyHostel: []
});
hostel.save();
res.redirect(`/homeStd/`+email);
});

//post for composeClg
app.post("/composeClg/:email",function(req,res){
  var e=[req.params.email]
  var email=e[0];
  const clg={
    email:email,
    name:req.body.postName,
   title:req.body.postTitle,
  content:req.body.postContent,
  teacher:req.body.teacher,
  branch:req.body.branch,
  section:req.body.section,
  year:req.body.year,
  reply: []
};

const college =new College({
  email:clg.email,
  name:clg.name,
  title:clg.title,
content:clg.content,
teacher:clg.teacher,
branch:clg.branch,
section:clg.section,
year:clg.year,
reply: []
});
college.save(); 
res.redirect(`/collegeStd/`+email);
//res.redirect("showStdComplain");
});
// post for reply
app.get("/feedback/:id/:name", async (req,res) => {
  
   const ary=[req.params.id ,req.params.name]
     var id=ary[0];  
   var name=ary[1];
 
  if(id.length < 12){
    res.status(401).send('Wrong Req')
  } 
  College.findOne({_id: id}, (err, doc) => {
    if(err){

      res.send('Wrong Path')
    }else{
    //   if(!err){
    //   res.redirect("/showStdComplain");
    // }
      const reply = doc.reply.length > 0 ? doc.reply[0] : {};
      
      res.render("feedback", {doc, reply,name:name});
       
    }
  })
  
});

app.post("/feedback/:id/:name",async function(req,res){
 
  const ary=[req.params.id ,req.params.name]
  var id=ary[0];  
var name=ary[1];
 // const {id} = req.params;
  //res.send(id);
  const teacherName=name
  const replyMessage = req.body.replyMessage;
  College.findOne({_id: id},  async (err, doc) => {
    if(err){
      res.send('Wrong Path')
    }else{
      const newDoc =  await College.findOneAndUpdate({_id: id}, {reply: [{teacherName, replyMessage}]}, {new: true});
      // case handle save after 
      //res.redirect(`/showStdComplain?#id-${id}`);
      res.redirect(`/showStdComplain/`+name);
    }
  });

});
//get for feedHostel (reply)
app.get("/feedHostel/:id", async (req,res) => {
  // res.send(req.params.id);
  const {id} = req.params;
  if(id.length < 12){
    res.status(401).send('Wrong Req')
  } 
  Hostel.findOne({_id: id}, (err, doc) => {
    if(err){

      res.send('Wrong Path')
    }else{
    //   if(!err){
    //   res.redirect("/showStdComplain");
    // }
      const reply2 = doc.replyHostel.length > 0 ? doc.replyHostel[0] : {};
      res.render("feedHostel", {doc, reply2});
    }
  })
  
});
//post for feedHostel
app.post("/feedHostel/:id",async function(req,res){
  const {id} = req.params;
  //res.send(id);
  const {teacherName, replyMessage} = req.body;
  Hostel.findOne({_id: id},  async (err, doc) => {
    if(err){
      res.send('Wrong Path')
    }else{
      const newDoc =  await Hostel.findOneAndUpdate({_id: id}, {replyHostel: [{teacherName, replyMessage}]}, {new: true});
      // case handle save after 
      res.redirect(`/showStdHostelComplain?#id-${id}`);
    }

  });

});

//reply parent

app.get("/feedbackParent/:id", async (req,res) => {
  // res.send(req.params.id);
  const {id} = req.params;
  if(id.length < 12){
    res.status(401).send('Wrong Req')
  } 
  Parent.findOne({_id: id}, (err, doc) => {
    if(err){

      res.send('Wrong Path')
    }else{
    //   if(!err){
    //   res.redirect("/showStdComplain");
    // }
      const reply2 = doc.replyParent.length > 0 ? doc.replyParent[0] : {};
      res.render("feedbackParent", {doc, reply2});
    }
  })
  
});

//post for feedback parent
app.post("/feedbackParent/:id",async function(req,res){
  const {id} = req.params;
  console.log("user id is "+id);
  //res.send(id);
  const {teacherName, replyMessage} = req.body;
  Parent.findOne({_id: id},  async (err, doc) => {
    if(err){
      res.send('Wrong Path')
    }else{
      const newDoc =  await Parent.findOneAndUpdate({_id: id}, {replyParent: [{teacherName, replyMessage}]}, {new: true});
      // case handle save after 
      res.redirect(`/showParentsComplain?#id-${id}`);
    }

  });

});


app.post("/composeTch/:name",function(req,res){
  var name=[req.params.name]
  
const tchr={
  name:req.body.postName,
  title:req.body.postTitle,
 content:req.body.postContent,
 branch:req.body.branch,
 section:req.body.section,
 year:req.body.year
};
var value=req.body.complain;
//console.log(value);
if (value=== "complain") {
  const teacher =new Teacher({
    name:tchr.name,
    title:tchr.title,
  content:tchr.content,
  branch:tchr.branch,
  section:tchr.section,
  year:tchr.year
  });
  teacher.save();
 // res.redirect("homeTch");
 Teacher.find({},function(err,teachers){   //before any method of moongoose we use document variable
  posts=teachers;
res.render("homeTch",{
          posts:posts ,name:name });
         
          });
}
else {
  const suggestion =new Suggestion({
    name:tchr.name,
    title:tchr.title,
  content:tchr.content,
  branch:tchr.branch,
  section:tchr.section,
  year:tchr.year
  });
  suggestion.save();
  //res.redirect("suggestionTch");
  Suggestion.find({},function(err,suggestions){   //before any method of moongoose we use document variable
    posts=suggestions;
  res.render("suggestionTch",{
            posts:posts ,name:name  });
  
  });
}
});

//post for composeParents
app.post("/composeParents/:email",function(req,res){
  var e=[req.params.email];
  var email=e[0];
 // console.log("email1 is "+email)
 // console.log("email2 is "+email2)
  //console.log(typeof email);
  const parnt={
    email:email,
     name:req.body.postName,
     title:req.body.postTitle,
    content:req.body.postContent,
    mobile:req.body.postMobile,
    replyParent: []
  };
  const parent =new Parent({
    email:parnt.email,
    name:parnt.name,
    title:parnt.title,
  content:parnt.content,
  mobile:parnt.mobile,
  replyParent: []
  });
  parent.save(); 
  res.redirect(`/homeParent/`+email);
  //res.redirect("showStdComplain");
  //res.redirect(`/showStdComplain/`+name);
  });



//student hostel 
app.get("/homeStd/:email",function(req,res){
  var email=[req.params.email]
  Hostel.find({},function(err,hostels){   //before any method of moongoose we use document variable
  posts=hostels;
res.render("homeStd",{
          posts:posts,email:email   });

});
});

//student college
app.get("/collegeStd/:email",function(req,res){
  var email=[req.params.email]
  College.find({},function(err,colleges){   //before any method of moongoose we use document variable
  posts=colleges;
res.render("collegeStd",{
          posts:posts,email:email   });

});
});

app.get("/composeTch/:name", function(req, res){
  const name =[req.params.name] ;
 // console.log("Compose Tch name is "+name);    
  res.render("composeTch",{name:name});
})


app.get("/showStdComplain/:name",function(req,res){
  const {name} = req.params;
  console.log("name is "+name);
  College.find({teacher:name},function(err,colleges){   //before any method of moongoose we use document variable
  posts=colleges;
res.render("showStdComplain",{
          posts:posts ,name:name  });

});

});
//show hostel complain teacher
app.get("/showStdHostelComplain",function(req,res){
  Hostel.find({},function(err,hostels){   //before any method of moongoose we use document variable
  posts=hostels;
res.render("showStdHostelComplain",{
          posts:posts   });



});

});


//show parent complain in teacher page
app.get("/showParentsComplain",function(req,res){
  Parent.find({},function(err,parents){   //before any method of moongoose we use document variable
  posts=parents;
res.render("showParentsComplain",{
          posts:posts   });

});

});

app.get("/",function(req,res){
  res.render("home");
  });
  

  app.get("/student",function(req,res){
    res.render("student");
    });
    


app.get("/composeClg",function(req,res){
res.render("composeClg");
});



app.get("/admin",function(req,res){
  res.render("admin");
  });
  

app.get("/loginStd",function(req,res){
res.render("loginStd", {error: false, msg: ''});
});



app.get("/loginMng",function(req,res){
  res.render("loginMng", {error: false, msg: ''});
  });
  


  app.get("/forgetEmailStd",function(req,res){
    res.render("forgetEmailStd", {error: false, msg: ''});
    });

    app.get("/forgetPassStd",function(req,res){
      res.render("forgetPassStd", {error: false, msg: ''});
      });
      
    app.get("/forgetEmailTch",function(req,res){
      res.render("forgetEmailTch", {error: false, msg: ''});
      });
    
    app.get("/forgetPassTch",function(req,res){
      res.render("forgetPassTch", {error: false, msg: ''});
      });
    
      
    
  app.get("/forgetEmailParent",function(req,res){
    res.render("forgetEmailParent", {error: false, msg: ''});
    });
    
    
  app.get("/forgetPassParent",function(req,res){
    res.render("forgetPassParent", {error: false, msg: ''});
    });
    
    
  app.get("/forgetEmailMng",function(req,res){
    res.render("forgetEmailMng", {error: false, msg: ''});
    });
    

    app.get("/forgetPasMng",function(req,res){
      res.render("forgetPassMng", {error: false, msg: ''});
      });
      

app.get("/registerStd",function(req,res){
res.render("registerStd");
});

app.get("/registerManagement",function(req,res){
  res.render("registerManagement");
  });
  

app.get("/loginTch",function(req,res){
res.render("loginTch", {error: false, msg: ''});
});


app.get("/registerTch",function(req,res){
res.render("registerTch");
});

app.get("/registerAdmin",function(req,res){
  res.render("registerAdmin");
  });


  app.get("/loginAdmin",function(req,res){
    res.render("loginAdmin", {error: false, msg: ''});
    });


    app.get("/registerParent",function(req,res){
      res.render("registerParent");
      });
    
    
      app.get("/loginParent",function(req,res){
        res.render("loginParent", {error: false, msg: ''});
        });
    

app.get("/submit",function(req,res){
res.render("submit");
});


app.get("/registered",function(req,res){
res.render("registered");
res.redirect("/");
});

app.get("/composeStd/:email",function(req,res){
  var email=[req.params.email]
res.render("composeStd",{email:email});
});

app.get("/myHostel/:email",function(req,res){
  var email=[req.params.email]

Hostel.find({email:email},function(err,hostels){   //before any method of moongoose we use document variable
  posts=hostels;
res.render("myHostel",{
          posts:posts ,email:email 
         });
});
});

app.get("/myCollege/:email",function(req,res){
  var email=[req.params.email]

College.find({email:email},function(err,colleges){   //before any method of moongoose we use document variable
  posts=colleges;
res.render("myCollege",{
          posts:posts, email:email 
         });

});
});

app.get("/composeClg/:email",function(req,res){
  var email=[req.params.email]
res.render("composeClg",{email:email});
});

app.get("/composeParents/:email",function(req,res){
  var email=[req.params.email];
  res.render("composeParents",{email:email});
  });

app.get("/home",function(req,res){
    res.render("home");
    });

app.get("/updatePasswordStd",function(req,res){
      res.render("updatePasswordStd",{error: false, msg: ''});
      });

app.get("/updatePasswordTch",function(req,res){
        res.render("updatePasswordTch",{error: false, msg: ''});
        });

app.get("/updatePasswordParent",function(req,res){
          res.render("updatePasswordParent",{error: false, msg: ''});
          });

app.get("/updatePasswordMng",function(req,res){
            res.render("updatePasswordMng",{error: false, msg: ''});
            });

app.get("/homeTch/:name", function(req, res){
  var name=[req.params.name];
  Teacher.find({},function(err,teachers){   //before any method of moongoose we use document variable
  posts=teachers;
res.render("homeTch",{
          posts:posts,name:name  });

});
});



app.get("/management", function(req, res){
  
  Parent.find({},function(err,parents){   //before any method of moongoose we use document variable
  posts=parents;
res.render("management",{
          posts:posts  });

});
});




app.get("/homeParent/:email", function(req, res){
  var email=[req.params.email];
  Parent.find({email:email},function(err,parents){   //before any method of moongoose we use document variable
    if(err)
    console.log("error is "+err)
    else{
      posts=parents;
     res.render("homeParent",{
                posts:posts ,email:email  });
      
    }
   
});
});

app.get("/suggestionTch/:name", function(req,res){
 var name=[req.params.name];

 Suggestion.find({},function(err,suggestions){   //before any method of moongoose we use document variable
  posts=suggestions;
res.render("suggestionTch",{
          posts:posts ,name:name  });

});
});


app.get("/suggestionMng", function(req,res){
  
  Suggestion.find({},function(err,suggestions){   //before any method of moongoose we use document variable
   posts=suggestions;
 res.render("suggestionMng",{
           posts:posts   });
 
 });
 });

 app.get("/showClgComplainMng",function(req,res){
  
  College.find({},function(err,colleges){   //before any method of moongoose we use document variable
  posts=colleges;
res.render("showClgComplainMng",{
          posts:posts   });

});
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
