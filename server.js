//create varriables
const path = require("path");
const express = require("express");
const session = require("express-session");
const exphbs = require("express-handlebars");
const routes = require("./controllers");
const helpers = require("./utils/helpers");
const Post = require("./models/Post");
const User = require("./models/User");

//Sequelize Store
const sequelize = require("./config/connection");
const SequelizeStore = require("connect-session-sequelize")(session.Store);

const app = express();
const PORT = process.env.PORT || 3001;

// Set up Handlebars.js with custom helpers
const hbs = exphbs.create({ helpers });

const sess = {
  secret: "Super secret secret",
  cookie: {
    maxAge: 300000,
    httpOnly: true,
    secure: false,
    sameSite: "strict",
  },
  resave: false,
  saveUninitialized: true,
  store: new SequelizeStore({
    db: sequelize,
  }),
};

app.use(session(sess));

// Tell express.js which template engine to use
app.engine("handlebars", hbs.engine);
app.set("view engine", "handlebars");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "controllers")));
app.use((req, res, next) => {
  res.locals.logged_in = req.session.logged_in;
  next();
});

//routes
app.use(routes);

// turn on connection to database and server and activates server
sequelize.sync({ force: true }).then(() => {
  app.listen(PORT, () =>
    console.log("\n\nNow listening on http://localhost:3001/")
  );
});
