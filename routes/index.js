require('../app');
var mongoose = require('mongoose');
var express = require('express');
var router = express.Router();
var lodash = require('lodash');
const Product = require('../models/Product');
const Product2 = require('../models/Product2');
const Brand = require('../models/Brand');
const Category = require('../models/Category');
const Order = require("../models/Order");
const selected_category_id = require('../config/constant').SELECTED_CATEGORY_ID;
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');
var Cart = require("../models/Cart");
/* GET home page. */
router.get('/', async (req, res, next) => {
  const perPage = 8;
  const page = parseInt(req.params.page) || 1;
  var Results = [];
  
  awaitReconnectDB();
  if (!req.session.cart) {
    req.session.cart = new Cart(req.session.cart ? req.session.cart : {});
  }
  const brands = await Brand.find({}).limit(3);
  for (const brand of brands) {
    const products = await Product.find({ brand_id: brand.id, category_id: selected_category_id }).limit(perPage);
    let amountArr = [];
    for(let i=0;i<products.length;i++){
      if(products[i].sizes.length >0){
        let amount = 0;
        for(let k in products[i].sizes){
          if(products[i].sizes.hasOwnProperty(k)){
            if(products[i].sizes[k].amount){
              amount += products[i].sizes[k].amount;
            }
          }
        }
        amountArr[products[i]._id]=amount;
      }
    }
    Results.push({ brand_name: brand.brand_name, products: products,amount:amountArr });
  }
  //create product2 collection 
  // const p1 = await Product.find({});
  // let arr = [];
  // for(p of p1){
  //   Product2.create({product_id:p.id,product_name:nonAccentVietnamese(p.product_name)});
  // }
  let items = req.session.cart.items;
  // for (let i in items) {
  //   if (items.hasOwnProperty(i)) {
  //     // console.log(`${i}:${items[i]}`);
  //     console.log(items[i]);
  //   }
  // }
  res.render('index', {
    pageTitle: "Sunny Shop",
    Results: Results
  });
});

router.get('/productDetails/:id', async (req, res) => {
  const id = req.params.id;
  // await Product.findById(id, (err, product) => {
  //   if (err) {
  //     return res.redirect("/");
  //   }
  //   const brand = getBrandById(product.brand_id);
  //   const cate = getCategoryById(product.category_id);
  //   console.log("**", brand);
  //   console.log("**", cate);

  //   res.render('productDetails', {
  //     pageTitle: "Product Title",
  //     product: product,
  //     brandName: brand,
  //     categoryName: cate
  //   })
  // });
  const product = await Product.findById(id);
  let amount = getAmountOfProduct(product);
  const brand = await getBrandById(product.brand_id);
  const cate = await getCategoryById(product.category_id);
    res.render('productDetails', {
          pageTitle: "Product Title",
          product: product,
          brandName: brand[0].brand_name,
          categoryName: cate[0].category_name,
          amount:amount
        })
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
  );
  let result = await getSearchProducts(products);
  let count = await Product2.find({
    $text: { $search: query }
  }, { score: { $meta: "textScore" } }
  )
  let _products = result.slice(perPage * page - perPage, perPage * page);
  let amountArr = [];
    for(let i=0;i<_products.length;i++){
      if(_products[i].sizes.length >0){
        let amount = 0;
        for(let k in _products[i].sizes){
          if(_products[i].sizes.hasOwnProperty(k)){
            if(_products[i].sizes[k].amount){
              amount += _products[i].sizes[k].amount;
            }
          }
        }
        amountArr[_products[i]._id]=amount;
      }
    }
  if (_products.length < 1) {
    // res.render('404', {
    //   pageTitle: "404"
    // });
    res.render('search', {
      pageTitle: "Search Page",
      error_msg: "Không tìm thấy kết quả nào!",
      query_string: req.query.search_string
    });
  } else {
    res.render('search', {
      pageTitle: "Search Page",
      products: _products,
      current: page,
      pages: Math.ceil(count.length / perPage),
      search_string: query,
      query_string: req.query.search_string,
      count: count.length,
      perPage: perPage,
      amount:amountArr
    });
  }
});

router.get("/products/:page", async (req, res) => {
  const perPage = parseInt(req.params.perPage) || 8;
  const page = parseInt(req.params.page) || 1;
  const products = await getAllProducts();
  let _products = products.slice(perPage * page - perPage, perPage * page);
  res.render("filterProducts", {
    pageTitle: "Products Page",
    products: _products,
    current: page,
    perPage: perPage,
    query_string: "",
    count: products.length,
    pages: Math.ceil(products.length / perPage),
  });
});
// GET add to card router
// router.get('/add-to-cart/:id', (req, res) => {
  
