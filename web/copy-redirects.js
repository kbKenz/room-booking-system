const fs = require('fs');

// Ensure the build directory exists
if (!fs.existsSync('./build')) {
  fs.mkdirSync('./build');
}

// Copy _redirects file to build folder
fs.copyFileSync('./_redirects', './build/_redirects');
console.log('_redirects file copied to build folder'); 