const fs = require('fs');
const path = require('path');

const locales = {
  am: JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'locales', 'am.json'), 'utf-8')),
  en: JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'locales', 'en.json'), 'utf-8')),
};

const SUPPORTED = ['am', 'en'];
const DEFAULT_LANG = 'am';

function middleware(req, res, next) {
  // Priority: ?lang= query param > cookie > default
  let lang = req.query.lang;
  if (lang && SUPPORTED.includes(lang)) {
    res.cookie('lang', lang, { maxAge: 365 * 24 * 60 * 60 * 1000 });
  } else {
    lang = req.cookies && req.cookies.lang;
  }
  if (!SUPPORTED.includes(lang)) {
    lang = DEFAULT_LANG;
  }

  req.lang = lang;
  const dict = locales[lang];

  res.locals.lang = lang;
  res.locals.t = (key) => dict[key] || locales[DEFAULT_LANG][key] || key;
  res.locals.otherLang = lang === 'am' ? 'en' : 'am';

  next();
}

module.exports = { middleware, locales, SUPPORTED, DEFAULT_LANG };
