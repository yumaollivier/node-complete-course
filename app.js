const path = require('path');

// express import
const express = require('express');

const bodyParser = require('body-parser');

// express app initializing
const app = express();

app.set('view engine', 'ejs'); // view engine initialization
app.set('views', 'views'); // setting up routes for the views folder

const adminRoutes = require('./routes/admin.js');
const shopRoutes = require('./routes/shop.js');

const errorController = require('./controllers/error');
const sequelize = require('./util/database');
const Product = require('./models/products');
const User = require('./models/user');
const Cart = require('./models/cart');
const cartItem = require('./models/cart-item')

app.use((req, res, next) => {
  User.findByPk(1)
    .then(user => {
      req.user = user;
      console.log(user);
      next();
    })
    .catch(err => console.log(err));
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

Product.belongsTo(User, { constraints: true, onDelete: 'CASCADE' });
User.hasMany(Product);
User.hasOne(Cart);
Cart.belongsTo(User);
Cart.belongsToMany(Product, { through: cartItem });
Product.belongsToMany(Cart, { through: cartItem });

sequelize
  .sync({ force: true })
  .then(result => {
    return User.findByPk(1);
  })
  .then(user => {
    if (!user) {
      return User.create({ name: 'John', email: 'test@test.com' });
    }
    return user;
  })
  .then(user => {
    // console.log(user);
    app.listen(8200);
  })
  .catch(err => console.log(err));
