import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ProgramPage.css';
import FAQ from '../components/FAQ';
import ProgramHero from '../components/ProgramHero';

const HomeschoolProgram = () => {
  const [content, setContent] = useState({
    introText: "Reign Jiu Jitsu proudly offers a Homeschool Jiu Jitsu program tailored to families seeking daytime martial arts training. Students benefit from physical fitness, social interaction, and learning the values of discipline and perseverance. If you’re searching for homeschool martial arts near me, our program is the perfect fit.",
    detailsTitle: "Physical Fitness & Social Interaction",
    detailsText: "Our program is designed to provide a comprehensive experience for homeschool students, focusing on key areas of development.",
    detailsList: [
      "- Benefit from physical fitness",
      "- Develop social interaction skills",
      "- Learn the values of discipline and perseverance",
      "- Perfect for daytime martial arts training"
    ],
    image1: "https://static.wixstatic.com/media/c5947c_b0565367f7d345408d6f1e8853fb5f2f~mv2.png",
    image2: "https://static.wixstatic.com/media/c5947c_d824ca9346fc4e299f2d533a72eae649~mv2.png",
    faqs: [
      {
        question: "What are the qualifications of the instructor for the Homeschool program?",
        answer: "The program is led by a black belt instructor who also has a background as a Physical Education and Health teacher, providing a unique and qualified perspective for homeschool students."
      },
      {
        question: "Can these classes count toward my child’s P.E. requirement?",
        answer: "Yes, the program emphasizes physical fitness, helping children build strength, flexibility, and overall health, fulfilling the physical activity goals often associated with P.E. "
      },
      {
        question: "What unique benefits does the program offer for homeschool children?",
        answer: "It provides valuable social development and connection with peers, alongside specialized instruction in confidence, discipline, and physical fitness in a screen-free environment. "
      }
    ]
  });

  const apiBaseUrl = '';

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await axios.get(`${apiBaseUrl}/api/content/program_homeschool_data`);
        if (response.data && response.data.content_value) {
          const parsedData = JSON.parse(response.data.content_value);
          setContent(prev => ({ ...prev, ...parsedData }));
        }
      } catch (error) { }
    };

    const fetchImages = async () => {
      try {
        const [img1Res, img2Res] = await Promise.all([
          axios.get(`${apiBaseUrl}/api/content/program_homeschool_internal_1`),
          axios.get(`${apiBaseUrl}/api/content/program_homeschool_internal_2`)
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
        title="Homeschool Program"
        sectionId="program_homeschool_hero"
        defaultImage="https://static.wixstatic.com/media/c5947c_84d1216506fb4e4485d07d065cea8b98~mv2.png"
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
          {content.image1 && <img src={content.image1} alt="Homeschool Program Detail" />}
        </div>
      </section>

      <div style={{ 'textAlign': 'center', 'marginBottom': '60px' }}>
        {content.image2 && <img src={content.image2} alt="Homeschool Program Activity" />}
      </div>

      <FAQ faqData={content.faqs} title="Homeschool Program FAQs" />
    </div>
  );
};

export default HomeschoolProgram;
