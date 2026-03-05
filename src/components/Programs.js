import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Programs.css';

const initialProgramsData = [
  { id: 'kids', title: 'Kids Program', path: '/kids-program', description: 'Confidence, discipline, and fun for children.', alt: 'Kids class in session', zoom: 1 },
  { id: 'homeschool', title: 'Homeschool Jiu Jitsu', path: '/homeschool-program', description: 'Daytime classes for homeschool families.', alt: 'Homeschool Jiu Jitsu class', zoom: 1 },
  { id: 'adult', title: 'Adult Jiu Jitsu', path: '/adult-program', description: 'For self-defense, fitness, and growth.', alt: 'Adults rolling on mats', zoom: 1 },
  { id: 'fundamentals', title: 'Fundamentals Program', path: '/fundamentals-program', description: 'Perfect for new students.', alt: 'Fundamentals class', zoom: 1 },
  { id: 'competition', title: 'Competition Training', path: '/competition-training', description: 'For athletes who want to test themselves on the mat.', alt: 'Competition highlight photo', zoom: 1 },
  { id: 'wrestling', title: 'Wrestling Program', path: '/wrestling-program', description: 'Build strength, speed, and grit.', alt: 'Wrestling class', zoom: 1 },
  { id: 'private_lessons', title: 'Private Lessons', path: '/private-lessons', description: 'One-on-one coaching for faster progress.', alt: 'Private BJJ lesson', zoom: 1 }
];

const Programs = () => {
  const [programsData, setProgramsData] = useState([]); // Start empty to avoid flashing default data if we removed images
  const apiBaseUrl = ''; // All API calls will be proxied

  useEffect(() => {
    const fetchProgramImages = async () => {
      const updatedPrograms = JSON.parse(JSON.stringify(initialProgramsData));

      // Create an array of promises for parallel execution
      const imagePromises = updatedPrograms.map(program =>
        axios.get(`${apiBaseUrl}/api/content/program_${program.id}_image`)
          .then(response => {
            if (response.data && response.data.content_value) {
              try {
                const content = JSON.parse(response.data.content_value);
                program.image = content.url || response.data.content_value;
                if (content.zoom) program.zoom = parseFloat(content.zoom);
                if (content.coords) program.coords = content.coords;
                if (content.aspectRatio) program.aspectRatio = content.aspectRatio;
              } catch (e) {
                program.image = response.data.content_value;
              }
            }
          })
          .catch(error => {
            // Silently fail for individual images so others still load
            console.log(`No custom image for ${program.title}`);
          })
      );

      // Wait for all requests to finish
      await Promise.all(imagePromises);
      setProgramsData(updatedPrograms);
    };

    fetchProgramImages();
  }, [apiBaseUrl]);

  return (
    <section id="programs" className="programs-section">
      <h2 className="section-title">Our Programs</h2>
      <div className="programs-grid">
        {programsData.map((program, index) => (
          <Link to={program.path} key={index} className="program-card">
            {program.image ? (
              <div className="program-image-wrapper">
                {program.image && program.image.match(/\.(mp4|webm|mov)(\?|$)/i) ? (
                  <>
                    <video
                      src={program.image}
                      autoPlay
                      loop
                      muted
                      playsInline
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        objectPosition: `${program.coords?.x ?? 50}% ${program.coords?.y ?? 50}%`,
                        transform: `scale(${program.zoom || 1})`,
                        transformOrigin: `${program.coords?.x ?? 50}% ${program.coords?.y ?? 50}%`,
                        position: 'relative',
                        zIndex: 1,
                        pointerEvents: 'none'
                      }}
                    />
                    {/* Blurred Background for Video */}
                    <video
                      src={program.image}
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
                      src={program.image}
                      alt={program.alt}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        objectPosition: `${program.coords?.x ?? 50}% ${program.coords?.y ?? 50}%`,
                        transform: `scale(${program.zoom || 1})`,
                        transformOrigin: `${program.coords?.x ?? 50}% ${program.coords?.y ?? 50}%`,
                        transition: 'object-position 0.3s ease-out, transform 0.3s ease-out',
                        position: 'relative',
                        zIndex: 1
                      }}
                    />
                    {/* Blurred Background */}
                    <img
                      src={program.image}
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
            ) : (
              <div className="program-image-wrapper skeleton-loader" style={{ height: '200px', backgroundColor: 'var(--background-secondary)' }}></div>
            )}
            <div className="program-content">
              <h3 className="program-title">{program.title}</h3>
              <p className="program-description">{program.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default Programs;
