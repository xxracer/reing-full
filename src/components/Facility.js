import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Facility.css';

const initialFacilityImages = [
  { alt: 'Wide shot of facility interior', zoom: 1 },
  { alt: 'Clean locker rooms / training equipment', zoom: 1 }
];

const Facility = () => {
  const [, setFacilityImages] = useState([]); // Start empty
  const [videoUrl, setVideoUrl] = useState('https://www.youtube.com/embed/0zh97sdP8-k');
  const apiBaseUrl = ''; // All API calls will be proxied

  useEffect(() => {
    const fetchFacilityContent = async () => {
      try {
        const [image1Res, image2Res, videoRes] = await Promise.all([
          axios.get(`${apiBaseUrl}/api/content/facility_image_1`),
          axios.get(`${apiBaseUrl}/api/content/facility_image_2`),
          axios.get(`${apiBaseUrl}/api/content/facility_video`)
        ]);

        const newImages = JSON.parse(JSON.stringify(initialFacilityImages));

        if (image1Res.data && image1Res.data.content_value) {
          let src = image1Res.data.content_value;
          let zoom = 1;
          let coords = { x: 0, y: 0 };
          let aspectRatio = '16 / 9';
          try {
            const content = JSON.parse(src);
            if (content.url) src = content.url;
            if (content.zoom) zoom = parseFloat(content.zoom);
            if (content.coords) coords = content.coords;
            if (content.aspectRatio) aspectRatio = content.aspectRatio;
          } catch (e) { }
          newImages[0] = { ...newImages[0], src, zoom, coords, aspectRatio };
        }

        if (image2Res.data && image2Res.data.content_value) {
          let src = image2Res.data.content_value;
          let zoom = 1;
          let coords = { x: 0, y: 0 };
          let aspectRatio = '16 / 9';
          try {
            const content = JSON.parse(src);
            if (content.url) src = content.url;
            if (content.zoom) zoom = parseFloat(content.zoom);
            if (content.coords) coords = content.coords;
            if (content.aspectRatio) aspectRatio = content.aspectRatio;
          } catch (e) { }
          newImages[1] = { ...newImages[1], src, zoom, coords, aspectRatio };
        }

        setFacilityImages(newImages);

        if (videoRes.data && videoRes.data.content_value) {
          const val = videoRes.data.content_value;
          const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
          const match = val.match(regExp);
          const videoId = (match && match[2].length === 11) ? match[2] : null;

          if (videoId) {
            setVideoUrl(`https://www.youtube.com/embed/${videoId}`);
          } else {
            setVideoUrl(val);
          }
        }
      } catch (error) {
        console.error('Error fetching facility content:', error);
      }
    };
    fetchFacilityContent();
  }, [apiBaseUrl]);

  return (
    <section id="facility" className="facility-section">
      <h2 className="section-title">Our Facility</h2>
      <p className="facility-description">
        Our modern facility provides everything you need for safe and effective training. With competition-quality mats, spacious training areas, and a clean environment, we are more than a Jiu Jitsu studio near me – we are a sports performance gym in Katy, TX, designed to help you grow physically and mentally.
      </p>

      {/* Vertical Video / IG Style Player */}
      <div className="facility-video-wrapper" style={{ maxWidth: '400px', margin: '0 auto', aspectRatio: '9 / 16', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
        {videoUrl && (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) ? (
          <iframe
            src={videoUrl}
            title="Reign Jiu Jitsu Facility Tour"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            style={{ width: '100%', height: '100%' }}
          ></iframe>
        ) : (
          <video
            src={videoUrl}
            autoPlay
            loop
            muted
            playsInline
            controls
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          >
            Your browser does not support the video tag.
          </video>
        )}
      </div>
    </section >
  );
};

export default Facility;
