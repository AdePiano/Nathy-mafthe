// Simple JSON-file based data store.
// Two files: data/listings.json (all listings across all 9 categories)
//            data/bookings.json (all booking/order requests submitted by customers)

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const LISTINGS_FILE = path.join(DATA_DIR, 'listings.json');
const BOOKINGS_FILE = path.join(DATA_DIR, 'bookings.json');

function ensureFile(filePath, defaultContent) {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultContent, null, 2));
  }
}

ensureFile(LISTINGS_FILE, []);
ensureFile(BOOKINGS_FILE, []);

function readJSON(filePath) {
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw || '[]');
  } catch (err) {
    console.error('Error reading', filePath, err);
    return [];
  }
}

function writeJSON(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// ---------- Listings ----------

function getAllListings() {
  return readJSON(LISTINGS_FILE);
}

function getListingsByCategory(category) {
  return getAllListings().filter((l) => l.category === category);
}

function getListingById(id) {
  return getAllListings().find((l) => l.id === id);
}

function addListing(listing) {
  const listings = getAllListings();
  listings.unshift(listing); // newest first
  writeJSON(LISTINGS_FILE, listings);
  return listing;
}

function updateListing(id, updates) {
  const listings = getAllListings();
  const idx = listings.findIndex((l) => l.id === id);
  if (idx === -1) return null;
  listings[idx] = { ...listings[idx], ...updates };
  writeJSON(LISTINGS_FILE, listings);
  return listings[idx];
}

function deleteListing(id) {
  const listings = getAllListings();
  const filtered = listings.filter((l) => l.id !== id);
  writeJSON(LISTINGS_FILE, filtered);
  return filtered.length !== listings.length;
}

// ---------- Bookings ----------

function getAllBookings() {
  return readJSON(BOOKINGS_FILE);
}

function getBookingById(id) {
  return getAllBookings().find((b) => b.id === id);
}

function addBooking(booking) {
  const bookings = getAllBookings();
  bookings.unshift(booking);
  writeJSON(BOOKINGS_FILE, bookings);
  return booking;
}

function updateBooking(id, updates) {
  const bookings = getAllBookings();
  const idx = bookings.findIndex((b) => b.id === id);
  if (idx === -1) return null;
  bookings[idx] = { ...bookings[idx], ...updates };
  writeJSON(BOOKINGS_FILE, bookings);
  return bookings[idx];
}

function deleteBooking(id) {
  const bookings = getAllBookings();
  const filtered = bookings.filter((b) => b.id !== id);
  writeJSON(BOOKINGS_FILE, filtered);
  return filtered.length !== bookings.length;
}

module.exports = {
  getAllListings,
  getListingsByCategory,
  getListingById,
  addListing,
  updateListing,
  deleteListing,
  getAllBookings,
  getBookingById,
  addBooking,
  updateBooking,
  deleteBooking,
};
