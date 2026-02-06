import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ProgramPage.css';
import FAQ from '../components/FAQ';
import ProgramHero from '../components/ProgramHero';
import ImageCarousel from '../components/ImageCarousel';

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
    image1: "https://static.wixstatic.com/media/c5947c_78dcb424cd4245d9acc5de69236867dc~mv2.jpeg", // Body Image
    carouselImages: [
      "https://static.wixstatic.com/media/c5947c_5cedfbdb69ec448a9e5e0c60dba8235a~mv2.jpeg",
      "https://static.wixstatic.com/media/c5947c_690fa9195b12420bb76a88e15c1502b1~mv2.jpeg",
      "https://static.wixstatic.com/media/c5947c_78dcb424cd4245d9acc5de69236867dc~mv2.jpeg",
      "https://static.wixstatic.com/media/c5947c_5cedfbdb69ec448a9e5e0c60dba8235a~mv2.jpeg",
      "https://static.wixstatic.com/media/c5947c_690fa9195b12420bb76a88e15c1502b1~mv2.jpeg"
    ],
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
          setContent(prev => ({
            ...prev,
            ...parsedData,
            // Only use parsed carousel if explicitly set, otherwise wait for dynamic fetch
            // or keep existing defaults if dynamic fetch fails.
          }));
        }
      } catch (error) {
        // Use defaults
      }
    };

    const fetchDynamicImages = async () => {
      try {
        const carouselPromises = [1, 2, 3, 4, 5].map(num =>
          axios.get(`${apiBaseUrl}/api/content/program_kids_carousel_${num}`)
        );

        // Also fetch internal image 1 if dynamic
        const internalPromise = axios.get(`${apiBaseUrl}/api/content/program_kids_internal_1`);

        const [r1, r2, r3, r4, r5, rInt1] = await Promise.allSettled([...carouselPromises, internalPromise]);

        // Process Carousel
        const newCarousel = [];
        [r1, r2, r3, r4, r5].forEach((res, index) => {
          if (res.status === 'fulfilled' && res.value.data && res.value.data.content_value) {
            let src = res.value.data.content_value;
            try { const c = JSON.parse(src); if (c.url) src = c.url; } catch (e) { }
            newCarousel[index] = src;
          }
        });

        // Process Internal Image
        let newImage1 = null;
        if (rInt1.status === 'fulfilled' && rInt1.value.data && rInt1.value.data.content_value) {
          let src = rInt1.value.data.content_value;
          try { const c = JSON.parse(src); if (c.url) src = c.url; } catch (e) { }
          newImage1 = src;
        }

        setContent(prev => {
          const updated = { ...prev };

          // Update carousel if we found any new images
          if (newCarousel.some(img => img)) {
            updated.carouselImages = updated.carouselImages.map((old, idx) => newCarousel[idx] || old);
          }

          // Update internal image if found
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

      {/* 1. Hero Image */}
      <ProgramHero
        title="Kids Program"
        sectionId="program_kids_hero"
        defaultImage="https://static.wixstatic.com/media/c5947c_690fa9195b12420bb76a88e15c1502b1~mv2.jpeg"
      />

      <div className="program-content-container">

        {/* Top Intro Section - "Subirlo arriba y ponerlo en dos lineas" */}
        <section className="program-top-intro">
          <p>{content.introText}</p>
        </section>

        {/* Split Section: Text Left, Image Right */}
        <section className="program-main-split">

          <div className="text-side">
            <div className="program-details-text-only">
              {/* Bold Title aligned with Image Top */}
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
              <img src={content.image1} alt="Kids Program Main" />
            </div>
          </div>

        </section>

        {/* 5 Images Grid */}
        <section className="program-carousel-section">
          <ImageCarousel images={content.carouselImages} />
        </section>

        <FAQ faqData={content.faqs} title="Kids Program FAQs" />
      </div>
    </div>
  );
};

export default KidsProgram;
