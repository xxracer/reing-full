import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ProgramPage.css';
import FAQ from '../components/FAQ';
import ProgramHero from '../components/ProgramHero';
import ImageCarousel from '../components/ImageCarousel';

const AdultProgram = () => {
  const [content, setContent] = useState({
    introText: "Step onto the mat and transform your life. Our Adult Jiu Jitsu program in Katy, TX provides a welcoming, challenging environment for everyone—from absolute beginners to seasoned competitors. Whether your goal is practical self-defense, elite fitness, or joining a community that pushes you to be your best, you'll find your path here.",
    detailsTitle: "Empowerment Through Technique",
    detailsText: "Jiu Jitsu is for everyone. It's a journey of physical conditioning and mental problem-solving that repays your hard work with incredible results.",
    detailsList: [
      "Real-World Self-Defense: Learn leverage-based techniques that actually work",
      "Total Body Fitness: Burn calories, build functional strength, and increase mobility",
      "Mental Resilience: Relieve stress while learning to stay calm under pressure",
      "Comprehensive Training: Access to both Gi and No-Gi curriculums"
    ],
    image1: "", // Body Image
    carouselImages: Array(5).fill(null),
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
        const response = await axios.get(`${apiBaseUrl}/api/content/program_adult_data?t=${Date.now()}`);
        if (response.data && response.data.content_value) {
          const parsedData = JSON.parse(response.data.content_value);
          // Block CMS from overriding text
          delete parsedData.introText;
          delete parsedData.detailsTitle;
          delete parsedData.detailsText;
          delete parsedData.detailsList;
          delete parsedData.faqs;
          setContent(prev => ({ ...prev, ...parsedData }));
        }
      } catch (error) { }
    };

    const fetchDynamicImages = async () => {
      try {
        const carouselPromises = [1, 2, 3, 4, 5].map(num =>
          axios.get(`${apiBaseUrl}/api/content/program_adult_carousel_${num}?t=${Date.now()}`)
        );
        const internalPromise = axios.get(`${apiBaseUrl}/api/content/program_adult_internal_1?t=${Date.now()}`);

        const [r1, r2, r3, r4, r5, rInt1] = await Promise.allSettled([...carouselPromises, internalPromise]);

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
        title="Adult Program"
        sectionId="program_adult_hero"
        defaultImage="https://static.wixstatic.com/media/c5947c_fae53860ebbd4e9a8644aa66c76e45e1~mv2.jpg"
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
                alt="Adult Program Details"
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

export default AdultProgram;
