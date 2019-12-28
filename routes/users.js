var express = require('express');
var router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const moment = require('moment');
const phone_regex = require('../config/constant').PHONE_REGEX;
const birthday_regex = require('../config/constant').BIRTHDAY_REG;
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');
//User model
const User = require('../models/User');

/* GET users listing. */
router.get('/signIn', forwardAuthenticated, (req, res, next) => {
  res.render('signIn', { page: "Sign In Page" });
});

router.get('/signUp', forwardAuthenticated, (req, res, next) => {
  res.render('signUp', { page: "Sign Up Page" });
});
// Profile
router.get('/profile', ensureAuthenticated, (req, res) => {
  const createdAt = moment(req.user.createdAt).format('MM/DD/YYYY');
  res.render('userProfile', {
    page: "User Profile",
    user: req.user,
    createdAt: createdAt
  });
});
// Edit profile: open router profile

  /**console.log(req.user);
   * {
  email: 'xunglenhho@gmail.com',
  birthday: '12/12/1212',
  createdAt: 2019-12-26T11:19:34.957Z,
  image: '/images/man-user.png',
  _id: 5e04974623a6a51af0aacdf1,
  name: 'Lệnh Hồ Xung',
  password: '$2a$10$k0Q9FXxDr1ZhFWtFsj9NFugldaFSlrk93Mym1HaJj02FselgA1WAC',
  phone: '0353221074',
  __v: 0
}
  */
 router.get('/editProfile', ensureAuthenticated, function (req, res, next) {
  const { name, email } = req.user;
  const errors=[];
  console.log(req.body)
  errors.push({msg:"Nếu email để trống, sau khi cập nhật sẽ được cập nhật thành rỗng!"});
  errors.push({msg:"Các trường khác bắt buộc không để trống nếu bạn muốn cập nhật!"});
  errors.push({msg:"Password và Confirm Password "})
  res.render("editProfile", {
    page: "Edit Profile",
    name,
    email,
    user: req.user,
    errors,
  });
});
// Edit profile post submit

  //req.body lưu giá trị của edit user form sau khi cập nhật gửi lên.
  /**req.user: Lưu thông tin của user từ profile gửi sang
   * {
  email: 'xunglenhho@gmail.com',
  birthday: '12/12/1212',
  createdAt: 2019-12-26T11:19:34.957Z,
  image: '/images/man-user.png',
  _id: 5e04974623a6a51af0aacdf1,
  name: 'Lệnh Hồ Xung',
  password: '$2a$10$k0Q9FXxDr1ZhFWtFsj9NFugldaFSlrk93Mym1HaJj02FselgA1WAC',
  phone: '0353221074',
  __v: 0
}*/
router.post('/editProfile', (req, res, next) => {
const {name,email,newPassword,newPassword2,} = req.body;
const {_id} = req.user;
let errors = [];

if (!name || !newPassword || !newPassword2) {
  errors.push({ msg: 'Name, New Password, Confirm New Password bắt buộc phải điền!' });
}

if (email.includes("@") == false) {
  errors.push({ msg: "Email phải chứa @" });
}
  res.send("oki")
});

router.post('/signUp', function (req, res, next) {
  const { name, email, password, password2, phone, birthday } = req.body;
  let errors = [];

  //to-do: check required fields
  if (!name || !password || !password2 || !phone || !birthday) {
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

  if (errors.length > 0) {
    res.render('signUp', {
      page: "Sign Up Page",
      errors,
      name,
      email,
      password,
      password2,
      phone,
      birthday
    });
  } else {
    //Validation pass
    User.findOne({ phone: phone }).then((err, user) => {
      if (err) {
        console.log(err);
      }
      if (user) {
        //user exists
        errors.push({ msg: "Số điện thoại đã được sử dụng. Hãy lấy số điện thoại khác" });
        res.render("signUp", {
          page: "Sign Up Page",
          errors,
          name,
          email,
          password,
          password2,
          phone,
          birthday
        });
      } else {
        //create new user
        const newUser = new User({
          name,
          email,
          password,
          phone,
          birthday,
          createdAt: Date.now()
        });
        console.log(newUser);

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
              .catch(err => console.log(err));
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
