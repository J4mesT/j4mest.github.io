// netlify/functions/ics-proxy.js
import fetch from 'node-fetch';

export async function handler(event) {
  const url = event.queryStringParameters.url;
  if (!url) {
    return { statusCode: 400, body: 'Missing url' };
  }
  try {
    const res = await fetch(url);
    const body = await res.text();
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'text/calendar',
      },
      body,
    };
  } catch (err) {
    return { statusCode: 502, body: 'Upstream fetch failed' };
  }
}
