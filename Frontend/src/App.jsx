import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Dashboard from './components/Dashboard/Dashboard';
import PlaceholderPage from './components/PlaceholderPage/PlaceholderPage';
import CodingSimulator from './components/CodingSimulator/CodingSimulator';
import Assessments from './components/Assessments/Assessments';
import Interview from './components/Interview/Interview';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="assessment" element={<Assessments />} />
          <Route path="simulator" element={<CodingSimulator />} />
          <Route path="interview" element={<Interview/>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;