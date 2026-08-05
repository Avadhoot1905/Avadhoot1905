const https = require('https');
const fs = require('fs');

const download = (url, dest) => {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => reject(err));
    });
  });
};

Promise.all([
  download('https://upload.wikimedia.org/wikipedia/commons/1/18/2048_logo.svg', 'public/assets/macos/2048_logo.svg'),
  download('https://upload.wikimedia.org/wikipedia/commons/b/b3/Terminalicon2.png', 'public/assets/macos/Terminalicon2.png'),
  download('https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_Notes_icon.svg', 'public/assets/macos/Apple_Notes_icon.svg')
]).then(() => console.log('Done')).catch(console.error);
