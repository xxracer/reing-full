import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ProgramPage.css';
import FAQ from '../components/FAQ';
import ProgramHero from '../components/ProgramHero';
import ImageCarousel from '../components/ImageCarousel';

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
    image1: "https://static.wixstatic.com/media/c5947c_8ff5a096294b498eb84b3f63dd24889b~mv2.jpg", // Body Image
    carouselImages: [
      "https://static.wixstatic.com/media/c5947c_8ff5a096294b498eb84b3f63dd24889b~mv2.jpg",
      "https://static.wixstatic.com/media/c5947c_8ff5a096294b498eb84b3f63dd24889b~mv2.jpg",
      "https://static.wixstatic.com/media/c5947c_8ff5a096294b498eb84b3f63dd24889b~mv2.jpg",
      "https://static.wixstatic.com/media/c5947c_8ff5a096294b498eb84b3f63dd24889b~mv2.jpg",
      "https://static.wixstatic.com/media/c5947c_8ff5a096294b498eb84b3f63dd24889b~mv2.jpg"
    ],
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
          setContent(prev => ({
            ...prev,
            ...parsedData,
            carouselImages: parsedData.carouselImages || prev.carouselImages
          }));
        }
      } catch (error) { }
    };

    const fetchDynamicImages = async () => {
      try {
        const carouselPromises = [1, 2, 3, 4, 5].map(num =>
          axios.get(`${apiBaseUrl}/api/content/program_competition_carousel_${num}`)
        );
        const internalPromise = axios.get(`${apiBaseUrl}/api/content/program_competition_internal_1`);

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
        title="Competition Training"
        sectionId="program_competition_hero"
        defaultImage="https://static.wixstatic.com/media/c5947c_80a936d01653434093c7bf7f4276b689~mv2.png"
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
              <img src={content.image1} alt="Competition Training Main" />
            </div>
          </div>
        </section>

        <section className="program-carousel-section">
          <ImageCarousel images={content.carouselImages} />
        </section>

        <FAQ faqData={content.faqs} title="Competition Training FAQs" />
      </div>
    </div>
  );
};

export default CompetitionTraining;
