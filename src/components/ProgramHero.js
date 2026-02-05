/*
  ********************************************************************************
  * CRITICAL WARNING: DO NOT MODIFY THIS FILE - PROGRAM HERO SECTION             *
  ********************************************************************************
  * This component is critical for visual presentation and stability.            *
  *                                                                              *
  * 1. Respects dynamic Aspect Ratio from CMS.                                   *
  * 2. Includes fallback min-height to prevent layout collapse.                  *
  * 3. Handles image loading failures gracefully.                                *
  *                                                                              *
  * DO NOT REMOVE THE ASPECT RATIO LOGIC OR FALLBACKS.                           *
  ********************************************************************************
*/
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ProgramHero.css';

const ProgramHero = ({ title, sectionId, defaultImage }) => {
  const [heroImageUrl, setHeroImageUrl] = useState(defaultImage);
  const [zoom, setZoom] = useState(1);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [aspectRatio, setAspectRatio] = useState(undefined); // Start undefined to let CSS default apply if not set
  const apiBaseUrl = ''; // All API calls will be proxied

  useEffect(() => {
    const fetchHeroImage = async () => {
      try {
        const response = await axios.get(`${apiBaseUrl}/api/content/${sectionId}`);
        if (response.data && response.data.content_value) {
          try {
            const content = JSON.parse(response.data.content_value);
            setHeroImageUrl(content.url || response.data.content_value);
            if (content.zoom) setZoom(parseFloat(content.zoom));
            if (content.coords) setCoords(content.coords);
            if (content.aspectRatio) setAspectRatio(content.aspectRatio);
          } catch (e) {
            setHeroImageUrl(response.data.content_value);
          }
        }
      } catch (error) {
        console.error(`Error fetching hero image for ${sectionId}:`, error);
        // If there's an error, the defaultImage will be used.
      }
    };
    fetchHeroImage();
  }, [sectionId, apiBaseUrl]);

  return (
    <section className="program-hero" style={{ aspectRatio: aspectRatio ? aspectRatio : '16 / 9', minHeight: '0' }}>
      <div
        className="program-hero-bg-wrapper"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 0
        }}
      >
        {heroImageUrl && heroImageUrl.match(/\.(mp4|webm|mov)(\?|$)/i) ? (
          <video
            src={heroImageUrl}
            autoPlay
            loop
            muted
            playsInline
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transform: `translate(${coords.x}${typeof coords.x === 'string' ? '' : 'px'}, ${coords.y}${typeof coords.y === 'string' ? '' : 'px'}) scale(${zoom})`,
              transformOrigin: 'center center',
              transition: 'transform 0.1s ease-out',
              pointerEvents: 'none'
            }}
          />
        ) : (
          <img
            src={heroImageUrl}
            alt={title}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover', // Ensures it covers the box
              transform: `translate(${coords.x}${typeof coords.x === 'string' ? '' : 'px'}, ${coords.y}${typeof coords.y === 'string' ? '' : 'px'}) scale(${zoom})`,
              transformOrigin: 'center center',
              transition: 'transform 0.1s ease-out'
            }}
          />
        )}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', pointerEvents: 'none' }}></div>
      </div>
      <h1 className="program-hero-title">{title}</h1>
    </section>
  );
};

export default ProgramHero;
