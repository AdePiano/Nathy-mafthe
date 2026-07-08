const express = require('express');
const { v4: uuidv4 } = require('uuid');

const db = require('../utils/db');
const { CATEGORIES, HOSSANA_AREAS, getCategory } = require('../utils/categories');

const router = express.Router();

// ---------- Home ----------
router.get('/', (req, res) => {
  const allListings = db.getAllListings().filter((l) => l.status === 'available');
  const latest = allListings.slice(0, 8);

  res.render('index', {
    categories: CATEGORIES,
    latest,
    getCategory,
  });
});

// ---------- Category listing ----------
router.get('/category/:slug', (req, res) => {
  const category = getCategory(req.params.slug);
  if (!category) {
    return res.status(404).render('404');
  }

  let listings = db.getListingsByCategory(category.slug);

  // Optional filter by location (for house/land)
  const { location, q } = req.query;
  if (location) {
    listings = listings.filter((l) => l.location === location);
  }
  if (q) {
    const query = q.toLowerCase();
    listings = listings.filter(
      (l) =>
        (l.title_am && l.title_am.toLowerCase().includes(query)) ||
        (l.title_en && l.title_en.toLowerCase().includes(query)) ||
        (l.description_am && l.description_am.toLowerCase().includes(query)) ||
        (l.description_en && l.description_en.toLowerCase().includes(query))
    );
  }

  res.render('category', {
    category,
    listings,
    categories: CATEGORIES,
    HOSSANA_AREAS,
    selectedLocation: location || '',
    q: q || '',
  });
});

// ---------- Listing detail ----------
router.get('/listing/:id', (req, res) => {
  const listing = db.getListingById(req.params.id);
  if (!listing) {
    return res.status(404).render('404');
  }
  const category = getCategory(listing.category);

  res.render('listing-detail', {
    listing,
    category,
    categories: CATEGORIES,
    submitted: req.query.submitted === '1',
  });
});

// ---------- Submit booking / order request ----------
router.post('/listing/:id/book', (req, res) => {
  const listing = db.getListingById(req.params.id);
  if (!listing) {
    return res.status(404).render('404');
  }

  const { customerName, customerPhone, paymentMethod, transactionRef, notes } = req.body;

  const booking = {
    id: uuidv4(),
    listingId: listing.id,
    listingTitleAm: listing.title_am,
    listingTitleEn: listing.title_en,
    category: listing.category,
    customerName: (customerName || '').trim(),
    customerPhone: (customerPhone || '').trim(),
    paymentMethod: paymentMethod || '',
    transactionRef: (transactionRef || '').trim(),
    notes: (notes || '').trim(),
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  db.addBooking(booking);

  res.redirect(`/listing/${listing.id}?submitted=1`);
});

// ---------- Contact page ----------
router.get('/contact', (req, res) => {
  res.render('contact');
});

// ---------- How to pay ----------
router.get('/how-to-pay', (req, res) => {
  res.render('how-to-pay');
});

module.exports = router;
