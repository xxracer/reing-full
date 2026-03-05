
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './HeroSection.css';

const HeroSection = ({ videoOpacity }) => {
  const getCachedHero = () => {
    try {
      const cached = localStorage.getItem('reign_hero_data');
      if (cached) return JSON.parse(cached);
    } catch (e) { }
    return {
      heroImage: { url: null, position: 'center', coords: { x: 50, y: 50 } },
      heroVideoUrl: null
    };
  };
  const [cachedData] = useState(getCachedHero);

  const [heroImage, setHeroImage] = useState(cachedData.heroImage);
  const [heroVideoUrl, setHeroVideoUrl] = useState(cachedData.heroVideoUrl);
  const [isLoading, setIsLoading] = useState(!cachedData.heroImage.url && !cachedData.heroVideoUrl);
  const apiBaseUrl = ''; // All API calls will be proxied

  useEffect(() => {
    const fetchHeroContent = async () => {
      try {
        let newHeroImage = { ...cachedData.heroImage };
        let newHeroVideoUrl = cachedData.heroVideoUrl;

        const imageResponse = await axios.get(`${apiBaseUrl}/api/content/homepage_main_image`);
        if (imageResponse.data && imageResponse.data.content_value) {
          const content = JSON.parse(imageResponse.data.content_value);
          newHeroImage = {
            url: content.url,
            position: content.position || 'center',
            coords: content.coords || { x: 50, y: 50 }
          };
          setHeroImage(newHeroImage);
        }

        const videoResponse = await axios.get(`${apiBaseUrl}/api/content/homepage_hero_video`);
        if (videoResponse.data && videoResponse.data.content_value) {
          const val = videoResponse.data.content_value;
          // Regex to extract video ID from various YouTube URL formats
          const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
          const match = val.match(regExp);
          const videoId = (match && match[2].length === 11) ? match[2] : null;

          if (videoId) {
            newHeroVideoUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&modestbranding=1`;
          } else {
            newHeroVideoUrl = val; // Fallback to raw value
          }
          setHeroVideoUrl(newHeroVideoUrl);
        }

        localStorage.setItem('reign_hero_data', JSON.stringify({
          heroImage: newHeroImage,
          heroVideoUrl: newHeroVideoUrl
        }));

      } catch (error) {
        console.error('Error fetching homepage hero content:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHeroContent();
  }, [apiBaseUrl, cachedData]);

  // Logic to determine what to show:
  // 1. If User has set a custom video (not default), show it (PRIMARY).
  // 2. Else if User has set a fallback image, show it (SECONDARY).
  // 3. Else show default video (TERTIARY).
  const isDefaultVideo = heroVideoUrl === '/videos/reign.mp4';
  const showVideo = (!isDefaultVideo && heroVideoUrl) || !heroImage.url;

  return (
    <section className="hero-section">
      {isLoading ? (
        <div className="hero-video-wrapper"></div>
      ) : showVideo ? (
        <div className="hero-video-wrapper" style={{ opacity: videoOpacity }}>
          {heroVideoUrl && (heroVideoUrl.includes('youtube') || heroVideoUrl.includes('youtu.be')) ? (
            <iframe
              src={heroVideoUrl}
              title="Hero Video"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="hero-iframe"
            ></iframe>
          ) : (
            <video autoPlay loop muted playsInline className="hero-video-bg">
              <source src={heroVideoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          )}
        </div>
      ) : (
        <div className="hero-image-wrapper">
          {heroImage.url && heroImage.url.match(/\.(mp4|webm|mov)(\?|$)/i) ? (
            <video
              src={heroImage.url}
              autoPlay
              loop
              muted
              playsInline
              className="hero-image-bg" // Keep same class for positioning
              style={{
                objectPosition: `${heroImage.coords.x}% ${heroImage.coords.y}%`,
                transform: `scale(${heroImage.zoom || 1})`,
                transformOrigin: `${heroImage.coords.x}% ${heroImage.coords.y}%`,
                objectFit: 'cover',
                width: '100%',
                height: '100%',
                pointerEvents: 'none'
              }}
            />
          ) : (
            <img
              src={heroImage.url}
              alt="Jiu Jitsu Academy"
              className="hero-image-bg"
              style={{
                objectPosition: `${heroImage.coords.x}% ${heroImage.coords.y}%`,
                transform: `scale(${heroImage.zoom || 1})`,
                transformOrigin: `${heroImage.coords.x}% ${heroImage.coords.y}%`
              }}
            />
          )}
        </div>
      )}

      <div className="hero-content">
        <h1 className="hero-main-title">Katys Premier Jiu Jitsu Academy</h1>
        <p className="hero-sub-text">Kids Jiu-Jitsu • Adult Gi & No-Gi • Competition & Homeschool Program</p>
        <a href="#contact" className="hero-cta-button btn-red">Book Your Trial Class</a>
      </div>
    </section>
  );
};

export default HeroSection;
