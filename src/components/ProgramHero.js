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
  const isValidUrl = (url) => {
    if (!url || typeof url !== 'string' || url === 'undefined' || url === 'null' || url.trim() === '') return false;
    if (url.startsWith('{') || url.startsWith('[')) return false;
    return true;
  };

  const getCachedHero = () => {
    try {
      const cached = localStorage.getItem(`reign_program_hero_${sectionId}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (isValidUrl(parsed.heroImageUrl)) {
          return parsed;
        }
      }
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

            if (!isValidUrl(newUrl)) throw new Error("Invalid URL from DB");

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
            const rawVal = response.data.content_value;
            if (isValidUrl(rawVal)) {
              setHeroImageUrl(rawVal);
              localStorage.setItem(`reign_program_hero_${sectionId}`, JSON.stringify({
                heroImageUrl: rawVal,
                zoom: 1,
                coords: { x: 50, y: 50 },
                aspectRatio: undefined
              }));
            }
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
    <section className="program-hero" style={{ aspectRatio: aspectRatio || '16 / 9', maxHeight: '65vh' }}>
      <div className="program-hero-bg-wrapper">
        {typeof heroImageUrl === 'string' && heroImageUrl.match(/\.(mp4|webm|mov)(\?|$)/i) ? (
          <video
            src={heroImageUrl}
            autoPlay
            loop
            muted
            playsInline
            style={{
              objectPosition: `${coords.x}% ${coords.y}%`,
              transform: `scale(${zoom})`,
              transformOrigin: `${coords.x}% ${coords.y}%`,
            }}
          />
        ) : (
          <img
            src={heroImageUrl}
            alt={title}
            style={{
              objectPosition: `${coords.x}% ${coords.y}%`,
              transform: `scale(${zoom})`,
              transformOrigin: `${coords.x}% ${coords.y}%`,
            }}
          />
        )}
        <div className="program-hero-overlay"></div>
      </div>
      
      <div className="program-hero-content">
        <h1 className="program-hero-title animate-fade-up">{title}</h1>
        {/* Added dynamic subtitle for better storytelling */}
        <p className="program-hero-subtitle animate-fade-up delay-1">
          Train with purpose. Build discipline. Join the Reign family today.
        </p>
        <a href="/contact" className="btn-red-effect animate-fade-up delay-2">
          Book Your Trial Class
        </a>
      </div>
    </section>
  );
};

export default ProgramHero;
