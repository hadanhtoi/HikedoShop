var express = require('express');
var router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const moment = require('moment');
const flash = require('connect-flash');
const phone_regex = require('../config/constant').PHONE_REGEX;
const birthday_regex = require('../config/constant').BIRTHDAY_REG;
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');
//User model
const User = require('../models/User');

/* GET users listing. */
router.get('/signIn', forwardAuthenticated, (req, res, next) => {
  res.render('signIn', { pageTitle: "Sign In Page" });
});

router.get('/signUp', (req, res, next) => {
  res.render('signUp', { pageTitle: "Sign Up Page" });
});
// Profile
router.get('/profile', ensureAuthenticated, (req, res) => {
  const createdAt = moment(req.user.createdAt).format('MM/DD/YYYY');
  res.render('userProfile', {
    pageTitle: "User Profile",
    user: req.user,
    createdAt: createdAt,
  });
});

router.post('/profile/editUserProfile', ensureAuthenticated, (req, res, next) => {
  const { name, email, address, confirmPassword } = req.body;
  let errors = [];
  // if(!name){
  //   errors.push({msg:"Tên không được để trống!"});
  // }
  // if(!email){
  //   errors.push({msg:"Email không được để trống!"});
  // }
  // if(!address ||address == "" || address == null || address == 'undefined'){
  //   errors.push({msg:"Địa chỉ không được để trống!"});
  // }
  // if(!confirmPassword){
  //   errors.push({msg:"Confirm Password không được để trống!"});
  // }
  // if(errors.length > 0){
  //   errors.push({msg:"Nhấn Edit nếu muốn tiếp tục Edit,"});
  //   res.render('userProfile',{
  //     pageTitle:"User Profile",
  //     user:req.user,
  //     errors,
  //     createdAt:moment(req.user.createdAt).format('MM/DD/YYYY')
  //   });
  if (!name || !address || !confirmPassword) {
    errors.push("Trừ email, không thể update dữ liệu trống!");
  }
  if(confirmPassword && confirmPassword.length < 6){
    errors.push("Password phải từ 6 kí tự trở lên!");
  }
  if (errors.length > 0) {
    req.flash("error_msg",errors)    
    res.redirect('/users/profile');
  } else {
    //Compare confirm password
    bcrypt.compare(confirmPassword, req.user.password , (err, result) => {
      if (result != true) {
        // errors.push({ msg: "Confirm Password không đúng!" });
        // res.render("userProfile", {
        //   pageTitle: "User Profile",
        //   errors,
        //   user: req.user,
        //   createdAt: moment(req.user.createdAt).format('MM/DD/YYYY')
        // });
        req.flash("error_msg", "Confirm Password không đúng!");
        res.redirect('/users/profile');
      } else {
        User.findOne({ _id: req.user.id, password: req.user.password }).then((user) => {
          if (!user) {
            //Not found user
            errors.push({ msg: "Không tìm thấy tài khoản đã đăng nhập!" });
            req.logout();
            res.render("signIn", {
              pageTitle: "User Profile",
              errors,
            });
          } else {
            //Found user
            if (user.name !== name) {
              user.name = name;
            }
            if (user.email !== email) {
              user.email = email;
            }
            if (user.address == null || user.address == 'undefined' || user.address == "" || user.address != address) {
              user.address = address;
            }
            user.save()
              .then(user => {
                req.flash("success_msg", "Bạn đã update thành công!");
                res.redirect("/users/profile")
              })
              .catch(err => console.log("Edit Profile Error: ", err))
          }
        });
      }
    });
  }
});

