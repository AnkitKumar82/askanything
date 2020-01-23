const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const passport = require('passport');
const session = require('express-session');
const config = require('./config/database');

mongoose.connect(config.database);
let db = mongoose.connection;

//check connection
db.once('open',function(){
  console.log("Connected to database");
});

//cheack db error
db.on('error',function(err){
  console.log(err);
});

//app init
const app = express();

//bring in questions
let question = require('./models/question');
//bring in answers
let answer = require('./models/answer');
//bring in user
let user = require('./models/user');

//bodyParser middle ware
  //parse application/x-www-form-urlencoded
  app.use(bodyParser.urlencoded({extended:false}));
  //parse application json
  app.use(bodyParser.json());

//set public folder
app.use(express.static(path.join(__dirname,'public')));

//load view engine
app.set('views',path.join(__dirname,'views'));
app.set('view engine','pug');

//expres session middleware
app.use(session({
  secret: 'yoursecret',
  resave: true,
  saveUninitialized: true
}));

//expressvalidator middleware
app.use(expressValidator({
  errorFormatter: function(param, msg, value){
    var namespace = param.split('.')
    , root = namespace.shift()
    , formParam = root;
    while(namespace.length){
      formParam += '[' + namespace.shift()+']';
    }

    return {
      param : formParam,
      msg : msg,
      value : value
    };
  }
}));

//passport config
require('./config/passport')(passport);
//passport middleware
app.use(passport.initialize());
app.use(passport.session());

//app user var
app.get('*',function(req,res,next){
  res.locals.user = req.user || null;
  next();
});


//exrpess message middleware
app.use(require('connect-flash')());
app.use(function(req,res,next){
  res.locals.messages = require('express-messages')(req,res);
  next();
});

//home route
app.get('/',function(req,res){
  question.find({},function(err,questions){
    if(err){
      console.log(err);
    }
    else{
      res.render('index',{
        questions:questions.reverse()
      });
    }
  });
});
//post from search form
app.post('/search',function(req,res){
  let queryStr ='/'+req.body.searchquery+'/';
  console.log(queryStr);
  let query = {$or:[{title:{$regex:req.body.searchquery,$options:'i'}},{tags:{$regex:req.body.searchquery,$options:'i'}},{body:{$regex:req.body.searchquery,$options:'i'}}]};
  question.find(query,function(err,questions){
    if(err){
      console.log(err);
    }
    else{
      res.render('search',{
        query:req.body.searchquery,
        questions:questions.reverse()
      });
    }
  });
});
//get request from tag clicking
app.get('/search/:searchquery',function(req,res){
  question.find({tags:{$regex:req.params.searchquery,$options:'i'}},function(err,questions){
    if(err){
      console.log(err);
    }
    else{
      res.render('search',{
        query:req.params.searchquery,
        questions:questions.reverse()
      });
    }
  });
});
//upvote question or answer
app.get('/upvote/:type/:id',ensureAuthenticated,function(req,res){
  if(req.params.type=='question'){
    question.updateOne({_id:req.params.id},{$inc:{votes:1}},function(err){
      if(err){
        console.log(err);
        res.redirect('/');
      }else{
          res.redirect('/questions/'+req.params.id);
      }
    });
  }else{
    answer.updateOne({_id:req.params.id},{$inc:{votes:1}},function(err){
      answer.findById(req.params.id,function(err,answers){
        if(err){
          console.log(err);
          res.redirect('/');
        }else {
          res.redirect('/questions/'+answers.quesid);
        }
      });
    });
  }
});
//downvote question or answer
app.get('/downvote/:type/:id',ensureAuthenticated,function(req,res){
  if(req.params.type=='question'){
    question.updateOne({_id:req.params.id},{$inc:{votes:-1}},function(err){
      if(err){
        console.log(err);
        res.redirect('/');
      }else{
          res.redirect('/questions/'+req.params.id);
      }
    });
  }else{
    answer.updateOne({_id:req.params.id},{$inc:{votes:-1}},function(err){
      answer.findById(req.params.id,function(err,answers){
        if(err){
          console.log(err);
          res.redirect('/');
        }else {
          res.redirect('/questions/'+answers.quesid);
        }
      });
    });
  }
});
//route files
let questions = require('./routes/questions');
app.use('/questions',questions);

let answers = require('./routes/answers');
app.use('/answer',answers);

let users = require('./routes/users');
app.use('/users',users);
//access control
function ensureAuthenticated(req,res,next){
  if(req.isAuthenticated()){
    return next();
  }else{
    req.flash("danger","Please Log in");
    res.redirect('/users/login');
  }
}

//start server
app.listen(3000,function(){
  console.log('server started at 3000...');
});
