const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');
const UserSchema = mongoose.Schema({
  name: {
    type: String,
    require: true
  },
  email: {
    type: String,
    require: false,
    default: ""
  },
  password: {
    type: String,
    require: true
  },
  phone: {
    type: String,
    require: true
  },
  birthday: {
    type: String,
    require: true,
    default: ""
  },
  address: {
    type: String,
    require: true,
  },
  createdAt: {
    type: Date,
    default: Date.now()
  },
  updatedAt: {
    type: Date,
    default: Date.now()
  },
  authentication: {
    type: Number,
    require: false,
    default: 2,
  },
  image: {
    type: String,
    require: false,
    default: '/images/man-user.png'
  }
});
// methods ======================
// phương thực sinh chuỗi hash
// UserSchema.methods.generateHash = function (password) {
//   return bcrypt.hashSync(password, bcrypt.genSaltSync(10), null);
// };

// kiểm tra password có hợp lệ không
// UserSchema.methods.validPassword = function (password) {
//   return bcrypt.compareSync(password, this.local.password);
// };

const User = mongoose.model("User", UserSchema);

module.exports = User;
