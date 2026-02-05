import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ProgramPage.css';
import FAQ from '../components/FAQ';
import ProgramHero from '../components/ProgramHero';

const KidsProgram = () => {
  const [content, setContent] = useState({
    introText: "Our Kids Jiu Jitsu classes are designed to help children build confidence, respect, and discipline while having fun. From preschoolers (ages 4 and up) to teens, our children’s Jiu Jitsu and teens Jiu Jitsu classes focus on developing coordination, teamwork, and self-defense skills. We also welcome families looking for family Jiu Jitsu programs.",
    detailsTitle: "Building Confidence and Skills",
    detailsText: "We provide a safe and supportive environment where children can learn and grow. Our curriculum is designed to be engaging and effective.",
    detailsList: [
      "- Develop coordination and teamwork",
      "- Learn valuable self-defense skills",
      "- Build respect and discipline",
      "- Have fun while learning"
    ],
    image1: "https://static.wixstatic.com/media/c5947c_78dcb424cd4245d9acc5de69236867dc~mv2.jpeg",
    image2: "https://static.wixstatic.com/media/c5947c_5cedfbdb69ec448a9e5e0c60dba8235a~mv2.jpeg",
    faqs: [
      {
        question: "What is the minimum age for the Kids Program?",
        answer: "Our Kids Jiu Jitsu program is suitable for children ages 6 and up, focusing on fundamentals and character development."
      },
      {
        question: "What gear is required for my child's first class?",
        answer: "For the trial class, comfortable athletic wear is sufficient. If you enroll in an Unlimited Membership, a complimentary Gi (uniform) is often provided."
      }
    ]
  });

  const apiBaseUrl = '';

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await axios.get(`${apiBaseUrl}/api/content/program_kids_data`);
        if (response.data && response.data.content_value) {
          const parsedData = JSON.parse(response.data.content_value);
          setContent(prev => ({ ...prev, ...parsedData }));
        }
      } catch (error) {
        // Use defaults if fetch fails
      }
    };

    // Also fetch the internal images if they were saved via the specific image editors (legacy support or specific overrides)
    const fetchImages = async () => {
      try {
        const [img1Res, img2Res] = await Promise.all([
          axios.get(`${apiBaseUrl}/api/content/program_kids_internal_1`),
          axios.get(`${apiBaseUrl}/api/content/program_kids_internal_2`)
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
        title="Kids Program"
        sectionId="program_kids_hero"
        defaultImage="https://static.wixstatic.com/media/c5947c_690fa9195b12420bb76a88e15c1502b1~mv2.jpeg"
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
          {content.image1 && <img src={content.image1} alt="Kids Program Detail" />}
        </div>
      </section>

      <div style={{ 'textAlign': 'center', 'marginBottom': '40px' }}>
        {content.image2 && <img src={content.image2} alt="Kids Program Activity" />}
      </div>

      <FAQ faqData={content.faqs} title="Kids Program FAQs" />
    </div>
  );
};

export default KidsProgram;
