// pages/index.tsx - simplified version
import { useEffect, useState } from 'react';

export default function Home() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate initialization
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh'
    }}>
      <div>Loading...</div>
    </div>;
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      padding: '20px'
    }}>
      <header style={{
        borderBottom: '1px solid #e5e7eb',
        paddingBottom: '10px',
        marginBottom: '20px'
      }}>
        <h1 style={{fontSize: '24px', fontWeight: 'bold'}}>roam-sepulture</h1>
      </header>
      
      <main>
        <p>Basic content is working!</p>
        <button style={{
          backgroundColor: 'blue',
          color: 'white',
          padding: '8px 16px',
          borderRadius: '4px',
          border: 'none',
          cursor: 'pointer'
        }}>
          Test Button
        </button>
      </main>
    </div>
  );
}