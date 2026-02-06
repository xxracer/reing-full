import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ProgramPage.css';
import FAQ from '../components/FAQ';
import ProgramHero from '../components/ProgramHero';
import ImageCarousel from '../components/ImageCarousel';

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
    image1: "https://static.wixstatic.com/media/c5947c_9de5932b95dc4de18b8a7277f4f8509b~mv2.png", // Body Image
    carouselImages: [
      "https://static.wixstatic.com/media/c5947c_b9ce4dd9773847f0b3a64d02df753405~mv2.png",
      "https://static.wixstatic.com/media/c5947c_9de5932b95dc4de18b8a7277f4f8509b~mv2.png",
      "https://static.wixstatic.com/media/c5947c_b9ce4dd9773847f0b3a64d02df753405~mv2.png",
      "https://static.wixstatic.com/media/c5947c_9de5932b95dc4de18b8a7277f4f8509b~mv2.png",
      "https://static.wixstatic.com/media/c5947c_b9ce4dd9773847f0b3a64d02df753405~mv2.png"
    ],
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
        title="Fundamentals Program"
        sectionId="program_fundamentals_hero"
        defaultImage="https://static.wixstatic.com/media/c5947c_c7ef85e5ccc24f99b71c499e9c5d41fd~mv2.jpg"
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
              <img src={content.image1} alt="Fundamentals Program Main" />
            </div>
          </div>
        </section>

        <section className="program-carousel-section">
          <ImageCarousel images={content.carouselImages} />
        </section>

        <FAQ faqData={content.faqs} title="Fundamentals Program FAQs" />
      </div>
    </div>
  );
};

export default FundamentalsProgram;
