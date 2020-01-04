var express = require('express');
var router = express.Router();
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');
/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { page: 'Sunny Shop - Shoes Online Shop' });
});

router.get('/privacyPolicy', (req, res) => {
  res.render('privacyPolicy', { page: "Privacy Policy - Chính sách bảo mật" });
});

router.get('/recruitment', (req, res) => {
  res.render('recruitment', { page: 'Recruitment - Tuyển Dụng' });
});

router.get('/returnPolicy', (req, res) => {
  res.render('returnPolicy', { page: "Return Policy - Chính sách đổi trả hàng" });
});

router.get('/dashboard', ensureAuthenticated, (req, res) => {
  res.render('dashboard', {
    page: "Dashboard",
    user: req.user
  });
});

// router.get('/confirm', (req, res) => {
//   res.render('confirm', { page: "Confirm", mess: "Cảm ơn vì đã đăng kí! Mời quay lại trang chủ để chọn sản phẩm và đăng nhập" });
// });
module.exports = router;
