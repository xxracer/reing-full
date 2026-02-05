import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ProgramPage.css';
import FAQ from '../components/FAQ';
import ProgramHero from '../components/ProgramHero';

const AdultProgram = () => {
  const [content, setContent] = useState({
    introText: "Our Adult Jiu Jitsu program provides a supportive environment for beginners and advanced students alike. Whether your goal is self-defense, fitness, or personal growth, you’ll find the right path here. Classes include both gi and no-gi Jiu Jitsu in Katy, TX.",
    detailsTitle: "Self-Defense, Fitness, and Growth",
    detailsText: "Our classes are designed to help you achieve your goals, whether you're a beginner or an advanced student.",
    detailsList: [
      "- Learn effective self-defense techniques",
      "- Improve your fitness and overall health",
      "- Experience personal growth in a supportive community",
      "- Classes include both Gi and No-Gi training"
    ],
    image1: "https://static.wixstatic.com/media/c5947c_200495ae287d4122be667a7e4a8f4551~mv2.jpg",
    image2: "https://static.wixstatic.com/media/c5947c_32c260b29da7493f94738d8603598770~mv2.jpg",
    faqs: [
      {
        question: "Does the training cover self-defense techniques?",
        answer: "Jiu Jitsu is an inherently effective self-defense system. Our curriculum incorporates techniques for real-life situations, focusing on controlling an opponent regardless of size or strength."
      },
      {
        question: "Do I need any previous martial arts experience to join the Adult Program?",
        answer: "No. We welcome complete beginners and recommend starting with our Fundamentals Program to build a solid, safe foundation before moving to the main Adult classes."
      }
    ]
  });

  const apiBaseUrl = '';

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await axios.get(`${apiBaseUrl}/api/content/program_adult_data`);
        if (response.data && response.data.content_value) {
          const parsedData = JSON.parse(response.data.content_value);
          setContent(prev => ({ ...prev, ...parsedData }));
        }
      } catch (error) { }
    };

    const fetchImages = async () => {
      try {
        const [img1Res, img2Res] = await Promise.all([
          axios.get(`${apiBaseUrl}/api/content/program_adult_internal_1`),
          axios.get(`${apiBaseUrl}/api/content/program_adult_internal_2`)
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
        title="Adult Program"
        sectionId="program_adult_hero"
        defaultImage="https://static.wixstatic.com/media/c5947c_fae53860ebbd4e9a8644aa66c76e45e1~mv2.jpg"
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
          {content.image1 && <img src={content.image1} alt="Adult Program Detail" />}
        </div>
      </section>

      <div style={{ 'textAlign': 'center', 'marginBottom': '60px' }}>
        {content.image2 && <img src={content.image2} alt="Adult Program Activity" />}
      </div>

      <FAQ faqData={content.faqs} title="Adult Program FAQs" />
    </div>
  );
};

export default AdultProgram;
