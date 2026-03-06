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
  const getCachedHero = () => {
    try {
      const cached = localStorage.getItem(`reign_program_hero_${sectionId}`);
      if (cached) return JSON.parse(cached);
    } catch (e) { }
    return {
      heroImageUrl: defaultImage,
      zoom: 1,
      coords: { x: 50, y: 50 },
      aspectRatio: undefined
    };
  };

  const [cachedData] = useState(getCachedHero);
  const [heroImageUrl, setHeroImageUrl] = useState(cachedData.heroImageUrl);
  const [zoom, setZoom] = useState(cachedData.zoom);
  const [coords, setCoords] = useState(cachedData.coords);
  const [aspectRatio, setAspectRatio] = useState(cachedData.aspectRatio);
  const apiBaseUrl = ''; // All API calls will be proxied

  useEffect(() => {
    const fetchHeroImage = async () => {
      try {
        const response = await axios.get(`${apiBaseUrl}/api/content/${sectionId}`);
        if (response.data && response.data.content_value) {
          try {
            const content = JSON.parse(response.data.content_value);
            const newUrl = content.url || response.data.content_value;
            const newZoom = parseFloat(content.zoom) || 1;
            const newCoords = content.coords || { x: 50, y: 50 };
            const newAspectRatio = content.aspectRatio || undefined;

            setHeroImageUrl(newUrl);
            setZoom(newZoom);
            setCoords(newCoords);
            setAspectRatio(newAspectRatio);

            localStorage.setItem(`reign_program_hero_${sectionId}`, JSON.stringify({
              heroImageUrl: newUrl,
              zoom: newZoom,
              coords: newCoords,
              aspectRatio: newAspectRatio
            }));
          } catch (e) {
            setHeroImageUrl(response.data.content_value);
            localStorage.setItem(`reign_program_hero_${sectionId}`, JSON.stringify({
              heroImageUrl: response.data.content_value,
              zoom: 1,
              coords: { x: 50, y: 50 },
              aspectRatio: undefined
            }));
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
              objectPosition: `${coords.x}% ${coords.y}%`,
              transform: `scale(${zoom})`,
              transformOrigin: `${coords.x}% ${coords.y}%`,
              transition: 'transform 0.1s ease-out, object-position 0.1s ease-out',
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
              objectPosition: `${coords.x}% ${coords.y}%`,
              transform: `scale(${zoom})`,
              transformOrigin: `${coords.x}% ${coords.y}%`,
              transition: 'transform 0.1s ease-out, object-position 0.1s ease-out'
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
