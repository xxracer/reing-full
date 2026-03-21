import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ProgramPage.css'; // Reusing the same structure as programs
import FAQ from '../components/FAQ';
import ProgramHero from '../components/ProgramHero';
import ImageCarousel from '../components/ImageCarousel';

const OurFacilityPage = () => {
  const [content, setContent] = useState({
    introText: "Welcome to Reign Jiu Jitsu. Our academy was built from the ground up to provide the ultimate training environment. From premium Zebra mats to spotless amenities, every detail is designed to ensure you learn safely and comfortably in a welcoming community.",
    detailsTitle: "A Standard of Excellence",
    detailsText: "More than just a gym, our Katy, TX facility is your second home. We prioritize cleanliness, safety, and a positive atmosphere where every student can thrive.",
    detailsList: [
      "Premium Training Surface: High-impact Zebra mats to protect your joints during takedowns and rolls",
      "Immaculate Cleanliness: Mats are sanitized daily, and facilities are deep-cleaned consistently",
      "Comfortable Amenities: Clean locker rooms and dedicated spaces for families to watch classes",
      "Welcoming Community: A supportive environment free from ego or intimidation"
    ],
    image1: "", // Body Image
    carouselImages: [
      "https://static.wixstatic.com/media/c5947c_475cbf851e054bdc915bfcbb7fd2b704~mv2.png",
      "https://static.wixstatic.com/media/c5947c_b40f2d46adab45ae967e41fd1868925b~mv2.png",
      "https://static.wixstatic.com/media/c5947c_475cbf851e054bdc915bfcbb7fd2b704~mv2.png",
      "https://static.wixstatic.com/media/c5947c_b40f2d46adab45ae967e41fd1868925b~mv2.png",
      "https://static.wixstatic.com/media/c5947c_475cbf851e054bdc915bfcbb7fd2b704~mv2.png"
    ],
    faqs: [
      {
        question: "How often are the training mats cleaned?",
        answer: "We maintain germ-free facilities, prioritizing hygiene by cleaning the mats daily with medical-grade sanitizers, adhering to the highest standard of safety."
      },
      {
        question: "Does the facility have locker rooms or showers?",
        answer: "Yes, we provide modern amenities, including dedicated changing areas and showers, for the convenience of our students before and after training."
      },
      {
        question: "Is there a place for parents to sit and watch?",
        answer: "Absolutely. We have a dedicated spectator area where parents, friends, and family can comfortably watch classes."
      }
    ]
  });

  const apiBaseUrl = '';

  useEffect(() => {
    // We try to pull dynamic content if it exists, otherwise fallback to defaults
    const fetchDynamicImages = async () => {
      try {
        const i1Promise = axios.get(`${apiBaseUrl}/api/content/facility_image_1`);
        const i2Promise = axios.get(`${apiBaseUrl}/api/content/facility_image_2`);

        const [r1, r2] = await Promise.allSettled([i1Promise, i2Promise]);

        let url1 = null;
        let url2 = null;

        if (r1.status === 'fulfilled' && r1.value.data && r1.value.data.content_value) {
            let src = r1.value.data.content_value;
            try { const c = JSON.parse(src); if (c.url) src = c.url; } catch (e) {}
            url1 = src;
        }

        if (r2.status === 'fulfilled' && r2.value.data && r2.value.data.content_value) {
            let src = r2.value.data.content_value;
            try { const c = JSON.parse(src); if (c.url) src = c.url; } catch (e) {}
            url2 = src;
        }

        setContent(prev => {
           const updated = { ...prev };
           if (url1) {
             updated.image1 = url1;
             updated.carouselImages[0] = url1;
             updated.carouselImages[2] = url1;
           }
           if (url2) {
             updated.carouselImages[1] = url2;
             updated.carouselImages[3] = url2;
           }
           return updated;
        });

      } catch (error) {
        console.error("Error fetching facility content", error);
      }
    };

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

  const image1Props = getImageProps(content.image1 || content.carouselImages[0]);

  return (
    <div className="program-page">

      <ProgramHero
        title="Our Facility"
        sectionId="facility_hero"
        defaultImage={content.carouselImages[1] || "https://static.wixstatic.com/media/c5947c_475cbf851e054bdc915bfcbb7fd2b704~mv2.png"}
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
                alt="Our Facility Main View"
                style={{ ...image1Props.style }}
              />
            </div>
          </div>
        </section>

        <section className="program-carousel-section animate-fade-up delay-2">
          <ImageCarousel images={content.carouselImages} />
        </section>

        <FAQ faqData={content.faqs} title="Facility FAQs" />
      </div>
    </div>
  );
};

export default OurFacilityPage;