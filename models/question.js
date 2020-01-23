let mongoose = require('mongoose');
let questionSchema = mongoose.Schema({
  title:{
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
  },
  tags:{
    type:String
  }
});
let question = module.exports = mongoose.model('Question',questionSchema);
