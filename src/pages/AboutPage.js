import React from 'react';
import FAQ from '../components/FAQ';
import ProgramHero from '../components/ProgramHero';
import './ProgramPage.css'; // Re-use styles for consistency

const AboutPage = () => {
  const pageFaqs = [
    {
      question: "What is Reign BJJ's commitment to the Katy community?",
      answer: "Reign Jiu Jitsu is 100% committed to our community, offering the highest quality training in Katy to help individuals achieve their fitness and self-defense goals in a supportive environment."
    },
    {
      question: "Do you focus more on competition or self-defense?",
      answer: "Jiu Jitsu at Reign is built on real self-defense first. Every student learns how to protect themselves and stay composed under pressure. For those who want more, our Competition Program develops advanced skill, conditioning, and mental toughness. The result is simple: practical confidence for life, with the option to train at an elite level."
    },
    {
      question: "What mental benefits can I expect from the training?",
      answer: "Training leads to improved confidence, boosted energy, reduced stress, and better sleep, contributing to significant mental and spiritual benefits."
    }
  ];

  return (
    <div className="program-page">

      <ProgramHero
        title="About / Our Method"
        sectionId="about_us_image"
        defaultImage="https://static.wixstatic.com/media/c5947c_ac4e41c0457d42fcbc4f4f070b3eb0b8~mv2.jpeg"
      />

      <section className="program-intro">
        <p>
          At Reign Jiu Jitsu in Katy, Texas, Professor Moon has developed an innovative results-proven Jiu Jitsu program that blends his years of experience as a public school educator with his deep background in Jiu Jitsu and personal training, specializing in sports performance. His method is intentionally designed to reach ALL types of learners, whether a student thrives through structure, repetition, competition, or individualized coaching.
        </p>
        <p style={{ marginTop: '15px' }}>
          By combining proven teaching principles with high-level technical training, he has produced some of the top youth competitors in the world, developing multiple champions through a system built on discipline, confidence, and intelligent progression.
        </p>
        <p style={{ marginTop: '15px' }}>
          What makes Reign different is that this methodology is not limited to one instructor. Professor Moon has successfully translated his system to the entire coaching staff, creating a unified culture where every instructor teaches with clarity, purpose, and energy. The result is a welcoming, high-performance training environment where beginners, hobbyists, and elite competitors can all grow, improve, and thrive.
        </p>
      </section>

      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <FAQ faqData={pageFaqs} title="About Us FAQs" />
      </div>
    </div>
  );
};

export default AboutPage;
