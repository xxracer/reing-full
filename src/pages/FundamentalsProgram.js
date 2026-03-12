import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ProgramPage.css';
import FAQ from '../components/FAQ';
import ProgramHero from '../components/ProgramHero';
import ImageCarousel from '../components/ImageCarousel';

const FundamentalsProgram = () => {
  const [content, setContent] = useState({
    introText: "Every black belt started exactly where you are right now. Our Fundamentals Jiu Jitsu program is explicitly designed for beginners to learn the sport safely, effectively, and without intimidation. We break down complex movements into simple, repeatable steps so you can build a rock-solid foundation from day one.",
    detailsTitle: "The Bedrock of Jiu Jitsu",
    detailsText: "Mastering the basics is the secret to long-term success. Our curriculum focuses on the essential techniques that you will use from white belt all the way to black belt.",
    detailsList: [
      "Core Movements: Master the essential escapes, sweeps, and submissions",
      "Position Before Submission: Learn how to control and survive from any angle",
      "Safe Training Environment: Drill at a controlled pace with supportive partners",
      "Fitness Baseline: Build the functional strength required for the sport"
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
        const response = await axios.get(`${apiBaseUrl}/api/content/program_fundamentals_data?t=${Date.now()}`);
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
          axios.get(`${apiBaseUrl}/api/content/program_fundamentals_carousel_${num}?t=${Date.now()}`)
        );
        const internalPromise = axios.get(`${apiBaseUrl}/api/content/program_fundamentals_internal_1?t=${Date.now()}`);

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
        title="Fundamentals Program"
        sectionId="program_fundamentals_hero"
        defaultImage="https://static.wixstatic.com/media/c5947c_c7ef85e5ccc24f99b71c499e9c5d41fd~mv2.jpg"
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
                alt="Fundamentals Program Details"
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

export default FundamentalsProgram;
