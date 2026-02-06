import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ProgramPage.css';
import FAQ from '../components/FAQ';
import ProgramHero from '../components/ProgramHero';
import ImageCarousel from '../components/ImageCarousel';

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
    image1: "https://static.wixstatic.com/media/c5947c_200495ae287d4122be667a7e4a8f4551~mv2.jpg", // Body Image
    carouselImages: [
      "https://static.wixstatic.com/media/c5947c_32c260b29da7493f94738d8603598770~mv2.jpg",
      "https://static.wixstatic.com/media/c5947c_200495ae287d4122be667a7e4a8f4551~mv2.jpg",
      "https://static.wixstatic.com/media/c5947c_32c260b29da7493f94738d8603598770~mv2.jpg",
      "https://static.wixstatic.com/media/c5947c_200495ae287d4122be667a7e4a8f4551~mv2.jpg",
      "https://static.wixstatic.com/media/c5947c_32c260b29da7493f94738d8603598770~mv2.jpg"
    ],
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

    const fetchDynamicImages = async () => {
      try {
        const carouselPromises = [1, 2, 3, 4, 5].map(num =>
          axios.get(`${apiBaseUrl}/api/content/program_adult_carousel_${num}`)
        );
        const internalPromise = axios.get(`${apiBaseUrl}/api/content/program_adult_internal_1`);

        const [r1, r2, r3, r4, r5, rInt1] = await Promise.allSettled([...carouselPromises, internalPromise]);

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

        setContent(prev => {
          const updated = { ...prev };
          if (newCarousel.some(img => img)) {
            updated.carouselImages = updated.carouselImages.map((old, idx) => newCarousel[idx] || old);
          }
          if (newImage1) updated.image1 = newImage1;
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
        title="Adult Program"
        sectionId="program_adult_hero"
        defaultImage="https://static.wixstatic.com/media/c5947c_fae53860ebbd4e9a8644aa66c76e45e1~mv2.jpg"
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
              <img src={content.image1} alt="Adult Program Main" />
            </div>
          </div>
        </section>

        <section className="program-carousel-section">
          <ImageCarousel images={content.carouselImages} />
        </section>

        <FAQ faqData={content.faqs} title="Adult Program FAQs" />
      </div>
    </div>
  );
};

export default AdultProgram;
