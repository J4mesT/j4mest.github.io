import fetch from 'node-fetch';
import { writeFileSync } from 'fs';

const calendarUrl = 'https://outlook.office365.com/owa/calendar/31941d49ba5446068f8d6e9f44174234@student.le.ac.uk/7ab362aa9f974df9b375a4fe05d3c40117474321622843054888/calendar.ics';
const filePath = "C:/Users/J8mes/calendar downloader/my-calendar.ics";

const downloadCalendar = async () => {
  const res = await fetch(calendarUrl);
  const data = await res.text();

  writeFileSync(filePath, data);
  console.log('Calendar downloaded to', filePath);
};

downloadCalendar();
