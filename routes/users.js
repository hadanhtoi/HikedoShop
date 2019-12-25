var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/signIn', function (req, res, next) {
  res.render('signIn', { page: "Login Page" });
});

router.get('/signUp', function (req, res, next) {
  res.render('signUp', { page: "Register Page" });
});

// router.post('/signUp', function (req, res, next) {
//   res.render('signUp', { page: "Register Page" });
//   next;
// });

// router.post('/signIn', function (req, res, next) {
//   res.render('signIn', { page: "Login Page" });
//   next;
// });

module.exports = router;
