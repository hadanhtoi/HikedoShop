module.exports = function Cart(oldCart) {
  this.items = oldCart.items || {};
  this.totalQuantity = oldCart.totalQuantity || 0;
  this.totalPrice = oldCart.totalPrice || 0;
  this.add = (item, id, size, _quantity) => {
    const quantity = Number(_quantity);
    var storedItem = this.items[id];
    if (!storedItem) {
      storedItem = this.items[id] = { item: item, quantity: quantity, price: 0, sizes: [{ size: size, quantity: quantity }] };
      storedItem.price = storedItem.item.list_price * storedItem.quantity;
      this.totalQuantity += storedItem.quantity;
      this.totalPrice += storedItem.price;
    } else {
      let checked = false;
      for(let k in storedItem.sizes){
        if(storedItem.sizes.hasOwnProperty(k)){
          if(storedItem.sizes[k].size == size){
            checked = true;
            storedItem.sizes[k].quantity += quantity;
            storedItem.quantity += quantity;
            storedItem.price += storedItem.item.list_price * quantity;
            this.totalQuantity += quantity;
            this.totalPrice += storedItem.item.list_price * quantity;
            break;
          }
        }
      }
      if(checked == false){
        storedItem.sizes.push({size:size,quantity:quantity});
        storedItem.quantity +=quantity;
        storedItem.price += storedItem.item.list_price * quantity;
        this.totalQuantity += quantity;
        this.totalPrice += storedItem.item.list_price * quantity;
      }
    }
  };
  this.generateArray = function () {
    var arr = [];
    for (let id in this.items) {
      arr.push(this.items[id].item);
    }
    return arr;
  };
  this.remove = function (id) {
    if(this.items[id]){
    this.totalItems -= this.items[id].quantity;
    this.totalPrice -= this.items[id].price;
    delete this.items[id];
    }
  };


};