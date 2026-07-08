// Single source of truth for the 9 categories.
// type: 'rent' | 'sale' | 'service'
// hasLocation: true = show kebele/subcity + area (km2/m2) fields (house & land)
// hasArea: true = show area size field

const CATEGORIES = [
  {
    slug: 'car-rental',
    icon: '🚗',
    type: 'rent',
    hasLocation: false,
    hasArea: false,
    name: { am: 'መኪና ኪራይ', en: 'Car Rental' },
  },
  {
    slug: 'car-sale',
    icon: '🚙',
    type: 'sale',
    hasLocation: false,
    hasArea: false,
    name: { am: 'መኪና ሽያጭ', en: 'Car Sales' },
  },
  {
    slug: 'house-rental',
    icon: '🏠',
    type: 'rent',
    hasLocation: true,
    hasArea: true,
    name: { am: 'ቤት ኪራይ', en: 'House Rental' },
  },
  {
    slug: 'house-sale',
    icon: '🏡',
    type: 'sale',
    hasLocation: true,
    hasArea: true,
    name: { am: 'ቤት ሽያጭ', en: 'House Sales' },
  },
  {
    slug: 'land-sale',
    icon: '🗺️',
    type: 'sale',
    hasLocation: true,
    hasArea: true,
    name: { am: 'መሬት ሽያጭ', en: 'Land Sales' },
  },
  {
    slug: 'wedding-suit-rental',
    icon: '🤵',
    type: 'rent',
    hasLocation: false,
    hasArea: false,
    name: { am: 'የሰርግ ልብስ ኪራይ', en: 'Wedding Suit Rental' },
  },
  {
    slug: 'sound-equipment-rental',
    icon: '🔊',
    type: 'rent',
    hasLocation: false,
    hasArea: false,
    name: { am: 'የድምጽ መሳሪያ ኪራይ', en: 'Sound Equipment Rental' },
  },
  {
    slug: 'decoration',
    icon: '🎉',
    type: 'service',
    hasLocation: false,
    hasArea: false,
    name: { am: 'ማስዋቢያ', en: 'Decoration' },
  },
  {
    slug: 'makeup',
    icon: '💄',
    type: 'service',
    hasLocation: false,
    hasArea: false,
    name: { am: 'ሜካፕ', en: 'Makeup' },
  },
];

// Common Hossana town kebeles / areas. Admin can also type a custom one.
const HOSSANA_AREAS = [
  'Kebele 01', 'Kebele 02', 'Kebele 03', 'Kebele 04', 'Kebele 05',
  'Kebele 06', 'Kebele 07', 'Kebele 08', 'Kebele 09', 'Kebele 10',
  'Kebele 11', 'Kebele 12', 'Kebele 13', 'Kebele 14',
  'Bobicho', 'Lisana', 'Gedeba', 'Jawe', 'Other (specify in description)',
];

function getCategory(slug) {
  return CATEGORIES.find((c) => c.slug === slug);
}

module.exports = { CATEGORIES, HOSSANA_AREAS, getCategory };
