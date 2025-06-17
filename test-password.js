const bcrypt = require('bcryptjs');

const hash = '$2a$10$DJk03IntjCaiqCn3QTCGJuTFI8UNTvnGiQ/w9/620ziMlnwRo9l6i';
const passwords = ['admin123', 'password123', 'admin', 'Admin123', 'password'];

passwords.forEach(password => {
  if (bcrypt.compareSync(password, hash)) {
    console.log(`✓ Passwort gefunden: ${password}`);
  }
});