router.post('/profile/changePassword', ensureAuthenticated, (req, res, next) => {
  const { oldPassword, newPassword, confirmNewPassword } = req.body;
  let errors2 = [];

  if (!oldPassword || !newPassword || !confirmNewPassword) {
    errors2.push({ msg: "Không được bỏ trống trường nào!" });
  }

  if (newPassword && confirmNewPassword && (confirmNewPassword !== newPassword)) {
    errors2.push({ msg: "Confirm New Password nhập không đúng!" });
  }
  if (errors2.length > 0) {
    // res.render('userProfile', {
    //   pageTitle: "User Profile",
    //   errors2,
    //   user: req.user,
    //   createdAt: moment(req.user.createdAt).format('MM/DD/YYYY')
    // });
    req.flash("errorsArr",errors2);
    res.redirect('/users/profile');
  } else {
    bcrypt.compare(oldPassword, req.user.password,(err,result)=>{
      if(err){
        throw err;
      }
      if(result == false){      
      req.flash("warning", "Confirm Password nhập chưa đúng");
      res.redirect('/users/profile');
    } else {
      //Confirm password true
      User.findById(req.user.id).then(user => {
        if (!user) {
          req.flash("warning", "Không tìm thấy user đã đăng nhập!")
          res.redirect('/users/signIn');
        } else {
          //Found user
          //Hash password
          bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(newPassword, salt, (err, hash) => {
              if (err) throw err;
              //Set password to hashed
              user.password = hash;
              //Save new user
              user.save()
                .then(user => {
                  req.logout();
                  req.flash('success_msg', "Bạn đã thay đổi password thành công. Giờ bạn phải đăng nhập lại!");
                  res.redirect('/users/signIn');
                })
                .catch(err => console.log("SignUp Error: ", err));
            });
          });
        }
      });
    }
  });
};
});
router.post('/signUp', forwardAuthenticated, function (req, res, next) {
  const { name, email, password, password2, phone, birthday, address } = req.body;
  let errors = [];

  //to-do: check required fields
  if (!name || !password || !password2 || !phone || !birthday || !address) {
    errors.push({ msg: 'Trừ Email là không bắt buộc, các trường khác bắt buộc phải điền' });
  }

  if (password !== password2) {
    errors.push({ msg: "Confirm password không đúng!" });
  }

  if (phone_regex.test(phone) == false) {
    errors.push({ msg: "Phone phải chỉ chứa toàn số!" });
  }

  if (email.includes("@") == false) {
    errors.push({ msg: "Email phải chứa @" });
  }

  if (birthday_regex.test(birthday) == false) {
    errors.push({ msg: "Birthday phải được điền theo dạng mm/dd/yyyy" });
  }

  if (password.length < 6) {
    errors.push({ msg: "Password phải từ 6 kí tự trở lên" });
  }

  if (address == "" || address == null || address == 'undefined') {
    errors.push({ msg: "Address không nên bỏ trống!" });
  }

  if (errors.length > 0) {
    res.render('signUp', {
      pageTitle: "Sign Up Page",
      errors,
      name,
      email,
      password,
      password2,
      phone,
      birthday,
      address
    });
  }else {
    //Validation pass
    User.findOne({ phone: phone }).then((user) => {
      if (user) {
        //user exists
        errors.push({ msg: "Số điện thoại đã được sử dụng. Hãy lấy số điện thoại khác" });
        res.render("signUp", {
          pageTitle: "Sign Up Page",
          errors,
          name,
          email,
          password,
          password2,
          phone,
          birthday,
          address
        });
      } else {
        //create new user
        const newUser = new User({
          name,
          email,
          password,
          phone,
          birthday,
          address,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          authenticate: 2
        });
        console.log("New user: \n" + newUser);

        //Hash password
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            //Set password to hashed
            newUser.password = hash;
            //Save new user
            newUser.save()
              .then(user => {
                req.flash('success_msg', "Bạn đã đăng kí thành công. Giờ bạn có thế sign in");
                res.redirect('/users/signIn');
              })
              .catch(err => console.log("SignUp Error: ", err));
          });
        });
      }
    });
  }
});

// Sign In handle
router.post('/signIn', (req, res, next) => {
  passport.authenticate('local',
    {
      successRedirect: '/dashboard',
      failureRedirect: '/users/signIn',
      failureFlash: true
    })(req, res, next)
});

// Sign out handle
router.get('/signOut', (req, res) => {
  req.logout();
  req.flash('success_msg', 'Bạn đã đăng xuất!');
  res.redirect('/users/signIn');
});



module.exports = router;
