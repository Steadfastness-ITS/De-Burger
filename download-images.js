const fs = require('fs');
const path = require('path');

if (typeof fetch !== 'function') {
  console.error('This script needs Node 18 or newer. Check with: node -v');
  process.exit(1);
}

const OUT_DIR = path.join(process.cwd(), 'assets', 'images');

const PHOTOS = {
  cheeseburger:    'photo-1568901346375-23c9450c58cd',
  veggieburger:    'photo-1550547660-d9450f859349',
  chickenburger:   'photo-1571091718767-18b5b1457add',
  crispyburger:    'photo-1594212699903-ec8a3eca50f5',
  baconburger:     'photo-1553979459-d2229ba7433b',
  pepperoni:       'photo-1542282811-943ef1a977c3',
  margherita:      'photo-1774806189017-f4c1f2760ad2',
  veggiepizza:     'photo-1559160582-eab6966b680f',
  bbqpizza:        'photo-1594179047502-07fb8a5451f6',
  chickenshawarma: 'photo-1562059390-a761a084768e',
  beefshawarma:    'photo-1529006557810-274b9b2fc783',
  mixedshawarma:   'photo-1646530208887-8a791bff4701',
  hotdog:          'photo-1638368593249-7cadb261e8b3',
  sub:             'photo-1768257164310-5f53c8d83a4e',
  wings:           'photo-1567620832903-9fc6debc209f',
  nuggets:         'photo-1696265498747-efc4c0dd7b98',
  drumsticks:      'photo-1585703900468-13c7a978ad86',
  fries:           'photo-1716042998725-0e0b957b9d99',
  tacos:           'photo-1599974579688-8dbdd335c77f',
  shake:           'photo-1648775948447-78c34dd56090',
};

const urlFor = (id) =>
  `https://images.unsplash.com/${id}?fm=jpg&q=80&w=800&fit=crop`;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function download(name, id) {
  const file = path.join(OUT_DIR, `${name}.jpg`);
  if (fs.existsSync(file) && fs.statSync(file).size > 5000) return 'already there';

  let lastError;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(urlFor(id), {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        redirect: 'follow',
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const type = res.headers.get('content-type') || '';
      if (!type.startsWith('image/')) throw new Error(`not an image (${type})`);
      fs.writeFileSync(file, Buffer.from(await res.arrayBuffer()));
      return 'saved';
    } catch (err) {
      lastError = err;
      await sleep(1500 * attempt);
    }
  }
  throw lastError;
}

(async () => {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  console.log(`Saving photos to ${OUT_DIR}\n`);

  const failed = [];
  for (const [name, id] of Object.entries(PHOTOS)) {
    try {
      const result = await download(name, id);
      console.log(`OK      ${name}.jpg  (${result})`);
    } catch (err) {
      failed.push(name);
      console.log(`FAILED  ${name}.jpg  (${err.message})`);
    }
  }

  const total = Object.keys(PHOTOS).length;
  console.log(`\n${total - failed.length} of ${total} photos ready.`);
  if (failed.length) {
    console.log('These are missing: ' + failed.join(', '));
    console.log('Check your internet connection and run the script again.');
    process.exit(1);
  }
  console.log('Done. Now restart Expo with: npx expo start -c');
})();