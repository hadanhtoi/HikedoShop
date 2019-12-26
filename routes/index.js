var express = require('express');
var router = express.Router();

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

router.get('/returnPolicy',(req,res)=>{
  res.render('returnPolicy',{page:"Return Policy - Chính sách đổi trả hàng"});
});
module.exports = router;
