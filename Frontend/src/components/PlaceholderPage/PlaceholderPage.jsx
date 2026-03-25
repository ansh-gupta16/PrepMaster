import React from 'react';

const PlaceholderPage = ({ title }) => {
  return (
    <div style={{ padding: '2rem', textAlign: 'center', color: '#1e3a8a' }}>
      <h1>{title}</h1>
      <p>This module is currently under development.</p>
    </div>
  );
};

export default PlaceholderPage;