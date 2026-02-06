import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ProgramPage.css';
import FAQ from '../components/FAQ';
import ProgramHero from '../components/ProgramHero';
import ImageCarousel from '../components/ImageCarousel';

const WrestlingProgram = () => {
    const [content, setContent] = useState({
        introText: "Our Wrestling Program focuses on takedowns, control, and positional dominance. Designed for both BJJ practitioners looking to improve their stand-up game and pure wrestlers, this class covers the essential techniques of wrestling.",
        detailsTitle: "Takedowns and Control",
        detailsText: "Wrestling is a crucial component of grappling. Our program will help you develop the skills to take the fight to the ground on your terms.",
        detailsList: [
            "- Master effective takedowns",
            "- Improve positional control",
            "- Enhance your BJJ stand-up game",
            "- Build explosive power and conditioning"
        ],
        image1: "https://static.wixstatic.com/media/c5947c_3d6396d1949141f19c991873990833e2~mv2.jpg", // Body Image
        carouselImages: [
            "https://static.wixstatic.com/media/c5947c_3d6396d1949141f19c991873990833e2~mv2.jpg",
            "https://static.wixstatic.com/media/c5947c_3d6396d1949141f19c991873990833e2~mv2.jpg",
            "https://static.wixstatic.com/media/c5947c_3d6396d1949141f19c991873990833e2~mv2.jpg",
            "https://static.wixstatic.com/media/c5947c_3d6396d1949141f19c991873990833e2~mv2.jpg",
            "https://static.wixstatic.com/media/c5947c_3d6396d1949141f19c991873990833e2~mv2.jpg"
        ],
        faqs: [
            {
                question: "Is wrestling experience required?",
                answer: "No, our program is suitable for all levels, from beginners to experienced wrestlers."
            },
            {
                question: "Do I need wrestling shoes?",
                answer: "Wrestling shoes are recommended but not mandatory for your first few classes."
            }
        ]
    });

    const apiBaseUrl = '';

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const response = await axios.get(`${apiBaseUrl}/api/content/program_wrestling_data`);
                if (response.data && response.data.content_value) {
                    const parsedData = JSON.parse(response.data.content_value);
                    setContent(prev => ({ ...prev, ...parsedData }));
                }
            } catch (error) { }
        };

        const fetchDynamicImages = async () => {
            try {
                const carouselPromises = [1, 2, 3, 4, 5].map(num =>
                    axios.get(`${apiBaseUrl}/api/content/program_wrestling_carousel_${num}`)
                );
                const internalPromise = axios.get(`${apiBaseUrl}/api/content/program_wrestling_internal_1`);

                const [r1, r2, r3, r4, r5, rInt1] = await Promise.allSettled([...carouselPromises, internalPromise]);

                const newCarousel = [];
                [r1, r2, r3, r4, r5].forEach((res, index) => {
                    if (res.status === 'fulfilled' && res.value.data && res.value.data.content_value) {
                        let src = res.value.data.content_value;
                        try { const c = JSON.parse(src); if (c.url) src = c.url; } catch (e) { }
                        newCarousel[index] = src;
                    }
                });

                let newImage1 = null;
                if (rInt1.status === 'fulfilled' && rInt1.value.data && rInt1.value.data.content_value) {
                    let src = rInt1.value.data.content_value;
                    try { const c = JSON.parse(src); if (c.url) src = c.url; } catch (e) { }
                    newImage1 = src;
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

            <ProgramHero
                title="Wrestling Program"
                sectionId="program_wrestling_hero"
                defaultImage="https://static.wixstatic.com/media/c5947c_3d6396d1949141f19c991873990833e2~mv2.jpg"
            />

            <div className="program-content-container">

                <section className="program-top-intro">
                    <p>{content.introText}</p>
                </section>

                <section className="program-main-split">
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
                            <img src={content.image1} alt="Wrestling Program Main" />
                        </div>
                    </div>
                </section>

                <section className="program-carousel-section">
                    <ImageCarousel images={content.carouselImages} />
                </section>

                <FAQ faqData={content.faqs} title="Wrestling Program FAQs" />
            </div>
        </div>
    );
};

export default WrestlingProgram;
