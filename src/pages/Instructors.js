
import React, { useState, useEffect } from 'react';
import DOMPurify from 'dompurify';
import FAQ from '../components/FAQ';
import './Instructors.css';

const API_URL = '/api/instructors';

const Instructors = () => {
  const [instructors, setInstructors] = useState([]);

  useEffect(() => {
    fetch(API_URL)
      .then(res => res.json())
      .then(data => {
        console.log("Instructors Data Received from API:", data);
        const sortedData = data.sort((a, b) => parseInt(a.id) - parseInt(b.id));
        setInstructors(sortedData);
      })
      .catch(err => console.error("Error fetching instructors:", err));
  }, []);

  // DOMPurify config: preserve all formatting from the CMS
  const purifyConfig = {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'strike',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li',
      'a', 'span', 'div', 'blockquote', 'pre', 'code',
      'sub', 'sup', 'hr', 'img', 'table', 'thead', 'tbody', 'tr', 'td', 'th'
    ],
    ALLOWED_ATTR: [
      'style', 'class', 'href', 'target', 'rel',
      'src', 'alt', 'width', 'height',
      'colspan', 'rowspan'
    ],
    ALLOW_DATA_ATTR: false,
  };

  // Strip invisible break characters that the CMS/editor may insert.
  const cleanHiddenBreaks = (html) => {
    return html
      .replace(/\u00AD/g, '')
      .replace(/\u200B/g, '')
      .replace(/\u200C/g, '')
      .replace(/\u200D/g, '')
      .replace(/\u2060/g, '')
      .replace(/\uFEFF/g, '')
      .replace(/<wbr\s*\/?>/gi, '');
  };

  // Merge consecutive <p> tags into one flowing paragraph.
  // We do NOT add a space between merged paragraphs — the CMS text
  // already ends each sentence with a space. Adding one caused "mind set".
  const mergeParagraphs = (html) => {
    // Step 1: Empty <p> tags = real paragraph breaks → placeholder
    let result = html.replace(/<p[^>]*>\s*(<br\s*\/?>)?\s*<\/p>/gi, '<!--BREAK-->');
    // Step 2: Merge non-empty consecutive paragraphs — no extra space
    result = result.replace(/<\/p>\s*<p[^>]*>/gi, ' ');
    // Step 3: Restore paragraph breaks
    result = result.replace(/<!--BREAK-->/g, '</p><p>');
    return result;
  };

  // Split bio HTML into bullet points (ul/ol) and paragraph text
  const splitBio = (bioHtml) => {
    const sanitized = cleanHiddenBreaks(DOMPurify.sanitize(bioHtml, purifyConfig));
    const merged = mergeParagraphs(sanitized);

    // Use a temporary div to parse HTML
    const temp = document.createElement('div');
    temp.innerHTML = merged;

    let bullets = '';
    let text = '';

    Array.from(temp.childNodes).forEach(node => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        if (node.tagName === 'UL' || node.tagName === 'OL') {
          bullets += node.outerHTML;
        } else {
          text += node.outerHTML;
        }
      } else if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
        text += `<p>${node.textContent}</p>`;
      }
    });

    return { bullets, text };
  };

  const parseBio = (bio) => {
    if (typeof bio === 'string' && (bio.includes('<p>') || bio.includes('<h3>') || bio.includes('<'))) {
      return bio;
    }
    const bioArray = Array.isArray(bio) ? bio : [bio];
    let html = '';
    bioArray.forEach(paragraph => {
      const p = String(paragraph).trim();
      if (p.startsWith('#')) {
        html += `<h3>${p.substring(1).trim()}</h3>`;
      } else if (p.startsWith('*')) {
        html += `<p><strong>${p.substring(1).trim()}</strong></p>`;
      } else {
        html += `<p>${p}</p>`;
      }
    });
    return html;
  };

  const pageFaqs = [
    {
      question: "What are the primary competition achievements of the instructors?",
      answer: "Our instructors are highly decorated competitors, with major titles including IBJJF World and Pan American championships."
    },
    {
      question: "What belt ranks do the instructors hold?",
      answer: "Our team includes multiple Black Belts, both homegrown through our program and those who have joined us from outside academies, creating a diverse and well-rounded training experience. We also have experienced Brown, Purple, and Blue Belt instructors who have been developed under Professor Moon's training system, ensuring consistency in teaching style, structure, and standards across every class."
    }
  ];

  return (
    <div className="instructors-page">
      <h1>Meet Our World-Class Instructors</h1>

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

        const bioHtml = parseBio(instructor.bio);
        const { bullets, text } = splitBio(bioHtml);

        return (
          <div key={instructor.id} className="instructor-item">
            {/* TOP ROW: Image + Name + Bullets side by side */}
            <div className="instructor-top">
              <div className="instructor-image-wrapper">
                <img
                  src={imageUrl}
                  alt={instructor.name}
                  className="instructor-image"
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
              <div className="instructor-credentials">
                <h2>{instructor.name}</h2>
                {bullets && (
                  <div
                    className="instructor-bullets"
                    dangerouslySetInnerHTML={{ __html: bullets }}
                  />
                )}
              </div>
            </div>

            {/* BOTTOM: Full-width bio text */}
            <div
              className="instructor-bio-full"
              dangerouslySetInnerHTML={{ __html: text }}
            />
          </div>
        )
      })}

      <FAQ faqData={pageFaqs} title="Instructor FAQs" />
    </div>
  );
};

export default Instructors;
