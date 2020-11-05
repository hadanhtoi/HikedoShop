function updateItem(element) {
  // var product_id = element.getAttribute("id");
  // var sizes = [];
  // var item = $(element).parents("tr._item");
  // $(item).find()
  alert("comming soon");
}

function finishOrder() {
  var customer = $("#customerId").val();
  var phone = $("#phoneId").val();
  var address = $("#addressId").val();
  var description = $("#description").val();

  if (customer.length < 1 || phone.length < 1 || address.length < 1 || /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/.test(phone) == false) {
    window.location.href = "/shoppingCart"
  } else {
    $.ajax({
      type: "POST",
      url: "/shop/finishOrder",
      data: JSON.stringify({
        customer: customer,
        phone: phone,
        address: address,
        description: description
      }),
      contentType: "application/json; charset=utf-8",
      dataType: "json",
      success: function(data)  {
        // location.reload();
        alert(data.mes);
        window.location.href = "/";
      },
      error: (err) => {
        console.log("Error: ", err);
      }
    });
  }
}

// document.ondblclick = function () {
//   var sel = (document.selection && document.selection.createRange().text) ||
//             (window.getSelection && window.getSelection().toString());
//   alert(sel);
// };

// function getSelectionText() {
//   var text = "";
//   var activeEl = document.activeElement;
//   var activeElTagName = activeEl ? activeEl.tagName.toLowerCase() : null;
//   if (
//     (activeElTagName == "textarea") || (activeElTagName == "input" &&
//     /^(?:text|search|password|tel|url)$/i.test(activeEl.type)) &&
//     (typeof activeEl.selectionStart == "number")
//   ) {
//       text = activeEl.value.slice(activeEl.selectionStart, activeEl.selectionEnd);
//   } else if (window.getSelection) {
//       text = window.getSelection().toString();
//   }
//   return text;
// }

document.onselectionchange = function() {
// document.getElementById("sel").value = getSelectionText();
alert(getSelectionText());
};
function getSelText()
{
    var txt = '';
     if (window.getSelection)
    {
        txt = window.getSelection();
             }
    else if (document.getSelection)
    {
        txt = document.getSelection();
            }
    else if (document.selection)
    {
        txt = document.selection.createRange().text;
            }
    else txt = '';
return txt;
}

document.onmouseup =  document.ondblclick = function(){
  if(getSelText() != ""){
    alert(getSelText())
  }
};





