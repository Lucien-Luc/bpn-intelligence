import React from 'react';

function TestApp() {
  return (
    <div style={{ padding: '20px', backgroundColor: '#f0f0f0', minHeight: '100vh' }}>
      <h1>BPN Intelligence Test</h1>
      <p>If you can see this, React is working!</p>
      <div style={{ 
        width: '64px', 
        height: '64px', 
        backgroundColor: '#00728e', 
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '20px 0'
      }}>
        <span style={{ color: 'white', fontSize: '24px' }}>🧠</span>
      </div>
    </div>
  );
}

export default TestApp;