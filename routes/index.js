require('../app');
var mongoose = require('mongoose');
var express = require('express');
var router = express.Router();
var lodash = require('lodash');
const Product = require('../models/Product');
const Product2 = require('../models/Product2');
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
  for (const brand of brands) {
    const products = await Product.find({ brand_id: brand.id, category_id: selected_category_id }).limit(perPage);
    Results.push({ brand_name: brand.brand_name, products: products });
  }
  // const p1 = await Product.find({});
  // let arr = [];
  // for(p of p1){
  //   Product2.create({product_id:p.id,product_name:nonAccentVietnamese(p.product_name)});
  // }
  
  res.render('index', {
    pageTitle: "Sunny Shop",
    Results: Results
  });
});

router.get('/search/:page', async (req, res) => {
  const perPage = parseInt(req.params.perPage) || 8;
  const page = parseInt(req.params.page) || 1;
  const query1 = req.query.search_string;
  let query = query1.toString().toLowerCase();
   query = nonAccentVietnamese(query1.trim())
  // console.log("111",req.url.toString());
  // console.log("222",req.baseUrl.toString());
  // console.log("3333",req.originalUrl.toString());
  // console.log("444",req.query);
  // console.log("55",req.path);
  // console.log("66".req.body);
//   111 /search/1?search_string=giay
// 222 
// 3333 /search/1?search_string=giay
// 444 { search_string: 'giay' }
// 55 /search/1
  let products = await Product2.find({
    $text: { $search: query }
  }, { score: { $meta: "textScore" } }
  );//score: { $meta: "textScore" }
  // products =  await sortArr(products,["list_price"],['asc']);
  // let _products = products.slice(perPage*page - perPage ,perPage*page ) //skip(perPage*page - perPage).limit(perPage);
  let result = await getSearchProducts(products);
  let count =  await Product2.find({
    $text: { $search: query }
  }, { score: { $meta: "textScore" } }
  )
  let _products = result.slice(perPage*page - perPage ,perPage*page )
    
  if(_products.length < 1){
    res.render('404',{
      pageTitle:"404"
    });
  }else{
    res.render('search',{
      pageTitle:"Search Page",
      products:_products,
      current:page,
      pages:Math.ceil(count.length/perPage),
      search_string:query,
      query_string: req.query.search_string,
      count:count.length,
      perPage:perPage
    });
  }
});

router.get("/api/products",(req,res)=>{

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

async function sortArr (a,b,c){
  return lodash.sortBy(a,b,c);
}

async function getBrands() {
  await awaitReconnectDB();
  return await Brand.find({}).lean().exec((err, items) => {
    if (err) {
      throw err;
    }
    return items;
  });
}

async function escapeRegex (string)  {
  return string.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

async function awaitReconnectDB() {
  return mongoose.connection.readyState == 1;
};

async function getSearchProducts(array) {
  let products = [];
  for (let arr of array) {
   let prod = await Product.findById(arr.product_id);
      products.push(prod);
  }
 products = await sortArr(products,["list_price"],['asc'])
  return products;
}

async function getDocumentsByBrands(perPage, brands) {
  var Results = [];
  for (brand of brands) {
    await Product.find({ brand_id: brand.id }).limit(perPage).lean().exec((err, products) => {
      Results.push({ brand_name: brand.brand_name, products: products });
    });
  }
  return Results;
};

function nonAccentVietnamese(str) {
  str = str.toLowerCase();
  //     We can also use this instead of from line 11 to line 17
  //     str = str.replace(/\u00E0|\u00E1|\u1EA1|\u1EA3|\u00E3|\u00E2|\u1EA7|\u1EA5|\u1EAD|\u1EA9|\u1EAB|\u0103|\u1EB1|\u1EAF|\u1EB7|\u1EB3|\u1EB5/g, "a");
  //     str = str.replace(/\u00E8|\u00E9|\u1EB9|\u1EBB|\u1EBD|\u00EA|\u1EC1|\u1EBF|\u1EC7|\u1EC3|\u1EC5/g, "e");
  //     str = str.replace(/\u00EC|\u00ED|\u1ECB|\u1EC9|\u0129/g, "i");
  //     str = str.replace(/\u00F2|\u00F3|\u1ECD|\u1ECF|\u00F5|\u00F4|\u1ED3|\u1ED1|\u1ED9|\u1ED5|\u1ED7|\u01A1|\u1EDD|\u1EDB|\u1EE3|\u1EDF|\u1EE1/g, "o");
  //     str = str.replace(/\u00F9|\u00FA|\u1EE5|\u1EE7|\u0169|\u01B0|\u1EEB|\u1EE9|\u1EF1|\u1EED|\u1EEF/g, "u");
  //     str = str.replace(/\u1EF3|\u00FD|\u1EF5|\u1EF7|\u1EF9/g, "y");
  //     str = str.replace(/\u0111/g, "d");
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
  str = str.replace(/đ/g, "d");
  // Some system encode vietnamese combining accent as individual utf-8 characters
  str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, ""); // Huyền sắc hỏi ngã nặng 
  str = str.replace(/\u02C6|\u0306|\u031B/g, ""); // Â, Ê, Ă, Ơ, Ư
  return str;
}

// router.get('/confirm', (req, res) => {
//   res.render('confirm', { pageTitle "Confirm", mess: "Cảm ơn vì đã đăng kí! Mời quay lại trang chủ để chọn sản phẩm và đăng nhập" });
// });
module.exports = router;
