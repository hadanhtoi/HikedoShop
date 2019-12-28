const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const phone_regex = require('./constant').PHONE_REGEX;

// Load User Model
const User = require('../models/User');

module.exports = function(passport){
  passport.use(
    new LocalStrategy({usernameField: 'phone'},(phone,password,done)=>{
      if(phone_regex.test(phone)== false){
        return done(null,false,{message:"Số điện thoại không được chứa chữ cái."});
      }
      // Match Username
      User.findOne({phone:phone})
      .then((user)=>{
        if(!user){
          return done(null,false,{message:"Cảnh báo: Số điện thoại này chưa được đăng kí!"});
        }

        // Match password 
        bcrypt.compare(password, user.password, (err,isMatched)=>{
          if(err) throw err;
          if(isMatched){
            return done(null,user);
          }else{
            return done(null, false,{message:"Password không chính xác!"});
          }
        });
      })
      .catch(err=> console.log(err));
    })
  );

  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });
   
  passport.deserializeUser(function(id, done) {
    User.findById(id, function (err, user) {
      done(err, user);
    });
  });
}