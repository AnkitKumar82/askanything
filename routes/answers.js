const express = require('express');
const router = express.Router();

//bring in questions
let question = require('../models/question');
//bring in answers
let answer = require('../models/answer');
//Load answer form
router.get('/edit/:id',function(req,res){
  answer.findById(req.params.id,function(err,answer){
    question.findById(answer.quesid,function(err,ques){
      if(answer.user!=req.user.id){
        req.flash('danger','Not Authorized');
        res.redirect('/');
      }else{
        res.render('edit_answer',{
            answer:answer,
            question:ques
        });
      }
    });
  });
});
//answer submission
router.post('/edit/:aid',function(req,res){
  req.checkBody('body','Body is required').notEmpty();
  let errors = req.validationErrors();
  let ansid = req.params.aid;
  let data = req.body.body;
  if(errors){
      req.flash('danger','Body cant be empty.');
    }
  else{
    console.log(ansid+" "+data);
    answer.updateOne({_id:ansid},{body:data},function(err){
      if(err){
        console.log(err);
      }else{
        req.flash('success','Answer posted successfully');
      }
    });
  }
  res.redirect('/');
});
router.get('/delete/:id',ensureAuthenticated,function(req,res){
    let query ={ $and: [ { _id:req.params.id }, { user:req.user.id } ] };
    answer.deleteOne(query,function(err){
      if(err){
        console.log(err);
      }else{
        req.flash('danger','Answer Deleted successfully');
      }
      res.redirect('/users/profile');
    });
});
router.post('/giveanswer',ensureAuthenticated,function(req,res){
    req.checkBody('body','Body is required').notEmpty();
    let errors = req.validationErrors();
    if(errors){
        req.flash('danger','Body cant be empty.');
      }
    else{
      let ans = new answer();
      ans.body = req.body.body;
      ans.user = req.user._id;
      ans.votes = 0;
      ans.quesid = req.body.quesid;
      ans.save(function(err){
        if(err){
          console.log(err);
        }else{
          req.flash('success','Answer posted successfully');
        }
      });
    }
    res.redirect('/questions/'+req.body.quesid);
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
