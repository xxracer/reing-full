import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ProgramPage.css';
import FAQ from '../components/FAQ';
import ProgramHero from '../components/ProgramHero';
import ImageCarousel from '../components/ImageCarousel';

const KidsProgram = () => {
  const [content, setContent] = useState({
    introText: "Our Kids Jiu Jitsu classes are designed to help children build confidence, respect, and discipline while having fun. From preschoolers (ages 4 and up) to teens, our children’s Jiu Jitsu and teens Jiu Jitsu classes focus on developing coordination, teamwork, and self-defense skills. We also welcome families looking for family Jiu Jitsu programs.",
    detailsTitle: "More Than Just Self-Defense",
    detailsText: "We provide a safe and supportive environment where children can learn and grow. Our curriculum is designed to be engaging and effective.",
    detailsList: [
      "Develop coordination and teamwork",
      "Learn valuable self-defense skills",
      "Build respect and discipline",
      "Have fun while learning"
    ],
    image1: "", // Body Image
    carouselImages: Array(5).fill(null),
    faqs: [
      {
        question: "What is the minimum age for the Kids Program?",
        answer: "Our Kids Jiu Jitsu program is suitable for children ages 4 and up, focusing on fundamentals, sport jiujitsu and character development."
      },
      {
        question: "What gear is required for my child's first class?",
        answer: "For your trial class, we’ll lend you a Gi to use. If you enroll in an Unlimited Membership, we’ll guide you on purchasing the required Gi for training."
      }
    ]
  });

  const apiBaseUrl = '';

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await axios.get(`${apiBaseUrl}/api/content/program_kids_data?t=${Date.now()}`);
        if (response.data && response.data.content_value) {
          const parsedData = JSON.parse(response.data.content_value);
          // Prevent CMS from overwriting hardcoded text requests
          delete parsedData.introText;
          delete parsedData.detailsTitle;
          delete parsedData.detailsText;
          delete parsedData.detailsList;
          delete parsedData.faqs;
          
          setContent(prev => ({
            ...prev,
            ...parsedData,
          }));
        }
      } catch (error) {
        // Use defaults
      }
    };

    const fetchDynamicImages = async () => {
      try {
        const carouselPromises = [1, 2, 3, 4, 5].map(num =>
          axios.get(`${apiBaseUrl}/api/content/program_kids_carousel_${num}?t=${Date.now()}`)
        );

        const internalPromise = axios.get(`${apiBaseUrl}/api/content/program_kids_internal_1?t=${Date.now()}`);

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
          if (newImage1) {
            updated.image1 = newImage1;
          }
          return updated;
        });
      } catch (e) {
        console.error("Error fetching dynamic images", e);
      }
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
        title="Kids Program"
        sectionId="program_kids_hero"
        defaultImage="https://static.wixstatic.com/media/c5947c_690fa9195b12420bb76a88e15c1502b1~mv2.jpeg"
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
                alt="Kids Program Details"
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

export default KidsProgram;
