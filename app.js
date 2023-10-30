const express = require("express");
const bodyParser = require("body-parser");
const path = require('path');
const session = require('express-session');
const mongoStore = require('connect-mongo');
const flash = require('connect-flash');
const exphbs = require('express-handlebars');
const passport = require('passport');
const bcrypt = require('bcrypt');
const rate = require("./crawler");

// Import database configuration
require("./mongodb/db");

const app = express();
const PORT = process.env.PORT || 5000;


app.use(session({
  secret: 'required1234$',
  resave: false,
  saveUninitialized: false,
  store: mongoStore.create({
    mongoUrl: 'mongodb+srv://richynaomi30:Required1234@cluster0.uewqabx.mongodb.net/onlinebanking'
  }),
  cookie : {maxAge : 1000 * 60 * 60,}
}));

// Configure middlewares
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// Configure session


// Configure view engine
const viewspath = path.join(__dirname, './view');
app.engine('hbs', exphbs.engine({ defaultLayout: 'main', extname: 'hbs' }));
app.set('view engine', 'hbs');
app.set('views', viewspath);

// Define routes
app.use("/", require("./routes/index"));
app.use("/login", require("./routes/login"));
app.use("/register", require("./routes/register"));
app.use("/dashboard", require("./routes/dashboard"));
app.use("/admin", require("./routes/admin.js"));

app.listen(PORT, () => {
  console.log(`Listening on PORT ${PORT}`);
});
