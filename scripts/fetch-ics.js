// scripts/fetch-ics.js
const ical = require('ical');
const fs = require('fs');
const https = require('https');

const ICS_URL = 'https://outlook.office365.com/owa/calendar/31941d49ba5446068f8d6e9f44174234@student.le.ac.uk/ed5d16aaf1534ef08673eed39f85ea515267399925583823516/calendar.ics'; // your real .ics URL
const OUT_PATH = 'public/calendar.json';

https.get(ICS_URL, (res) => {
  let raw = '';
  res.on('data', (chunk) => { raw += chunk; });
  res.on('end', () => {
    const parsed = ical.parseICS(raw);
    const events = Object.values(parsed)
      .filter(e => e.type === 'VEVENT')
      .map(e => ({
        uid: e.uid,
        summary: e.summary,
        start: e.start,
        end: e.end,
        location: e.location || '',
        url: e.url || '',
      }));
    fs.writeFileSync(OUT_PATH, JSON.stringify(events, null, 2));
    console.log(`Wrote ${events.length} events to ${OUT_PATH}`);
  });
}).on('error', (err) => {
  console.error('Error fetching ICS:', err);
  process.exit(1);
});
