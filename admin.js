const express = require('express');
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const db = require('../utils/db');
const { CATEGORIES, HOSSANA_AREAS, getCategory } = require('../utils/categories');

const router = express.Router();

// ---------- Multer (image upload) config ----------
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'public', 'uploads'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${uuidv4().slice(0, 8)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 6 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

// ---------- Auth middleware ----------
function requireAuth(req, res, next) {
  if (req.session && req.session.isAdmin) {
    return next();
  }
  return res.redirect('/admin/login');
}

// ---------- Login / Logout ----------
router.get('/login', (req, res) => {
  if (req.session && req.session.isAdmin) {
    return res.redirect('/admin/dashboard');
  }
  res.render('admin/login', { error: null });
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const validUsername = process.env.ADMIN_USERNAME || 'admin';
  const validHash = process.env.ADMIN_PASSWORD_HASH;

  const usernameMatches = username === validUsername;
  let passwordMatches = false;
  if (validHash) {
    try {
      passwordMatches = bcrypt.compareSync(password || '', validHash);
    } catch (e) {
      passwordMatches = false;
    }
  }

  if (usernameMatches && passwordMatches) {
    req.session.isAdmin = true;
    return res.redirect('/admin/dashboard');
  }

  res.render('admin/login', { error: 'invalid' });
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/admin/login');
  });
});

// ---------- Dashboard ----------
router.get('/dashboard', requireAuth, (req, res) => {
  const listings = db.getAllListings();
  const bookings = db.getAllBookings();
  const pending = bookings.filter((b) => b.status === 'pending');

  res.render('admin/dashboard', {
    totalListings: listings.length,
    totalBookings: bookings.length,
    pendingBookings: pending.length,
    recentBookings: bookings.slice(0, 5),
  });
});

// ---------- Manage listings ----------
router.get('/listings', requireAuth, (req, res) => {
  const listings = db.getAllListings();
  res.render('admin/listings', { listings, categories: CATEGORIES, getCategory });
});

router.get('/listings/new', requireAuth, (req, res) => {
  res.render('admin/listing-form', {
    listing: null,
    categories: CATEGORIES,
    HOSSANA_AREAS,
    error: null,
  });
});

router.post('/listings/new', requireAuth, upload.array('images', 6), (req, res) => {
  const {
    category,
    title_am,
    title_en,
    description_am,
    description_en,
    price,
    priceType,
    location,
    areaSize,
    areaUnit,
  } = req.body;

  const cat = getCategory(category);
  if (!cat) {
    return res.render('admin/listing-form', {
      listing: null,
      categories: CATEGORIES,
      HOSSANA_AREAS,
      error: 'Invalid category',
    });
  }

  const images = (req.files || []).map((f) => `/uploads/${f.filename}`);

  const listing = {
    id: uuidv4(),
    category,
    title_am: (title_am || '').trim(),
    title_en: (title_en || '').trim(),
    description_am: (description_am || '').trim(),
    description_en: (description_en || '').trim(),
    price: price ? Number(price) : null,
    priceType: priceType || 'fixed',
    location: cat.hasLocation ? location || '' : '',
    areaSize: cat.hasArea && areaSize ? Number(areaSize) : null,
    areaUnit: cat.hasArea ? areaUnit || 'sqm' : null,
    images,
    status: 'available',
    createdAt: new Date().toISOString(),
  };

  db.addListing(listing);
  res.redirect('/admin/listings');
});

router.get('/listings/:id/edit', requireAuth, (req, res) => {
  const listing = db.getListingById(req.params.id);
  if (!listing) {
    return res.redirect('/admin/listings');
  }
  res.render('admin/listing-form', {
    listing,
    categories: CATEGORIES,
    HOSSANA_AREAS,
    error: null,
  });
});

router.post('/listings/:id/edit', requireAuth, upload.array('images', 6), (req, res) => {
  const existing = db.getListingById(req.params.id);
  if (!existing) {
    return res.redirect('/admin/listings');
  }

  const {
    category,
    title_am,
    title_en,
    description_am,
    description_en,
    price,
    priceType,
    location,
    areaSize,
    areaUnit,
    status,
  } = req.body;

  const cat = getCategory(category) || getCategory(existing.category);

  const newImages = (req.files || []).map((f) => `/uploads/${f.filename}`);
  const images = newImages.length > 0 ? [...existing.images, ...newImages] : existing.images;

  const updates = {
    category: cat.slug,
    title_am: (title_am || '').trim(),
    title_en: (title_en || '').trim(),
    description_am: (description_am || '').trim(),
    description_en: (description_en || '').trim(),
    price: price ? Number(price) : null,
    priceType: priceType || 'fixed',
    location: cat.hasLocation ? location || '' : '',
    areaSize: cat.hasArea && areaSize ? Number(areaSize) : null,
    areaUnit: cat.hasArea ? areaUnit || 'sqm' : null,
    images,
    status: status || existing.status,
  };

  db.updateListing(req.params.id, updates);
  res.redirect('/admin/listings');
});

router.post('/listings/:id/delete', requireAuth, (req, res) => {
  db.deleteListing(req.params.id);
  res.redirect('/admin/listings');
});

router.post('/listings/:id/toggle-status', requireAuth, (req, res) => {
  const listing = db.getListingById(req.params.id);
  if (!listing) {
    return res.redirect('/admin/listings');
  }
  const cat = getCategory(listing.category);
  let newStatus;
  if (listing.status === 'available') {
    newStatus = cat.type === 'sale' ? 'sold' : 'rented';
  } else {
    newStatus = 'available';
  }
  db.updateListing(req.params.id, { status: newStatus });
  res.redirect('/admin/listings');
});

// ---------- Manage bookings ----------
router.get('/bookings', requireAuth, (req, res) => {
  const bookings = db.getAllBookings();
  res.render('admin/bookings', { bookings });
});

router.post('/bookings/:id/status', requireAuth, (req, res) => {
  const { status } = req.body;
  db.updateBooking(req.params.id, { status });
  res.redirect('/admin/bookings');
});

router.post('/bookings/:id/delete', requireAuth, (req, res) => {
  db.deleteBooking(req.params.id);
  res.redirect('/admin/bookings');
});

module.exports = router;
