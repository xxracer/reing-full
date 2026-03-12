import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ProgramPage.css';
import FAQ from '../components/FAQ';
import ProgramHero from '../components/ProgramHero';
import ImageCarousel from '../components/ImageCarousel';

const PrivateLessons = () => {
  const [content, setContent] = useState({
    introText: "Accelerate your progress with one-on-one Private Jiu Jitsu lessons. Whether you are a beginner looking to build a strong foundation, an advanced practitioner fixing specific leaks in your game, or someone with a challenging schedule, private training offers the most direct path to mastery.",
    detailsTitle: "Precision & Personalization",
    detailsText: "In a group class, the curriculum is general. In a private lesson, the curriculum is you. Get immediate feedback, tailored drilling, and answers to your specific questions.",
    detailsList: [
      "Rapid Progression: Learn faster with undivided attention from a Black Belt",
      "Custom Curriculum: Focus entirely on your specific goals and problem areas",
      "Flexible Scheduling: Train at times that work specifically for your lifestyle",
      "Competition Specific: Fine-tune your game plan and cut weight safely"
    ],
    image1: "", // Body Image
    carouselImages: Array(5).fill(null),
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
        const response = await axios.get(`${apiBaseUrl}/api/content/program_private-lessons_data?t=${Date.now()}`);
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

        const internalPromise1 = axios.get(`${apiBaseUrl}/api/content/program_private-lessons_internal_1`);
        const internalPromise2 = axios.get(`${apiBaseUrl}/api/content/program_private-lessons_internal_2`);

        const [r1, r2, r3, r4, r5, rInt1, rInt2] = await Promise.allSettled([...carouselPromises, internalPromise1, internalPromise2]);

        const newCarousel = [];
        [r1, r2, r3, r4, r5].forEach((res, index) => {
          if (res.status === 'fulfilled' && res.value.data && res.value.data.content_value) {
            let data = res.value.data.content_value;
            try {
              const parsed = JSON.parse(data);
              if (parsed.url) data = parsed;
            } catch (e) { }
            newCarousel[index] = data;
          }
        });

        let newImage1 = null;
        if (rInt1.status === 'fulfilled' && rInt1.value.data && rInt1.value.data.content_value) {
          let data = rInt1.value.data.content_value;
          try {
            const parsed = JSON.parse(data);
            if (parsed.url) data = parsed;
          } catch (e) { }
          newImage1 = data;
        }

        let newImage2 = null;
        if (rInt2.status === 'fulfilled' && rInt2.value.data && rInt2.value.data.content_value) {
          let data = rInt2.value.data.content_value;
          try {
            const parsed = JSON.parse(data);
            if (parsed.url) data = parsed;
          } catch (e) { }
          newImage2 = data;
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
  }, [apiBaseUrl]);

  const getImageProps = (imgData) => {
    if (typeof imgData === 'object' && imgData !== null && imgData.url) {
      return {
        src: imgData.url,
        style: imgData.coords ? { objectPosition: `${imgData.coords.x}% ${imgData.coords.y}%` } : {}
      };
    }
    return { src: imgData, style: {} };
  };

  const image1Props = getImageProps(content.image1);

  return (
    <div className="program-page">

      <ProgramHero
        title="Private Lessons"
        sectionId="program_private_lessons_hero"
        defaultImage="https://static.wixstatic.com/media/c5947c_32e7f546ef5043418e7e8229d64bb099~mv2.png"
      />

      <div className="program-content-container">

        <section className="program-top-intro animate-fade-up">
          <p>{content.introText}</p>
        </section>

        <section className="program-main-split animate-fade-up delay-1">
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
              <img
                src={image1Props.src}
                alt="Private Lesson Details"
                style={{ ...image1Props.style }}
              />
            </div>
          </div>
        </section>

        <section className="program-carousel-section animate-fade-up delay-2">
          <ImageCarousel images={content.carouselImages} />
        </section>

        <FAQ faqData={content.faqs} title="Frequently Asked Questions" />
      </div>
    </div>
  );
};

export default PrivateLessons;
