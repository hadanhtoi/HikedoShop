require('../app');
var mongoose = require('mongoose');
var express = require('express');
var router = express.Router();
const Product = require('../models/Product');
const Brand = require('../models/Brand');
const selected_category_id = require('../config/constant').SELECTED_CATEGORY_ID;
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');
/* GET home page. */
router.get('/', async (req, res, next) => {
  const perPage = 8;
  const page = parseInt(req.params.page) || 1;
  var Results = [];
  awaitReconnectDB();
  const brands = await Brand.find({}).limit(3);
  for(const brand of brands){
    const products = await Product.find({brand_id:brand.id,category_id:selected_category_id}).limit(8);
    Results.push({brand_name:brand.brand_name,products:products});
  }
    res.render('index',{
      pageTitle:"Sunny Shop",
      Results:Results
    });
});

router.get('/privacyPolicy', (req, res) => {
  res.render('privacyPolicy', { pageTitle: "Privacy Policy - Chính sách bảo mật" });
});

router.get('/recruitment', (req, res) => {
  res.render('recruitment', { pageTitle: 'Recruitment - Tuyển Dụng' });
});

router.get('/returnPolicy', (req, res) => {
  res.render('returnPolicy', { pageTitle: "Return Policy - Chính sách đổi trả hàng" });
});

router.get('/dashboard', ensureAuthenticated, (req, res) => {
  res.render('dashboard', {
    pageTitle: "Dashboard",
    user: req.user
  });
});

async function getBrands() {
  await awaitReconnectDB();
  return await Brand.find({}).lean().exec((err, items) => {
    if (err) {
      throw err;
    }
    return items;
  });
}

async function awaitReconnectDB() {
  return mongoose.connection.readyState == 1;
};

async function getDocumentsByBrands (perPage,brands){
  var Results = [];
  for(brand of brands){
   await Product.find({brand_id:brand.id}).limit(perPage).lean().exec((err,products)=>{
      Results.push({brand_name:brand.brand_name,products:products});
    });
  }
  return Results;
};

// router.get('/confirm', (req, res) => {
//   res.render('confirm', { pageTitle "Confirm", mess: "Cảm ơn vì đã đăng kí! Mời quay lại trang chủ để chọn sản phẩm và đăng nhập" });
// });
module.exports = router;
