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
          setContent(prev => ({ ...prev, ...parsedData }));
        }
      } catch (error) { }
    };

    const fetchDynamicImages = async () => {
      try {
        const carouselPromises = [1, 2, 3, 4, 5].map(num =>
          axios.get(`${apiBaseUrl}/api/content/program_private-lessons_carousel_${num}`)
        );
        // Private lessons internal_1 and internal_2 are already handled, but let's conform to the pattern if we want consistency
        // Or just leave them since they were separate. Actually, I should update carousel logic here.

        const internalPromise1 = axios.get(`${apiBaseUrl}/api/content/program_private-lessons_internal_1`);
        const internalPromise2 = axios.get(`${apiBaseUrl}/api/content/program_private-lessons_internal_2`);

        const [r1, r2, r3, r4, r5, rInt1, rInt2] = await Promise.allSettled([...carouselPromises, internalPromise1, internalPromise2]);

        const newCarousel = [];
        [r1, r2, r3, r4, r5].forEach((res, index) => {
          if (res.status === 'fulfilled' && res.value.data && res.value.data.content_value) {
            let src = res.value.data.content_value;
            try { const c = JSON.parse(src); if (c.url) src = c.url; } catch (e) { }
            newCarousel[index] = src;
          }
        });

        let newImage1 = null;
        if (rInt1.status === 'fulfilled' && rInt1.value.data && rInt1.value.data.content_value) {
          let src = rInt1.value.data.content_value;
          try { const c = JSON.parse(src); if (c.url) src = c.url; } catch (e) { }
          newImage1 = src;
        }

        let newImage2 = null;
        if (rInt2.status === 'fulfilled' && rInt2.value.data && rInt2.value.data.content_value) {
          let src = rInt2.value.data.content_value;
          try { const c = JSON.parse(src); if (c.url) src = c.url; } catch (e) { }
          newImage2 = src;
        }

        setContent(prev => {
          const updated = { ...prev };
          if (newCarousel.some(img => img)) {
            updated.carouselImages = updated.carouselImages.map((old, idx) => newCarousel[idx] || old);
          }
          if (newImage1) updated.image1 = newImage1;
          if (newImage2) updated.image2 = newImage2;
          return updated;
        });
      } catch (e) { }
    };

    fetchContent();
    fetchDynamicImages();
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
