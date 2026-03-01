import React, { useState, useEffect } from 'react';
import './FAQ.css';

const defaultFaqData = [
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

const FAQItem = ({ faq, index, toggleFAQ }) => {
  return (
    <div
      className={`faq-item ${faq.open ? 'open' : ''}`}
      onClick={() => toggleFAQ(index)}
    >
      <div className="faq-question">
        {faq.question}
        <span className="faq-icon">{faq.open ? '−' : '+'}</span>
      </div>
      <div className="faq-answer-wrapper">
        <p className="faq-answer">{faq.answer}</p>
      </div>
    </div>
  );
};

const FAQ = ({ faqData = defaultFaqData, title = "Frequently Asked Questions" }) => {
  const [faqs, setFaqs] = useState([]);

  useEffect(() => {
    setFaqs(faqData.map(item => ({ ...item, open: false })));
  }, [faqData]);

  const toggleFAQ = index => {
    setFaqs(
      faqs.map((faq, i) => {
        if (i === index) {
          faq.open = !faq.open;
        } else {
          faq.open = false; // Only one open at a time
        }
        return faq;
      })
    );
  };

  return (
    <section id="faq" className="faq-section">
      <h2 className="section-title">{title}</h2>
      <div className="faq-container">
        {faqs.map((faq, index) => (
          <FAQItem
            key={index}
            faq={faq}
            index={index}
            toggleFAQ={toggleFAQ}
          />
        ))}
      </div>
    </section>
  );
};

export default FAQ;