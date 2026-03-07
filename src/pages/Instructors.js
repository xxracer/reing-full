
import React, { useState, useEffect } from 'react';
import DOMPurify from 'dompurify';
import FAQ from '../components/FAQ';
import './Instructors.css'; // Import the new CSS file

const API_URL = '/api/instructors';

const Instructors = () => {
  const [instructors, setInstructors] = useState([]);

  useEffect(() => {
    fetch(API_URL)
      .then(res => res.json())
      .then(data => {
        console.log("Instructors Data Received from API:", data);
        // Ensure sorting by ID
        const sortedData = data.sort((a, b) => parseInt(a.id) - parseInt(b.id));
        setInstructors(sortedData);
      })
      .catch(err => console.error("Error fetching instructors:", err));
  }, []);

  const parseBio = (bio) => {
    // If bio is already HTML (contains <p> or <h3>), return it as is.
    if (typeof bio === 'string' && (bio.includes('<p>') || bio.includes('<h3>'))) {
      return DOMPurify.sanitize(bio);
    }

    // Fallback: Parse the custom array format or raw string
    const bioArray = Array.isArray(bio) ? bio : [bio];
    let html = '';

    bioArray.forEach(paragraph => {
      const p = String(paragraph).trim(); // Ensure string
      if (p.startsWith('#')) {
        html += `<h3>${p.substring(1).trim()}</h3>`;
      } else if (p.startsWith('*')) {
        html += `<p><strong>${p.substring(1).trim()}</strong></p>`;
      } else {
        html += `<p>${p}</p>`;
      }
    });

    return DOMPurify.sanitize(html);
  };

  const pageFaqs = [
    {
      question: "What are the primary competition achievements of the instructors?",
      answer: "Our instructors are highly decorated competitors, with major titles including IBJJF World and Pan American championships."
    },
    {
      question: "What belt ranks do the instructors hold?",
      answer: "Our team includes multiple Black Belts, both homegrown through our program and those who have joined us from outside academies, creating a diverse and well-rounded training experience. We also have experienced Brown, Purple, and Blue Belt instructors who have been developed under Professor Moon’s training system, ensuring consistency in teaching style, structure, and standards across every class."
    }
  ];

  return (
    <div className="instructors-page">
      <h1>Meet Our World-Class Instructors</h1>

      {instructors.map((instructor, index) => {
        let imageUrl = instructor.image;
        let zoom = 1;
        let coords = { x: 50, y: 50 };
        const aspectRatio = '1 / 1'; // Force square for all instructors
        try {
          const parsed = JSON.parse(instructor.image);
          if (parsed.url) imageUrl = parsed.url;
          if (parsed.zoom) zoom = parseFloat(parsed.zoom);
          if (parsed.coords) coords = parsed.coords;
        } catch (e) {
          // raw string
        }

        return (
          <div key={instructor.id} className={`instructor-item ${index % 2 !== 0 ? 'reverse' : ''}`}>
            <div className="instructor-image-wrapper" style={{ aspectRatio: aspectRatio, position: 'relative' }}>
              <img
                src={imageUrl}
                alt={instructor.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: `${coords.x}% ${coords.y}%`,
                  transform: `scale(${zoom})`,
                  transformOrigin: `${coords.x}% ${coords.y}%`,
                  transition: 'transform 0.3s ease-out',
                  position: 'relative',
                  zIndex: 1
                }}
              />
            </div>
            <div className="instructor-bio">
              <h2>{instructor.name}</h2>
              <div
                className="instructor-bio-content"
                dangerouslySetInnerHTML={{ __html: parseBio(instructor.bio) }}
              />
            </div>
          </div>
        )
      })}

      <FAQ faqData={pageFaqs} title="Instructor FAQs" />
    </div>
  );
};

export default Instructors;
