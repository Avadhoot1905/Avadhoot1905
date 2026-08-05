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
  download('https://db.onlinewebfonts.com/t/2222cf021b5f54c92d76328a2f7ec80b.woff2', 'public/fonts/EckmannpsychSmall.woff2'),
  download('https://db.onlinewebfonts.com/t/2222cf021b5f54c92d76328a2f7ec80b.woff', 'public/fonts/EckmannpsychSmall.woff'),
  download('https://db.onlinewebfonts.com/t/2222cf021b5f54c92d76328a2f7ec80b.ttf', 'public/fonts/EckmannpsychSmall.ttf')
]).then(() => console.log('Fonts downloaded successfully.')).catch(console.error);
