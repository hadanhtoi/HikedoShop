//index.ejs product
function clickAdd(element) {
  // var brand_index = Number(element.getAttribute("data-brand")) + 1;
  // var product_index = Number($(element).attr("data-index")) + 1;
  var product_id = element.getAttribute("data-id");
  var product_card = $(element).parents("div.product-card")[0];
  var product_quantity = $(product_card).find("input.quantity-item")[0];
  var product_size = $(product_card).find("select.productSize")[0];

  // console.log(brand_index);
  // console.log(product_index);
  // console.log(product_card);
  console.log($(product_size).val());

  $.ajax({
        type: "POST",
        url: "http://localhost:3000/addToCard",
        data: JSON.stringify({
          product_id: product_id,
          quantity: $(product_quantity).val(),
          size: $(product_size).val(),
          currentUrl: window.location.href
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
      });
}