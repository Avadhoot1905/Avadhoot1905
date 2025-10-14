const Parser = require('rss-parser');
const parser = new Parser();

async function test() {
  try {
    const feed = await parser.parseURL('https://medium.com/feed/@arcsmo19');
    console.log('Feed parsed successfully!');
    console.log('Total items:', feed.items.length);
    console.log('\nFirst item structure:');
    console.log(JSON.stringify(feed.items[0], null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  }
}

test();
