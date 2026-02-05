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
      question: "Is Jiu Jitsu safe for children, and what are the benefits for kids?",
      answer: "Yes, our Kids Jiu Jitsu program is taught in a safe, controlled environment. Benefits include developing strong core values, leadership skills, physical fitness, and the self-confidence necessary to address anti-bullying situations."
    },
    {
      question: "I am an adult beginner with no experience. Where should I start?",
      answer: "New adult students should begin with our Fundamentals Program. This curriculum focuses on core movements, body positioning, and essential techniques, ensuring you learn safely and effectively before transitioning to the main Adult Program."
    },
    {
      question: "How quickly can I see results in fitness and weight loss with Jiu Jitsu?",
      answer: "Jiu Jitsu is a highly effective fitness program. Consistent training helps achieve sustainable weight loss, lean muscle gain, improved confidence, and boosted energy faster than traditional gym workouts."
    },
    {
      question: "Does the training include self-defense techniques?",
      answer: "Yes. Brazilian Jiu Jitsu is fundamentally a self-defense system, providing practical techniques that are highly useful in real-life situations, allowing control over an opponent regardless of their size."
    },
    {
      question: "Is a uniform (Gi) required for the first class?",
      answer: "For your first trial class, comfortable athletic wear is sufficient. We provide guidance on required gear after enrollment, and the Unlimited Membership often includes a complimentary Gi."
    },
    {
      question: "Who is the Head Instructor and what level of expertise does he provide?",
      answer: "The Head Instructor is Pablo Silva, a highly decorated Black Belt and former IBJJF World Champion. Training here means receiving instruction rooted in verifiable, world-class competitive success and expertise."
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