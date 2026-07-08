require('dotenv').config();

const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const path = require('path');

const i18n = require('./utils/i18n');
const { CATEGORIES } = require('./utils/categories');

const mainRoutes = require('./routes/main');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3000;

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Body parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Sessions (used for admin login)
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'dev-secret-change-me',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 8 * 60 * 60 * 1000, // 8 hours
    },
  })
);

// Language detection (Amharic / English)
app.use(i18n.middleware);

// Make contact info available to all views
app.use((req, res, next) => {
  res.locals.CONTACT_PHONE = process.env.CONTACT_PHONE || '+251926285799';
  res.locals.CBE_ACCOUNT_NAME = process.env.CBE_ACCOUNT_NAME || 'Mafithe Alle Hossana';
  res.locals.CBE_ACCOUNT_NUMBER = process.env.CBE_ACCOUNT_NUMBER || '1000123456789';
  res.locals.TELEBIRR_NUMBER = process.env.TELEBIRR_NUMBER || '+251926285799';
  res.locals.categories = CATEGORIES;
  next();
});

// Routes
app.use('/', mainRoutes);
app.use('/admin', adminRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).render('404');
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send('Something went wrong. Please try again later.');
});

app.listen(PORT, () => {
  console.log(`Mafithe Alle Hossana running on port ${PORT}`);
});
