import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Facility.css';

const initialFacilityImages = [
  { alt: 'Wide shot of facility interior', zoom: 1 },
  { alt: 'Clean locker rooms / training equipment', zoom: 1 }
];

const defaultImages = [
  'https://static.wixstatic.com/media/c5947c_475cbf851e054bdc915bfcbb7fd2b704~mv2.png',
  'https://static.wixstatic.com/media/c5947c_b40f2d46adab45ae967e41fd1868925b~mv2.png'
];

const Facility = () => {
  const [facilityImages, setFacilityImages] = useState(defaultImages);
  const [videoUrl, setVideoUrl] = useState('');
  const [mediaType, setMediaType] = useState('images'); // Default to images
  const apiBaseUrl = '';

  useEffect(() => {
    const fetchFacilityContent = async () => {
      const fetchItem = (url) => axios.get(url).then(res => res).catch(err => null);

      const [image1Res, image2Res, videoRes, mediaTypeRes] = await Promise.all([
        fetchItem(`${apiBaseUrl}/api/content/facility_image_1`),
        fetchItem(`${apiBaseUrl}/api/content/facility_image_2`),
        fetchItem(`${apiBaseUrl}/api/content/facility_video`),
        fetchItem(`${apiBaseUrl}/api/content/facility_media_type`)
      ]);

      if (mediaTypeRes && mediaTypeRes.data && mediaTypeRes.data.content_value) {
        setMediaType(mediaTypeRes.data.content_value);
      }

      const processImage = (res) => {
        if (res && res.data && res.data.content_value) {
          let src = res.data.content_value;
          try {
            const content = JSON.parse(src);
            src = content.url || src;
          } catch (e) {
            // Not JSON, just use raw string
          }
          if (!src || src === 'undefined' || src === 'null') return null;
          return src;
        }
        return null;
      };

      const img1 = processImage(image1Res) || defaultImages[0];
      const img2 = processImage(image2Res) || defaultImages[1];

      console.log('Facility Debug:', {
        mediaType: mediaTypeRes?.data?.content_value,
        img1,
        img2,
        video: videoRes?.data?.content_value
      });

      setFacilityImages([img1, img2]);

      if (videoRes && videoRes.data && videoRes.data.content_value) {
        setVideoUrl(videoRes.data.content_value);
      }
    };
    fetchFacilityContent();
  }, []);

  return (
    <section id="facility" className="facility-section">
      <h2 className="section-title">Our Facility</h2>
      <p className="facility-description">
        Our modern facility provides everything you need for safe and effective training. With competition-quality mats, spacious training areas, and a clean environment, we are more than a Jiu Jitsu studio near me – we are a sports performance gym in Katy, TX, designed to help you grow physically and mentally.
      </p>

      {mediaType === 'images' ? (
        <div className="facility-image-grid">
          {facilityImages.map((src, index) => (
            <div key={index} className="facility-image-item">
              {src && src.match(/\.(mp4|webm|mov|m4v)(\?|$)/i) ? (
                <video
                  src={src}
                  autoPlay
                  loop
                  muted
                  playsInline
                  controls
                  style={{ width: '100%', height: '100%', objectFit: 'cover', backgroundColor: '#000' }}
                />
              ) : (
                <img src={src} alt={`Facility ${index + 1}`} />
              )}
            </div>
          ))}
        </div>
      ) : (
        <div
          className="facility-video-wrapper"
          style={{
            maxWidth: mediaType === 'youtube' ? '900px' : '400px',
            margin: '0 auto',
            aspectRatio: mediaType === 'youtube' ? '16 / 9' : '9 / 16',
            borderRadius: '20px',
            overflow: 'hidden',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
          }}
        >
          {videoUrl && (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) ? (
            <iframe
              src={videoUrl}
              title="Reign Jiu Jitsu Facility Tour"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              style={{ width: '100%', height: '100%' }}
            ></iframe>
          ) : videoUrl ? (
            <video
              src={videoUrl}
              controls
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            >
              Your browser does not support the video tag.
            </video>
          ) : (
            <div style={{ width: '100%', height: '100%', backgroundColor: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
              No Video Available
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default Facility;
