# HikedoShop

1.Clone project to pc
2.cd HikedoShop/
3.Install node_modules to project
$npm install
4.Install nodemon (search)
$npm install -g nodemon
5.run $nodemon start
# EJS
<% include partials/head %>
or
<%- include('./partials/head.ejs'); %>

# Khi bị lỗi page not defined thì có thể comment biến page trong head.ejs và load lại xem lỗi, chủ yếu là do express ko tìm thấy điều hướng

# Date
createdAt: {
    type: Date,
    default: Date.now()
  },

  # a button type
  <a href="http://google.com" class="button btn-default">Bootstrap</a>