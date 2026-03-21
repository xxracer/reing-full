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
        const sortedData = data.sort((a, b) => parseInt(a.id) - parseInt(b.id));
        setInstructors(sortedData);
      })
      .catch(err => {
        // Silently handle error for production
      });
  }, []);

  const parseBio = (bio) => {
    // If bio is already HTML (contains <p> or <h3>), return it as is.
    if (typeof bio === 'string' && (bio.includes('<p>') || bio.includes('<h3>'))) {
      // The CMS might contain hard line breaks inside HTML that look ugly on mobile.
      // We will replace newline characters with spaces, then sanitize.
      // Additionally, replace non-breaking spaces (&nbsp; or \u00A0) to allow wrapping.
      const cleanedHtml = bio.replace(/\n+/g, ' ').replace(/&nbsp;|\u00A0/g, ' ');
      return DOMPurify.sanitize(cleanedHtml);
    }

    // Fallback: Parse the custom array format or raw string
    const bioArray = Array.isArray(bio) ? bio : [bio];
    let html = '';

    bioArray.forEach(paragraph => {
      // Clean arbitrary newlines inside paragraph blocks and remove non-breaking spaces
      const p = String(paragraph).trim().replace(/\n+/g, ' ').replace(/&nbsp;|\u00A0/g, ' ');
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
      <h1 className="animate-fade-up">Meet Our World-Class Instructors</h1>

      {instructors.map((instructor, index) => {
        let imageUrl = instructor.image;
        let zoom = 1;
        let coords = { x: 50, y: 50 };
        try {
          const parsed = JSON.parse(instructor.image);
          if (parsed.url) imageUrl = parsed.url;
          if (parsed.zoom) zoom = parseFloat(parsed.zoom);
          if (parsed.coords) coords = parsed.coords;
        } catch (e) {
          // raw string
        }

        // Stagger the entrance animation up to 3 delays
        const delayClass = index === 0 ? '' : `delay-${Math.min(index, 3)}`;

        // Default object position for raw strings
        if (typeof instructor.image === 'string' && !instructor.image.startsWith('{')) {
          // It's a raw URL, default to object-fit cover
          return (
            <div
              key={instructor.id}
              className={`instructor-item animate-fade-up ${delayClass} ${index % 2 !== 0 ? 'reverse' : ''}`}
            >
              <div className="instructor-image-wrapper">
                <img
                  src={imageUrl}
                  alt={instructor.name}
                  loading="lazy"
                  className="instructor-media"
                  style={{ objectFit: 'cover', objectPosition: 'center 15%' }} // A good default for portraits
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
          );
        }

        return (
          <div
            key={instructor.id}
            className={`instructor-item animate-fade-up ${delayClass} ${index % 2 !== 0 ? 'reverse' : ''}`}
          >
            <div className="instructor-image-wrapper" style={{ containerType: 'inline-size' }}>
              <div style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'center'
              }}>
                <div style={{
                  width: '100%',
                  transform: `translate(calc(${coords.x || 0} * 100cqi / 200), calc(${coords.y || 0} * 100cqi / 200))`,
                  position: 'relative'
                }}>
                  <img
                    src={imageUrl}
                    alt={instructor.name}
                    loading="lazy"
                    style={{
                      width: '100%',
                      transform: `scale(${zoom})`,
                      transformOrigin: 'center center',
                      display: 'block'
                    }}
                  />
                </div>
              </div>
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

      <div className="animate-fade-up delay-2">
        <FAQ faqData={pageFaqs} title="Instructor FAQs" />
      </div>
    </div>
  );
};

export default Instructors;