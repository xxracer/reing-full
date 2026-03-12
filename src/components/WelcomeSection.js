import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './WelcomeSection.css';

const WelcomeSection = () => {
  const getCached = () => {
    try {
      const cached = localStorage.getItem('reign_welcome_data');
      if (cached) return JSON.parse(cached);
    } catch (e) { }
    return { url: '', zoom: 1, coords: { x: 50, y: 50 }, aspectRatio: '16 / 9', objectFit: 'cover' };
  };
  const [cachedData] = useState(getCached);

  const [imageUrl, setImageUrl] = useState(cachedData.url);
  const [zoom, setZoom] = useState(cachedData.zoom);
  const [coords, setCoords] = useState(cachedData.coords);
  const [aspectRatio, setAspectRatio] = useState(cachedData.aspectRatio);
  const [objectFit, setObjectFit] = useState(cachedData.objectFit);
  const apiBaseUrl = ''; // All API calls will be proxied

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const response = await axios.get(`${apiBaseUrl}/api/content/welcome_section_image`);
        if (response.data && response.data.content_value) {
          try {
            const content = JSON.parse(response.data.content_value);
            const newUrl = content.url || response.data.content_value;
            const newZoom = content.zoom ? parseFloat(content.zoom) : 1;
            const newCoords = content.coords || { x: 50, y: 50 };
            const newAspectRatio = content.aspectRatio || '16 / 9';
            const newObjectFit = content.objectFit || 'cover';

            setImageUrl(newUrl);
            setZoom(newZoom);
            setCoords(newCoords);
            setAspectRatio(newAspectRatio);
            setObjectFit(newObjectFit);

            localStorage.setItem('reign_welcome_data', JSON.stringify({
              url: newUrl, zoom: newZoom, coords: newCoords, aspectRatio: newAspectRatio, objectFit: newObjectFit
            }));
          } catch (e) {
            setImageUrl(response.data.content_value);
          }
        }
      } catch (error) {
        console.error('Error fetching welcome section image:', error);
      }
    };
    fetchImage();
  }, [apiBaseUrl]);

  // Parallax Effect Logic
  const [offsetY, setOffsetY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setOffsetY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!imageUrl) return null; // Or a loading skeleton. Returning null hides the section until data loads, preventing "old" flash.

  // Calculate numeric aspect ratio for layout constraints
  let numericRatio = 16 / 9;
  try {
    const [w, h] = aspectRatio.split('/').map(n => parseFloat(n.trim()));
    if (w && h) numericRatio = w / h;
  } catch (e) {
    // default
  }

  // Constrain width so height doesn't exceed ~70vh (adjust logical viewport height)
  // If height = width / ratio, then width = height * ratio.
  const maxHeightVh = 70;
  const maxWidthVh = maxHeightVh * numericRatio;

  return (
    <section id="welcome-section" className="welcome-section">
      <div
        className="welcome-container"
        style={{ transform: `translateY(${offsetY * -0.1}px)` }} // Moves slightly up as you scroll down
      >
        <div className="welcome-text-content">
          <p className="welcome-seo-text">
            Reign Jiu-Jitsu is home to multiple youth champions and one of the nation’s most respected teams. Whether you’re a beginner, competitor, or parent looking for a family-friendly program, our world-class facility combines elite training, a full gym, and a positive culture built to help you grow.
          </p>
          <p className="welcome-seo-text">
            From kids to adults, beginners to competitors, our students develop strength, discipline, and confidence through Brazilian Jiu-Jitsu. We’re home to multiple youth champions and one of the nation’s most respected competition teams, offering:
          </p>
          <ul className="welcome-list">
            <li>✅ Competition Training for serious athletes</li>
            <li>✅ Homeschool Jiu-Jitsu Program for growing minds and bodies</li>
            <li>✅ Fundamentals for Beginners to build a solid foundation</li>
            <li>✅ Adult Gi & No-Gi Classes in a motivating, inclusive environment</li>
          </ul>
          <p className="welcome-seo-text">
            Scroll down to explore why Reign Jiu-Jitsu is recognized among the best in the World.
          </p>
          <a href="#contact" className="welcome-info-button btn-red" style={{ display: 'inline-block', textDecoration: 'none' }}>Get more info</a>
        </div>
        <div
          className="welcome-image-wrapper"
          style={{
            overflow: 'hidden',
            aspectRatio: aspectRatio,
            minHeight: '0',
            width: '100%',
            maxWidth: `min(100%, ${maxWidthVh}vh)`,
            margin: '0 auto',
            position: 'relative'
          }}
        >
          {imageUrl && imageUrl.match(/\.(mp4|webm|mov)(\?|$)/i) ? (
            <>
              <video
                src={imageUrl}
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: objectFit,
                  objectPosition: `${coords?.x ?? 50}% ${coords?.y ?? 50}%`,
                  transform: `scale(${zoom || 1})`,
                  transformOrigin: `${coords?.x ?? 50}% ${coords?.y ?? 50}%`,
                  transition: 'transform 0.3s ease-out, object-position 0.3s ease-out',
                  position: 'relative',
                  zIndex: 1,
                  pointerEvents: 'none'
                }}
              />
            </>
          ) : (
            <>
              <img
                src={imageUrl}
                alt="Group of mixed-age students on the mats"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: objectFit,
                  objectPosition: `${coords?.x ?? 50}% ${coords?.y ?? 50}%`,
                  transform: `scale(${zoom || 1})`,
                  transformOrigin: `${coords?.x ?? 50}% ${coords?.y ?? 50}%`,
                  transition: 'transform 0.3s ease-out, object-position 0.3s ease-out',
                  position: 'relative',
                  zIndex: 1
                }}
              />
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default WelcomeSection;