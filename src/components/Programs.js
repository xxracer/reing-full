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
  const [programsData, setProgramsData] = useState(() => {
    try {
      const cached = localStorage.getItem('reign_programs_cache');
      if (cached) return JSON.parse(cached);
    } catch (e) { }
    return initialProgramsData;
  });
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
          })
      );

      // Wait for all requests to finish
      await Promise.all(imagePromises);
      setProgramsData(updatedPrograms);
      localStorage.setItem('reign_programs_cache', JSON.stringify(updatedPrograms));
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
                  <video
                    src={program.image}
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="metadata"
                    style={{
                      objectPosition: `${program.coords?.x ?? 50}% ${program.coords?.y ?? 50}%`,
                      transform: `scale(${program.zoom || 1})`,
                    }}
                  />
                ) : (
                  <img
                    src={program.image}
                    alt={program.alt}
                    loading="lazy"
                    style={{
                      objectPosition: `${program.coords?.x ?? 50}% ${program.coords?.y ?? 50}%`,
                      transform: `scale(${program.zoom || 1})`,
                    }}
                  />
                )}
              </div>
            ) : (
              <div className="program-image-wrapper skeleton-loader"></div>
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
