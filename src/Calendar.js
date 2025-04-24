import React, { useEffect, useState } from 'react';
import ICAL from 'ical.js';
import './Calendar.css';


function Calendar() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchICS = async () => {
      try {
        const res = await fetch('/calendar.ics');
        const text = await res.text();
        const jcalData = ICAL.parse(text);
        const comp = new ICAL.Component(jcalData);
        const vevents = comp.getAllSubcomponents('vevent');

        const parsedEvents = vevents.map(event => {
          const e = new ICAL.Event(event);
          return {
            summary: e.summary,
            location: e.location,
            start: e.startDate.toJSDate(),
            end: e.endDate.toJSDate(),
          };
        });

        // Sort and limit to next 6 upcoming events
        const upcoming = parsedEvents
          .filter(e => e.start > new Date()) // only future events
          .sort((a, b) => a.start - b.start)
          .slice(0, 6);

        setEvents(upcoming);
      } catch (error) {
        console.error('Failed to load calendar:', error);
      }
    };

    fetchICS();
  }, []);

  return (
    <>
      <h2 style={{ textAlign: 'center', color: '#fff', fontSize: '2rem' }}>Upcoming Events</h2>
      <ul className="calendar-list">
        {events.map((e, index) => (
          <li key={index} className="calendar-event">
            <span className="event-date">
              {e.start.toLocaleDateString()} {e.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} – {e.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            <span className="event-summary">{e.summary}</span>
            {e.location && <span className="event-location">{e.location}</span>}
          </li>
        ))}
      </ul>
    </>
  );
  
  
}

export default Calendar;
