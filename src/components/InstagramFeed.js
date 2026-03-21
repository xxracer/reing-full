/*
  ********************************************************************************
  * CRITICAL WARNING: DO NOT MODIFY THIS FILE - INSTAGRAM FEED SECTION           *
  ********************************************************************************
  * This component has been stabilized to handle dynamic aspect ratios and       *
  * specific display logic.                                                      *
  *                                                                              *
  * 1. Aspect Ratio is calculated dynamically or defaults to 1/1.                *
  * 2. Error handling allows partial loading of images.                          *
  * 3. Layout must remain robust against API failures.                           *
  *                                                                              *
  * ANY CHANGES HERE RISK BREAKING THE VISUAL STABILITY REQUESTED BY THE CLIENT. *
  * PLEASE CONSULT DOCUMENTATION BEFORE ATTEMPTING CHANGES.                      *
  ********************************************************************************
*/
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './InstagramFeed.css';

const InstagramFeed = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchImages = async () => {
      const newPosts = [];
      const imageIds = [1, 2, 3, 4, 5, 6];

      for (const id of imageIds) {
        try {
          const response = await axios.get(`/api/content/instagram_image_${id}`);

          if (response.data && response.data.content_value) {
            // Parse if it's JSON (sometimes ImageEditor saves as JSON with coords), or use raw string
            let imageUrl = response.data.content_value;
            let postLink = '#';
            let zoom = 1;
            let coords = { x: 50, y: 50 };
            let aspectRatio = '1 / 1';
            try {
              const parsed = JSON.parse(imageUrl);
              if (parsed.url) imageUrl = parsed.url;
              if (parsed.postLink) postLink = parsed.postLink;
              if (parsed.zoom) zoom = parseFloat(parsed.zoom);
              if (parsed.coords) coords = parsed.coords;
              if (parsed.aspectRatio) aspectRatio = parsed.aspectRatio;
            } catch (e) {
              // Not JSON, use as is
            }
            newPosts.push({ id, img: imageUrl, link: postLink, zoom, coords, aspectRatio });
          } else {
            // No content
          }
        } catch (error) {
          // Ignore missing images
        }
      }
      // If no posts found in DB, use placeholders so section doesn't disappear
      if (newPosts.length === 0) {
        const placeholders = [
          { id: 1, img: 'https://placehold.co/280x280?text=Upload+via+CMS', url: '#', zoom: 1 },
          { id: 2, img: 'https://placehold.co/280x280?text=Upload+via+CMS', url: '#', zoom: 1 },
          { id: 3, img: 'https://placehold.co/280x280?text=Upload+via+CMS', url: '#', zoom: 1 },
          { id: 4, img: 'https://placehold.co/280x280?text=Upload+via+CMS', url: '#', zoom: 1 },
          { id: 5, img: 'https://placehold.co/280x280?text=Upload+via+CMS', url: '#', zoom: 1 },
          { id: 6, img: 'https://placehold.co/280x280?text=Upload+via+CMS', url: '#', zoom: 1 },
        ];
        setPosts(placeholders);
      } else {
        setPosts(newPosts);
      }
    };

    fetchImages();
  }, []);

  // if (posts.length === 0) return null; // Removed check so it always renders

  return (
    <section className="instagram-feed-section">
      <h2 className="section-title">Latest on Instagram</h2>
      <div className="instagram-grid">
        {posts.map(post => {
          // Robust Link Detection: Check post.link OR if post.img is actually a link
          let effectiveLink = post.link && post.link !== '#' ? post.link : '';
          if (!effectiveLink && post.img && post.img.includes('instagram.com')) {
            effectiveLink = post.img;
          }

          const isInstagramLink = effectiveLink && effectiveLink.includes('instagram.com');

          return (
            <div key={post.id} className="instagram-post-wrapper">
              {isInstagramLink ? (
                <div style={{ width: '100%', height: '600px', overflow: 'hidden' }}>
                  <iframe
                    className="instagram-embed-iframe"
                    title={`Instagram Post ${post.id}`}
                    src={`${effectiveLink.includes('?') ? effectiveLink.split('?')[0] : effectiveLink}${effectiveLink.includes('?') ? (effectiveLink.split('?')[0].endsWith('/') ? '' : '/') : (effectiveLink.endsWith('/') ? '' : '/')}embed`}
                    frameBorder="0"
                    scrolling="no"
                    allowtransparency="true"
                    allow="encrypted-media"
                    style={{ width: '100%', height: '100%' }}
                  ></iframe>
                </div>
              ) : (
                <div className="instagram-post-link" style={{ overflow: 'hidden', display: 'block', height: '100%', aspectRatio: post.aspectRatio || '1 / 1' }}>
                  {post.img && post.img.match(/\.(mp4|webm|mov)(\?|$)/i) ? (
                    <video
                      src={post.img}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="instagram-media"
                      style={{
                        objectPosition: `${post.coords?.x ?? 50}% ${post.coords?.y ?? 50}%`,
                        transform: `scale(${post.zoom || 1})`,
                        transformOrigin: `${post.coords?.x ?? 50}% ${post.coords?.y ?? 50}%`,
                      }}
                    />
                  ) : (
                    <img
                      src={post.img}
                      alt={`Instagram post ${post.id}`}
                      className="instagram-media"
                      style={{
                        objectPosition: `${post.coords?.x ?? 50}% ${post.coords?.y ?? 50}%`,
                        transform: `scale(${post.zoom || 1})`,
                        transformOrigin: `${post.coords?.x ?? 50}% ${post.coords?.y ?? 50}%`,
                      }}
                    />
                  )}
                  {(!effectiveLink || effectiveLink === '#') && !post.img.includes('placehold') && (
                    <div className="image-overlay">Link Needed</div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default InstagramFeed;