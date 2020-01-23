let mongoose = require('mongoose');
let answerSchema = mongoose.Schema({
  quesid:{
    type:String,
    required:true
  },
  user:{
    type:String,
    required:true
  },
  body:{
    type:String,
    required:true
  },
  votes:{
    type:Number,
    required:true
  }
});
let answer = module.exports = mongoose.model('Answer',answerSchema);
