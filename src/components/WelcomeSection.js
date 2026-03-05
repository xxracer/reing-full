import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './WelcomeSection.css';

const WelcomeSection = () => {
  const [imageUrl, setImageUrl] = useState('');
  const [zoom, setZoom] = useState(1);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [aspectRatio, setAspectRatio] = useState('16 / 9');
  const [objectFit, setObjectFit] = useState('cover');
  const apiBaseUrl = ''; // All API calls will be proxied

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const response = await axios.get(`${apiBaseUrl}/api/content/welcome_section_image`);
        if (response.data && response.data.content_value) {
          try {
            const content = JSON.parse(response.data.content_value);
            setImageUrl(content.url || response.data.content_value);
            if (content.zoom) setZoom(parseFloat(content.zoom));
            if (content.coords) setCoords(content.coords);
            if (content.aspectRatio) setAspectRatio(content.aspectRatio);
            if (content.objectFit) setObjectFit(content.objectFit);
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
          <button className="welcome-info-button">Get more info</button>
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
              {/* Blurred Background Video */}
              <video
                src={imageUrl}
                autoPlay
                loop
                muted
                playsInline
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  filter: 'blur(20px) brightness(0.7)',
                  transform: 'scale(1.1)',
                  zIndex: 0,
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
              <img
                src={imageUrl}
                alt=""
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  filter: 'blur(20px) brightness(0.7)',
                  transform: 'scale(1.1)',
                  zIndex: 0
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