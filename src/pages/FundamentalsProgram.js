import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ProgramPage.css';
import FAQ from '../components/FAQ';
import ProgramHero from '../components/ProgramHero';

const FundamentalsProgram = () => {
  const [content, setContent] = useState({
    introText: "Start your journey with our Fundamentals Jiu Jitsu classes. This program covers basic movements, positions, and techniques, ensuring that new students build a strong foundation. Perfect for those looking for beginner Jiu Jitsu near me.",
    detailsTitle: "Build a Strong Foundation",
    detailsText: "Our fundamentals program is designed to give you the confidence and skills you need to succeed in your Jiu Jitsu journey.",
    detailsList: [
      "- Learn basic movements and positions",
      "- Understand core techniques",
      "- Build a solid foundation for advanced classes",
      "- Perfect for beginners"
    ],
    image1: "https://static.wixstatic.com/media/c5947c_9de5932b95dc4de18b8a7277f4f8509b~mv2.png",
    image2: "https://static.wixstatic.com/media/c5947c_b9ce4dd9773847f0b3a64d02df753405~mv2.png",
    faqs: [
      {
        question: "Who is the Fundamentals Program for?",
        answer: "It's designed for new students who are just beginning their Jiu Jitsu journey. It's the perfect entry point before joining the main adult classes."
      },
      {
        question: "What will I learn in this program?",
        answer: "You will learn the core movements, body positioning, and essential self-defense techniques that form the bedrock of the art, all in a safe and supportive environment."
      }
    ]
  });

  const apiBaseUrl = '';

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await axios.get(`${apiBaseUrl}/api/content/program_fundamentals_data`);
        if (response.data && response.data.content_value) {
          const parsedData = JSON.parse(response.data.content_value);
          setContent(prev => ({ ...prev, ...parsedData }));
        }
      } catch (error) { }
    };

    const fetchImages = async () => {
      try {
        const [img1Res, img2Res] = await Promise.all([
          axios.get(`${apiBaseUrl}/api/content/program_fundamentals_internal_1`),
          axios.get(`${apiBaseUrl}/api/content/program_fundamentals_internal_2`)
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
        title="Fundamentals Program"
        sectionId="program_fundamentals_hero"
        defaultImage="https://static.wixstatic.com/media/c5947c_c7ef85e5ccc24f99b71c499e9c5d41fd~mv2.jpg"
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
          {content.image1 && <img src={content.image1} alt="Fundamentals Program Detail" />}
        </div>
      </section>

      <div style={{ 'textAlign': 'center', 'marginBottom': '60px' }}>
        {content.image2 && <img src={content.image2} alt="Fundamentals Program Activity" />}
      </div>

      <FAQ faqData={content.faqs} title="Fundamentals Program FAQs" />
    </div>
  );
};

export default FundamentalsProgram;
