// Run: node utils/hash-password.js yourNewPassword
// Copy the printed hash into your .env file as ADMIN_PASSWORD_HASH
const bcrypt = require('bcryptjs');

const password = process.argv[2];

if (!password) {
  console.log('Usage: node utils/hash-password.js yourNewPassword');
  process.exit(1);
}

const hash = bcrypt.hashSync(password, 10);
console.log('\nCopy this into your .env file as ADMIN_PASSWORD_HASH:\n');
console.log(hash);
console.log('');
