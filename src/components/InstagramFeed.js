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
          console.log(`[InstagramFeed] Fetching ID: ${id}...`);
          const response = await axios.get(`/api/content/instagram_image_${id}`);
          console.log(`[InstagramFeed] Response for ${id}:`, response.data);

          if (response.data && response.data.content_value) {
            // Parse if it's JSON (sometimes ImageEditor saves as JSON with coords), or use raw string
            let imageUrl = response.data.content_value;
            let postLink = '#';
            let zoom = 1;
            let coords = { x: 50, y: 50 };
            let aspectRatio = '1 / 1';
            try {
              const parsed = JSON.parse(imageUrl);
              console.log(`[InstagramFeed] Parsed JSON for ${id}:`, parsed);
              if (parsed.url) imageUrl = parsed.url;
              if (parsed.postLink) postLink = parsed.postLink;
              if (parsed.zoom) zoom = parseFloat(parsed.zoom);
              if (parsed.coords) coords = parsed.coords;
              if (parsed.aspectRatio) aspectRatio = parsed.aspectRatio;
            } catch (e) {
              console.log(`[InstagramFeed] JSON parse failed for ${id}, using raw string.`);
              // Not JSON, use as is
            }
            newPosts.push({ id, img: imageUrl, link: postLink, zoom, coords, aspectRatio });
          } else {
            console.log(`[InstagramFeed] No content for ${id}`);
          }
        } catch (error) {
          console.error(`[InstagramFeed] Error fetching ${id}:`, error);
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
                <div style={{ width: '100%', height: '500px', overflow: 'hidden' }}>
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
                      style={{
                        objectPosition: `${post.coords?.x ?? 50}% ${post.coords?.y ?? 50}%`,
                        transform: `scale(${post.zoom || 1})`,
                        transformOrigin: `${post.coords?.x ?? 50}% ${post.coords?.y ?? 50}%`,
                        transition: 'transform 0.3s ease-out, object-position 0.3s ease-out',
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        pointerEvents: 'none'
                      }}
                    />
                  ) : (
                    <img
                      src={post.img}
                      alt={`Instagram post ${post.id}`}
                      style={{
                        objectPosition: `${post.coords?.x ?? 50}% ${post.coords?.y ?? 50}%`,
                        transform: `scale(${post.zoom || 1})`,
                        transformOrigin: `${post.coords?.x ?? 50}% ${post.coords?.y ?? 50}%`,
                        transition: 'transform 0.3s ease-out, object-position 0.3s ease-out',
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
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