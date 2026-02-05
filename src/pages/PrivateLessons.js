import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ProgramPage.css';
import FAQ from '../components/FAQ';
import ProgramHero from '../components/ProgramHero';

const PrivateLessons = () => {
  const [content, setContent] = useState({
    introText: "Accelerate your progress with Private BJJ lessons. Work directly with our instructors to focus on your goals, from self-defense to competition preparation. Many students find that private Jiu Jitsu classes near me give them the boost they need to succeed.",
    detailsTitle: "Focus on Your Goals",
    detailsText: "Private lessons are the fastest way to improve. Get personalized feedback and instruction tailored to your specific needs.",
    detailsList: [
      "- Accelerate your progress",
      "- Focus on your specific goals",
      "- Ideal for self-defense or competition prep",
      "- Get the boost you need to succeed"
    ],
    image1: "https://static.wixstatic.com/media/c5947c_dfc350dae9d242e6b35ea9ab6499341c~mv2.png",
    image2: "",
    faqs: [
      {
        question: "Can I share a Private Lesson with a friend?",
        answer: "Yes, private lessons offer the flexibility to work with the coach on a one-on-one basis or in a small group environment, allowing you to train with a partner or small group."
      },
      {
        question: "Are Private Lessons suitable for complete beginners?",
        answer: "Absolutely. Beginners often find that private lessons help them build a solid foundation and confidence faster, making their subsequent transition into group classes more effective and enjoyable."
      }
    ]
  });

  const apiBaseUrl = '';

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await axios.get(`${apiBaseUrl}/api/content/program_private-lessons_data`);
        if (response.data && response.data.content_value) {
          const parsedData = JSON.parse(response.data.content_value);
          setContent(prev => ({ ...prev, ...parsedData }));
        }
      } catch (error) { }
    };

    const fetchImages = async () => {
      try {
        const [img1Res, img2Res] = await Promise.all([
          axios.get(`${apiBaseUrl}/api/content/program_private-lessons_internal_1`),
          axios.get(`${apiBaseUrl}/api/content/program_private-lessons_internal_2`)
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
        title="Private Lessons"
        sectionId="program_private_lessons_hero"
        defaultImage="https://static.wixstatic.com/media/c5947c_32e7f546ef5043418e7e8229d64bb099~mv2.png"
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
          {content.image1 && <img src={content.image1} alt="Private Lesson Detail" />}
        </div>
      </section>

      {content.image2 && (
        <div style={{ 'textAlign': 'center', 'marginBottom': '60px' }}>
          <img src={content.image2} alt="Private Lesson Activity" />
        </div>
      )}

      <FAQ faqData={content.faqs} title="Private Lessons FAQs" />
    </div>
  );
};

export default PrivateLessons;
