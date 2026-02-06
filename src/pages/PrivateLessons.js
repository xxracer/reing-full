import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ProgramPage.css';
import FAQ from '../components/FAQ';
import ProgramHero from '../components/ProgramHero';
import ImageCarousel from '../components/ImageCarousel';

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
    image1: "https://static.wixstatic.com/media/c5947c_dfc350dae9d242e6b35ea9ab6499341c~mv2.png", // Body Image
    carouselImages: [
      "https://static.wixstatic.com/media/c5947c_dfc350dae9d242e6b35ea9ab6499341c~mv2.png",
      "https://static.wixstatic.com/media/c5947c_dfc350dae9d242e6b35ea9ab6499341c~mv2.png",
      "https://static.wixstatic.com/media/c5947c_dfc350dae9d242e6b35ea9ab6499341c~mv2.png",
      "https://static.wixstatic.com/media/c5947c_dfc350dae9d242e6b35ea9ab6499341c~mv2.png",
      "https://static.wixstatic.com/media/c5947c_dfc350dae9d242e6b35ea9ab6499341c~mv2.png"
    ],
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
          setContent(prev => ({
            ...prev,
            ...parsedData,
            carouselImages: parsedData.carouselImages || prev.carouselImages
          }));
        }
      } catch (error) { }
    };

    fetchContent();
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

      <div className="program-content-container">

        <section className="program-top-intro">
          <p>{content.introText}</p>
        </section>

        <section className="program-main-split">
          <div className="text-side">
            <div className="program-details-text-only">
              <h2>{content.detailsTitle}</h2>
              <p>{content.detailsText}</p>
              <ul>
                {content.detailsList.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="image-side">
            <div className="program-body-image-wrapper">
              <img src={content.image1} alt="Private Lesson Main" />
            </div>
          </div>
        </section>

        <section className="program-carousel-section">
          <ImageCarousel images={content.carouselImages} />
        </section>

        <FAQ faqData={content.faqs} title="Private Lessons FAQs" />
      </div>
    </div>
  );
};

export default PrivateLessons;
