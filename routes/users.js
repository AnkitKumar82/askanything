const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
//bring in questions
let question = require('../models/question');

let answer = require('../models/answer');
let User = require('../models/user');

//render register page
router.get('/register',function(req,res){
  res.render('register');
});
//handle register request

router.post('/register',function(req,res){
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;
  const password2 = req.body.password2;

  req.checkBody('name','Name is required').notEmpty();
  req.checkBody('email','Email is required').notEmpty();
  req.checkBody('email','Email is invalid').isEmail();
  req.checkBody('password','Password is required').notEmpty();
  req.checkBody('password2','Passwords do not match').equals(req.body.password);
  let errors = req.validationErrors();
  if(errors){
    res.render('register',{
      errors:errors
    });
  }else{
      let newUser = new User();
      newUser.name = name;
      newUser.email = email;
      newUser.password = password;
      bcrypt.genSalt(10,function(err,salt){
        bcrypt.hash(newUser.password,salt,function(err,hash){
          if(err){
            console.log(err);
          }else{
            newUser.password = hash;
            newUser.save(function(err){
              if(err){
                console.log(err);
                return;
              }else{
                req.flash('success','You are registered and can log in');
                res.redirect('/users/login');
              }
            });
          }
        });
      });
  }
});
//login form
router.get('/login',function(req,res){
  res.render('login');
});
//login processs
router.post('/login',function(req,res,next){
  passport.authenticate('local',{
    successRedirect:'/',
    failureRedirect:'/users/login',
    failureFlash:true
  })(req,res,next);
});

router.get('/logout',function(req,res){
  req.logout();
  req.flash('success','You are logged out');
  res.redirect('/');
});
router.get('/profile',ensureAuthenticated,function(req,res){
  User.findById(req.user._id,function(err,userprofile){
    answer.find({user:req.user._id},function(err,ans){
      question.find({user:req.user._id},function(err,ques){
        if(err){
          console.log(err);
          res.render('/');
        }else{
          res.render('profile',{
            userprofile:userprofile,
            ans:ans.reverse(),
            ques:ques.reverse()
          });
        }
      });
    });
  });
});
//access control
function ensureAuthenticated(req,res,next){
  if(req.isAuthenticated()){
    return next();
  }else{
    req.flash("danger","Please Log in");
    res.redirect('/users/login');
  }
}

module.exports = router;