//   let cart = new Cart(req.session.cart ? req.session.cart : {});
//   Product.findById(productId, (err, product) => {
//     if (err) {
//       return res.redirect("/");
//     }
//     cart.add(product, product.id);
//     req.session.cart = cart;
//     res.redirect("/");
//   });
// });
// POST add to cart
router.post("/addToCard",(req,res)=>{
  const product_id = req.body.product_id;
  const quantity = req.body.quantity;
  const size = req.body.size;
  const currentUrl = req.body.currentUrl;
  let cart = new Cart(req.session.cart ? req.session.cart : {});
  Product.findById(product_id, (err, product) => {
    if(err){
      console.log("Add To Cart Error: "+e.message);
      return res.redirect('/');
    }
    cart.add(product,product_id,size,quantity);
    req.session.cart = cart;
    console.log("***",cart)
    console.log("ori",req.originalUrl);
    console.log("url",req.url.toString());
    console.log("base",req.baseUrl);
    // res.send(cart.totalQuantity)
    res.status(200).send({quantity : cart.totalQuantity});
  });
});
//finishOrder
router.post('/shop/finishOrder',(req,res)=>{
  const customer = req.body.customer;
  const phone = req.body.phone;
  const address = req.body.address;
  const description = req.body.description;
  const cart = req.session.cart;
  const newOrder = new Order({
    user_id: (!req.user)?(""):req.user.id,
    total_price: cart.totalPrice,
    description:description,
    status: "processing",
    address_shipping:address,
    phone_number:phone,
    customer_name:customer,
    sale_code:0,
  });
  newOrder.save()
  .then(order =>{
    req.session.cart = new Cart({});
    res.send({mes:"Tạo order thành công",red:"/"});
  })
  .catch(err => console.log(err.message)
  )
});
//shopping cart
router.get('/shoppingCart', (req, res) => {
  // let items = [];
  // if (!req.session.cart) {
  //   return res.render('shoppingCart', { products: null });
  // }
  // let cart = new Cart(req.session.cart);
  // for (let key in cart.items) {
  //   if (cart.items.hasOwnProperty(key)) {
  //     Product.findById(key, (err, product) => {
        // items.push({item:product,quantity:cart.items[key].price:cart.items})
  //     });
  //   }
  // }
  if (!req.session.cart) {
      return res.render('shoppingCart', { cart: {} });
    }
    let cart = new Cart(req.session.cart);
    // let amountArr = [];
    // let _prods = cart.generateArray();
    // for(let i=0;i<_prods.length;i++){
    //   if(_prods[i].sizes.length >0){
    //     let amount = 0;
    //     for(let k in _prods[i].sizes){
    //       if(_prods[i].sizes.hasOwnProperty(k)){
    //         if(_prods[i].sizes[k].amount){
    //           amount += _prods[i].sizes[k].amount;
    //         }
    //       }
    //     }
    //     amountArr[_prods[i]._id]=amount;
    //   }
    // }
  res.render('shoppingCart',{
    cart:cart,
    user:req.user
  })
});

router.post("/products/:page", async (req, res) => {
  const perPage = parseInt(req.body.perPage) || 8;
  const page = parseInt(req.body.page) || 1;
  const brandId = parseInt(req.body.brandId) || 0;
  const categoryId = req.body.categoryId || 0
  const sortBy = req.body.sortBy || 0
  const arrow = req.body.arrow || 0
  const brandArray = await getBrands();
  const categoryArray = await getCategories();
  let and;
  let or = []
  var childCategories;
  let options;

  ///products/1?brandId=1&categoryId=0&sortBy=0&arrow=0

  if (brandId == 0) {
    and = {}
  } else {
    for (brand of brandArray) {
      if (brand.id == brandId) {
        and = { brand_id: brand.id }
      }
    }
  }
  if (categoryId == 0) {
    or.push({});
  } else {
    for (category of categoryArray) {
      if (category.id == categoryId) {
        childCategories = await getChildCategory(category);
        if (childCategories.length == 0) {
          or.push({ category_id: category.id })
        } else {
          for (child of childCategories) {
            or.push({ category_id: child.id })
          }
        }
      }
    }
  }
  let sorted = arrow == 0 ? 1 : (-1);
  var prods;
  options = {
    $and: [
      and,
      { $or: or },
    ]
  }
  if (sortBy == 0) {
    prods = await Product.find(options).sort({ list_price: sorted })

  } else {
    prods = await Product.find(options).sort({ product_name: sorted })
  }
  let _prods = prods.slice(perPage * page - perPage, perPage * page);
  // res.send(brandId + "" + categoryId + "" + sortBy + "" + arrow + "*" + prods.length + "*" + prods.toString());
  res.render("filterProducts", {
    pageTitle: "Products Page",
    products: _prods,
    current: page,
    perPage: perPage,
    count: prods.length,
    pages: Math.ceil(prods.length / perPage),
    query_string: req.originalUrl.toString(),
    selectedBrand: brandId,
    selectedCategory: categoryId,
    selectedSortBy: sortBy,
    selectedArrow: arrow
  });
});

