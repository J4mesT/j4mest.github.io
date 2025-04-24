const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());

const ICS_PATH = path.join(__dirname, 'public', 'calendar.ics');

app.post('/add-event', (req, res) => {
  const { title, description, location, date, time } = req.body;

  if (!title || !date || !time) {
    return res.status(400).send('Missing fields');
  }

  const [year, month, day] = date.split('-');
  const [hour, minute] = time.split(':');
  const start = `${year}${month}${day}T${hour}${minute}00`;
  const endHour = String(Number(hour) + 1).padStart(2, '0');
  const end = `${year}${month}${day}T${endHour}${minute}00`;

  const newEvent = `
BEGIN:VEVENT
SUMMARY:${title}
DESCRIPTION:${description}
LOCATION:${location}
DTSTART:${start}
DTEND:${end}
END:VEVENT
`.trim();

  fs.readFile(ICS_PATH, 'utf8', (err, data) => {
    if (err) return res.status(500).send('Could not read .ics file');

    const updated = data.replace('END:VCALENDAR', newEvent + '\nEND:VCALENDAR');
    fs.writeFile(ICS_PATH, updated, (err) => {
      if (err) return res.status(500).send('Failed to write event');
      res.send('Event added!');
    });
  });
});

app.use(express.static(path.join(__dirname, 'public'))); // serve static files

app.listen(3001, () => {
  console.log('Server running at http://localhost:3001');
});
