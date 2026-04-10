import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div
      style={{
        minHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '40px 20px',
        backgroundColor: 'var(--bg-primary, #0a0a0a)',
      }}
    >
      <h1
        style={{
          fontSize: 'clamp(5rem, 15vw, 12rem)',
          fontWeight: '900',
          color: '#d32f2f',
          lineHeight: '1',
          margin: '0',
          textShadow: '0 0 40px rgba(211, 47, 47, 0.3)',
        }}
      >
        404
      </h1>

      <h2
        style={{
          fontSize: 'clamp(1.5rem, 5vw, 3rem)',
          fontWeight: '700',
          color: '#ffffff',
          margin: '20px 0 10px',
        }}
      >
        This Page Does Not Exist
      </h2>

      <p
        style={{
          fontSize: 'clamp(1rem, 2.5vw, 1.3rem)',
          color: 'rgba(255, 255, 255, 0.6)',
          maxWidth: '500px',
          margin: '0 0 40px',
          lineHeight: '1.6',
        }}
      >
        The page you are looking for may have been moved, deleted, or never existed.
      </p>

      <Link
        to="/"
        style={{
          display: 'inline-block',
          padding: '20px 60px',
          fontSize: 'clamp(1.2rem, 3vw, 1.6rem)',
          fontWeight: '800',
          color: '#ffffff',
          backgroundColor: '#d32f2f',
          borderRadius: '50px',
          textDecoration: 'none',
          boxShadow: '0 8px 30px rgba(211, 47, 47, 0.5)',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          letterSpacing: '0.5px',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.05)';
          e.currentTarget.style.boxShadow = '0 12px 40px rgba(211, 47, 47, 0.7)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 8px 30px rgba(211, 47, 47, 0.5)';
        }}
      >
        👉 CLICK HERE TO GO HOME
      </Link>
    </div>
  );
};

export default NotFound;