router.get("/products/filter/:page", async (req, res) => {
  // console.log("##",req.originalUrl);/filter?brandId=1&categoryId=1&sortBy=0&arrow=0
  // console.log("&&",req.path);// /filter
  const perPage = parseInt(req.params.perPage) || 8;
  const page = parseInt(req.params.page) || 1;
  const brandId = req.query.brandId
  const categoryId = req.query.categoryId
  const sortBy = req.query.sortBy
  const arrow = req.query.arrow
  const brandArray = await getBrands();
  const categoryArray = await getCategories();
  let and;
  let or = []
  var childCategories;
  let options;
  if (brandId == 0) {
    and = {}
  } else {
    for (brand of brandArray) {
      if (brand.id == brandId) {
        and = { brand_id: brand.id }
      }
    }
  }
  if (categoryId == 0) {
    or.push({});
  } else {
    for (category of categoryArray) {
      if (category.id == categoryId) {
        childCategories = await getChildCategory(category);
        if (childCategories.length == 0) {
          or.push({ category_id: category.id })
        } else {
          for (child of childCategories) {
            or.push({ category_id: child.id })
          }
        }
      }
    }
  }
  let sorted = (arrow == 0) ? 1 : (-1);
  var prods;
  options = {
    $and: [
      and,
      { $or: or },
    ]
  }
  if (sortBy == 0) {
    prods = await Product.find(options).sort({ list_price: sorted })

  } else {
    prods = await Product.find(options).sort({ product_name: sorted })
  }
  let originalUrl = req.originalUrl.toString();
  if(prods.length < 1){
    res.render('filterProducts',{
      pageTitle:"Filter Products",
      error_msg:"Không tìm thấy kết quả nào",
      query_string:originalUrl
    });
  }else{
    let _prods = prods.slice(perPage * page - perPage, perPage * page);
  let amountArr = [];
    for(let i=0;i<_prods.length;i++){
      if(_prods[i].sizes.length >0){
        let amount = 0;
        for(let k in _prods[i].sizes){
          if(_prods[i].sizes.hasOwnProperty(k)){
            if(_prods[i].sizes[k].amount){
              amount += _prods[i].sizes[k].amount;
            }
          }
        }
        amountArr[_prods[i]._id]=amount;
      }
    }
  
  // res.send(req.originalUrl.toString())
  // res.send(brandId+"*"+categoryId+"*"+sortBy+"*"+arrow+'/\n'+prods.length+"###"+prods)
  ///products/filter/1?brandId=8&categoryId=0&sortBy=0&arrow=0
  res.render("filterProducts", {
    pageTitle: "Products Filter Page",
    products: _prods,
    current: page,
    perPage: perPage,
    count: prods.length,
    pages: Math.ceil(prods.length / perPage),
    query_string: req.originalUrl.substring(originalUrl.indexOf('?')),
    selectedBrand: brandId,
    selectedCategory: categoryId,
    selectedSortBy: sortBy,
    selectedArrow: arrow,
    amount:amountArr
  });
  }

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

async function sortArr(a, b, c) {
  return lodash.sortBy(a, b, c);
}

async function getChildCategory(category) {
  let categoryArray = await getCategories();
  let childCategories = categoryArray.filter(ele => ele.parent_category == category.id)
  return childCategories;
}

async function convertStringToObject(str) {
  var obj = {};
  if (str && typeof str === 'string') {
    var objStr = str.match(/\{(.)+\}/g);
    eval("obj =" + objStr);
  }
};

async function getBrands() {
  await awaitReconnectDB();
  return await Brand.find({}).lean().exec((err, items) => {
    if (err) {
      throw err;
    }
    return items;
  });
}

async function escapeRegex(string) {
  return string.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

async function awaitReconnectDB() {
  return mongoose.connection.readyState == 1;
};

async function getBrandById(id) {
   return await Brand.find({ id: id });
}

async function getCategoryById(id) {
  return await Category.find({ id: id });
}

async function getSearchProducts(array) {
  let products = [];
  for (let arr of array) {
    let prod = await Product.findById(arr.product_id);
    products.push(prod);
  }
  products = await sortArr(products, ["list_price"], ['asc'])
  return products;
}

async function getDocumentsByBrands(perPage, brands) {
  let Results = [];
  for (brand of brands) {
    await Product.find({ brand_id: brand.id }).limit(perPage).lean().exec((err, products) => {
      Results.push({ brand_name: brand.brand_name, products: products });
    });
  }
  return Results;
};

async function getBrands() {
  return await Brand.find({});
}
async function getCategories() {
  return await Category.find({});
};

async function getAllProducts() {
  return await Product.find({}).sort({ list_price: 1 });
}

async function convertPrice(number) {
  return await number.toLocaleString('it-IT', { style: 'currency', currency: 'VND' });
}

function getAmountOfProduct(prod){
  let amount = 0
  if(prod.sizes.length == 0){
    return 0;
  }
  for(let k in prod.sizes){
    if(prod.sizes.hasOwnProperty(k)){
      if(prod.sizes[k].amount){
        amount += prod.sizes[k].amount;
      }
    }
  }
  return amount
}

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
