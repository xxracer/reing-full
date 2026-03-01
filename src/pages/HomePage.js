import React, { useState, useEffect, useRef } from 'react';
import FAQ from '../components/FAQ';

// Import components
import HeroSection from '../components/HeroSection';
import WelcomeSection from '../components/WelcomeSection';
import Programs from '../components/Programs';
import Facility from '../components/Facility';
import Testimonials from '../components/Testimonials';
import CallToAction from '../components/CallToAction';
import ContactUs from '../components/ContactUs';
import InstagramFeed from '../components/InstagramFeed';
import './HomePage.css'; // Import new CSS for homepage structure

const HomePage = () => {
  const [videoOpacity, setVideoOpacity] = useState(1);
  const welcomeRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (welcomeRef.current) {
        const { top } = welcomeRef.current.getBoundingClientRect();
        const windowHeight = window.innerHeight;

        // Start fading when the welcome section is visible on screen
        const fadeStartPoint = windowHeight;
        // End fading when it's at the top of the screen
        const fadeEndPoint = 0;

        if (top < fadeStartPoint) {
          const progress = (fadeStartPoint - top) / (fadeStartPoint - fadeEndPoint);
          const newOpacity = 1 - Math.min(progress, 1);
          setVideoOpacity(newOpacity);
        } else {
          setVideoOpacity(1);
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const programsFaqs = [
    {
      question: "I am an adult beginner with no experience. Where should I start?",
      answer: "New adult students should begin with our Fundamentals Program. This curriculum focuses on core movements, body positioning, and essential techniques, ensuring you learn safely and effectively before transitioning to the main Adult Program. All while getting a great workout in."
    },
    {
      question: "Does the training include self-defense techniques?",
      answer: "Yes. Brazilian Jiu Jitsu is fundamentally a self-defense system, providing practical techniques that are highly useful in real-life situations, allowing control over an opponent regardless of their size."
    },
    {
      question: "Is a uniform (Gi) required for the first class?",
      answer: "No. For your first class, we’ll provide a complimentary Gi for you to use. Just wear comfortable athletic clothing underneath and some sandals or flip flops. If you become a member, we’ll guide you on purchasing the appropriate uniform for training."
    },
    {
      question: "Who is the Head Instructor and what level of expertise does he provide?",
      answer: "Moon Kim is a first degree Brazilian Jiu-Jitsu Black Belt with 17 years of experience in public Education and teaching. He brings a strong background in structured instruction, helping students understand not just what to do, but why they’re doing it. He was the first student of IBJJF World Champion Pablo Silva, training under a world-class competitor from the beginning. His coaching combines high-level competitive foundations with clear, professional and easy to understand instruction."
    },
    {
      question: "What is Brazilian Jiu-Jitsu, and how is it different from other martial arts?",
      answer: "Brazilian Jiu-Jitsu (BJJ) is a martial art focusing on ground fighting and submission techniques. Unlike some martial arts that emphasize striking, BJJ teaches how to control opponents through positioning, leverage, and joint locks. It's often referred to as the \"gentle art,\" as it enables a smaller person to overcome larger opponents through technique."
    },
    {
      question: "Do you offer private lessons or specialized training?",
      answer: "Yes, we offer private lessons for those looking for one-on-one attention, as well as specialized training for competitions or specific skill development. Speak to our instructors to tailor a program that fits your needs."
    },
    {
      question: "How often should I train to see improvement?",
      answer: "Progress in Brazilian Jiu-Jitsu varies for each individual, but attending 2-3 classes per week is generally a good starting point. Consistency and regular practice will lead to steady improvement."
    },
    {
      question: "Do I need to be physically fit to start Brazilian Jiu-Jitsu?",
      answer: "No, you do not need to be in peak physical condition to begin training in Brazilian Jiu-Jitsu. BJJ itself is a great way to improve your fitness level. Our classes are structured to accommodate different fitness levels, and our instructors will help you gradually develop strength, endurance, and flexibility."
    }
  ];

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Reign Jiu Jitsu",
    "image": "https://static.wixstatic.com/media/c5947c_690fa9195b12420bb76a88e15c1502b1~mv2.jpeg",
    "telephone": "713-446-6008",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "1648A S Mason Rd",
      "addressLocality": "Katy",
      "addressRegion": "TX",
      "postalCode": "77450",
      "addressCountry": "US"
    },
    "description": "Reign Jiu Jitsu is the best BJJ academy in Katy, Texas, offering world-class Brazilian Jiu Jitsu training for kids and adults. Home to multiple champions and led by expert instructors.",
    "priceRange": "$$"
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": programsFaqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <div className="homepage-container">
      <script type="application/ld+json">
        {JSON.stringify(localBusinessSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(faqSchema)}
      </script>
      <HeroSection videoOpacity={videoOpacity} />
      <div className="welcome-section-wrapper" ref={welcomeRef}>
        <WelcomeSection />
        <Programs />
        <Facility />
        <Testimonials />
        <CallToAction />
        <ContactUs />
        <InstagramFeed />
        <div style={{ maxWidth: '900px', margin: '0 auto 60px auto' }}>
          <FAQ faqData={programsFaqs} title="About Our Programs" />
        </div>
      </div>
    </div>
  );
};

export default HomePage;