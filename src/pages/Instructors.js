
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
      answer: "Our team is led by accomplished Black Belts, ensuring that students receive instruction at the highest level of technical knowledge and competitive experience."
    }
  ];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": pageFaqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <div className="instructors-page">
      <script type="application/ld+json">
        {JSON.stringify(faqSchema)}
      </script>
      <h1>Meet Our World-Class Instructors</h1>

      {instructors.map((instructor, index) => {
        let imageUrl = instructor.image;
        let zoom = 1;
        let coords = { x: 0, y: 0 };
        let aspectRatio = '4 / 5'; // Default for instructors usually vertical, but can be overridden
        try {
          const parsed = JSON.parse(instructor.image);
          if (parsed.url) imageUrl = parsed.url;
          if (parsed.zoom) zoom = parseFloat(parsed.zoom);
          if (parsed.coords) coords = parsed.coords;
          if (parsed.aspectRatio) aspectRatio = parsed.aspectRatio;
        } catch (e) {
          // raw string
        }

        return (
          <div key={instructor.id} className={`instructor-item ${index % 2 !== 0 ? 'reverse' : ''}`}>
            <div className="instructor-image-wrapper" style={{ aspectRatio: aspectRatio || '4 / 5', position: 'relative' }}>
              <img
                src={imageUrl}
                alt={instructor.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transform: `translate(${coords.x}${typeof coords.x === 'string' ? '' : 'px'}, ${coords.y}${typeof coords.y === 'string' ? '' : 'px'}) scale(${zoom})`,
                  transformOrigin: 'center center',
                  transition: 'transform 0.3s ease-out',
                  position: 'relative',
                  zIndex: 1
                }}
              />
              {/* Blurred Background */}
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
