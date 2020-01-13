// $('#submitAddToCart').click(function (e) {
//   e.preventDefault();
//   var currentUrl = window.location.href;
//   var $productId = $('#productId');
//   var $quantity = $('#quantity');
//   var $size = $('#productSize');
//   $.ajax({
//     type: "POST",
//     url: "http://localhost:3000/addToCard",
//     data: JSON.stringify({
//       product_id: $productId.val(),
//       quantity: $quantity.val(),
//       size: $size.val(),
//       currentUrl: currentUrl
//     }),
//     contentType: "application/json; charset=utf-8",
//     dataType: "json",
//     success: (data) => {
//       console.log(data);

//       // $('#bagQuantity').html(data);
//     },
//   });
// });

$(document).ready(function(){
  $('#submitAddToCart').click(function (e) {
    e.preventDefault();
  var currentUrl = window.location.href;
  var $productId = $('#productId');
  var $quantity = $('#quantity');
  var $size = $('#productSize');
  console.log("**", $productId.val());
  console.log($quantity.val());
  console.log($size.val());
  console.log(window.location.href);
  $.ajax({
    type: "POST",
    url: "http://localhost:3000/addToCard",
    data: JSON.stringify({
      product_id: $productId.val(),
      quantity: $quantity.val(),
      size: $size.val(),
      currentUrl: currentUrl
    }),
    contentType: "application/json; charset=utf-8",
    dataType: "json",
    success: (data) => {
      console.log("Success: ",data);
      $('#bagQuantity').html(data.quantity);
    },
    error: (err)=>{
      console.log("Error: ",err);
    }
  })
});
});