#!/usr/bin/env node

/**
 * Hash password for single-user auth
 * 
 * Usage: node scripts/hash-password.cjs "password"
 * Output: bcrypt hash (copy this to ADMIN_PASSWORD_HASH env var)
 */

const bcrypt = require('bcryptjs');

const password = process.argv[2];

if (!password) {
  console.error('Usage: node scripts/hash-password.cjs "password"');
  console.error('Example: node scripts/hash-password.cjs "Teamlead0101"');
  process.exit(1);
}

// Hash with 10 salt rounds (same as in auth.ts)
bcrypt.hash(password, 10, (err, hash) => {
  if (err) {
    console.error('Error hashing password:', err.message);
    process.exit(1);
  }
  
  // Output ONLY the hash (no other text)
  console.log(hash);
});
