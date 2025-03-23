import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import InterestChat from './components/InterestChat';
import EventList from './components/EventList';
import Connections from './components/Connections';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<InterestChat />} />
        <Route path="/events" element={<EventList />} />
        <Route path="/connections/:eventId" element={<Connections />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;