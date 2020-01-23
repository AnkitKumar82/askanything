const express = require('express');
const router = express.Router();

//bring in questions
let question = require('../models/question');
//bring in answers
let answer = require('../models/answer');
let user = require('../models/user');
//ask question route
router.get('/ask',ensureAuthenticated,function(req,res){
  res.render('ask_question',{
  });
});
//ask question route
router.post('/ask',function(req,res){
  req.checkBody('title','Title is required').notEmpty();
  req.checkBody('body','Body is required').notEmpty();
  //get errors
  let errors = req.validationErrors();
  if(errors){
    res.render('ask_question',{
      errors:errors
    });
  }
  else{
    let ques = new question();
    ques.title = req.body.title;
    ques.user = req.user._id;
    ques.tags = req.body.tags.trim();
    ques.votes=0;
    ques.body = req.body.body;
    ques.save(function(err){
      if(err){
        console.log(err);
      }else{
        req.flash('success','Question posted successfully');
        res.redirect('/');
      }
    });
  }
});

//show single question
router.get('/:id',function(req,res){
  question.findById(req.params.id,function(err,question){
    user.findById(question.user,function(err,quesUser){
      answer.find({quesid:question._id},function(err,answers){
        if(err){
          console.log(err);
        }else{
          res.render('question',{
            question:question,
            questionUser:quesUser,
            answers:answers.reverse()
          });
        }
      });
    });
  });
});

//delete question
router.get('/delete/:id',ensureAuthenticated,function(req,res){
    let quesQuery ={ $and: [ { _id:req.params.id }, { user:req.user.id } ] };
    let ansQuery ={ $and: [ { quesid:req.params.id }, { user:req.user.id } ] };
    question.deleteOne(quesQuery,function(err){
      answer.deleteMany(ansQuery,function(err){
        if(err){
          console.log(err);
        }else{
          req.flash('danger','Answer Deleted successfully');
        }
        res.redirect('/users/profile');
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
