import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ProgramPage.css';
import FAQ from '../components/FAQ';
import ProgramHero from '../components/ProgramHero';

const CompetitionTraining = () => {
  const [content, setContent] = useState({
    introText: "For those who want to take their training to the next level, our Competition Training program is led by experienced coaches who prepare students for local, national, and international tournaments. Push yourself, sharpen your game, and represent BJJ Katy Texas with pride.",
    detailsTitle: "Prepare for the Podium",
    detailsText: "Our program is designed to sharpen your game and prepare you for the highest levels of competition.",
    detailsList: [
      "- Led by experienced, world-class coaches",
      "- Prepare for local, national, and international tournaments",
      "- Sharpen your game and push your limits",
      "- Represent BJJ in Katy, Texas with pride"
    ],
    image1: "https://static.wixstatic.com/media/c5947c_8ff5a096294b498eb84b3f63dd24889b~mv2.jpg",
    image2: "", // No second image in original but we support it
    faqs: [
      {
        question: "Does the program include nutritional guidance?",
        answer: "Yes, our customized training includes key nutrition strategies and advice from a dedicated coach to optimize weight cuts and maximize in-competition performance."
      },
      {
        question: "What level of experience is required for Competition Training?",
        answer: "This program is geared toward intermediate to advanced practitioners (typically blue belt and up) who have a solid understanding of the fundamentals and are looking to specialize."
      }
    ]
  });

  const apiBaseUrl = '';

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await axios.get(`${apiBaseUrl}/api/content/program_competition_data`);
        if (response.data && response.data.content_value) {
          const parsedData = JSON.parse(response.data.content_value);
          setContent(prev => ({ ...prev, ...parsedData }));
        }
      } catch (error) { }
    };

    const fetchImages = async () => {
      try {
        const [img1Res, img2Res] = await Promise.all([
          axios.get(`${apiBaseUrl}/api/content/program_competition_internal_1`),
          axios.get(`${apiBaseUrl}/api/content/program_competition_internal_2`)
        ]);

        if (img1Res.data && img1Res.data.content_value) {
          let src = img1Res.data.content_value;
          try { const c = JSON.parse(src); if (c.url) src = c.url; } catch (e) { }
          setContent(prev => ({ ...prev, image1: src }));
        }

        if (img2Res.data && img2Res.data.content_value) {
          let src = img2Res.data.content_value;
          try { const c = JSON.parse(src); if (c.url) src = c.url; } catch (e) { }
          setContent(prev => ({ ...prev, image2: src }));
        }
      } catch (e) { }
    };

    fetchContent();
    fetchImages();
  }, []);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": content.faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <div className="program-page">
      <script type="application/ld+json">
        {JSON.stringify(faqSchema)}
      </script>

      <ProgramHero
        title="Competition Training"
        sectionId="program_competition_hero"
        defaultImage="https://static.wixstatic.com/media/c5947c_80a936d01653434093c7bf7f4276b689~mv2.png"
      />

      <section className="program-intro">
        <p>{content.introText}</p>
      </section>

      <section className="program-details-section">
        <div className="program-details-text">
          <h2>{content.detailsTitle}</h2>
          <p>{content.detailsText}</p>
          <ul>
            {content.detailsList.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="program-details-image">
          {content.image1 && <img src={content.image1} alt="Competition Training Detail" />}
        </div>
      </section>

      {/* Optional second image spot if user adds one */}
      {content.image2 && (
        <div style={{ 'textAlign': 'center', 'marginBottom': '60px' }}>
          <img src={content.image2} alt="Competition Activity" />
        </div>
      )}

      <FAQ faqData={content.faqs} title="Competition Training FAQs" />
    </div>
  );
};

export default CompetitionTraining;
