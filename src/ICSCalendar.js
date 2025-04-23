import React, { useEffect, useState } from 'react';
import ical from 'ical.js';

const ICSCalendar = () => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    fetch('/my-calendar.ics')
      .then((res) => res.text())
      .then((data) => {
        const jcalData = ical.parse(data);
        const comp = new ical.Component(jcalData);
        const vevents = comp.getAllSubcomponents('vevent');

        const parsedEvents = vevents
          .map(event => {
            const e = new ical.Event(event);
            return {
              summary: e.summary,
              start: e.startDate.toJSDate(),
              end: e.endDate.toJSDate(),
              location: e.location,
            };
          })
          .filter(e => e.start > new Date()) // future events only
          .sort((a, b) => a.start - b.start) // sort by soonest
          .slice(0, 6); // show only next 6

        setEvents(parsedEvents);
      })
      .catch((err) => console.error('Error loading calendar:', err));
  }, []);

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 shadow-lg w-80 font-[Inter]">
      <h2 className="text-lg font-bold text-white mb-3">Upcoming Events</h2>
      <ul className="space-y-2">
        {events.map((event, index) => (
          <li key={index} className="bg-white/10 rounded-xl p-3 text-white text-sm shadow">
            <div className="font-semibold text-md">{event.summary}</div>
            <div className="text-xs text-gray-300">
              {event.start.toLocaleDateString()} — {event.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
            {event.location && (
              <div className="text-xs italic text-gray-400">{event.location}</div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ICSCalendar;
