import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import NowPlaying from './NowPlaying';
import Weather from './Weather';
import CalendarEmbed from './CalendarEmbed';

function App() {
  return (
    <Container className="py-5">
      {/* Site Header */}
      <header className="mb-5 text-center">
        <h1 className="display-4">Welcome to J4mesT’s Site</h1>
      </header>

      {/* Now Playing Section */}
      <Row className="mb-4">
        <Col>
          <h2 className="h4">Now Listening</h2>
          <NowPlaying />
        </Col>
      </Row>

      {/* Weather + Calendar */}
      <Row>
        <Col md={6} className="mb-4">
          <h2 className="h4">Weather</h2>
          <Weather />
        </Col>
        <Col md={6}>
          <CalendarEmbed />
        </Col>
      </Row>
    </Container>
  );
}

export default App;
