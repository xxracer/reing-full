import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ProgramPage.css';
import FAQ from '../components/FAQ';
import ProgramHero from '../components/ProgramHero';
import ImageCarousel from '../components/ImageCarousel';

const WrestlingProgram = () => {
    const [content, setContent] = useState({
        introText: "Take the fight where you want it to go. Our Wrestling Program focuses on the critical transition between standing and the ground—takedowns, clinch work, and positional control. Whether you're a BJJ practitioner looking to dominate the stand-up game or a pure wrestler refining your technique, this class gives you the edge.",
        detailsTitle: "Dictate the Pace",
        detailsText: "In grappling, the person who dictates where the match takes place usually wins. Our wrestling curriculum equips you with the tools to initiate and control the action.",
        detailsList: [
            "Explosive Takedowns: Master the mechanics of single, double, and high-crotch attacks",
            "Unbreakable Defense: Sprawl, defend, and counter opponent takedown attempts",
            "Clinch Mastery: Dominate inside ties, underhooks, and upper body control",
            "Conditioning: Build the unique cardio and explosive power required for wrestling"
        ],
        image1: "", // Body Image
        carouselImages: Array(5).fill(null),
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
                    axios.get(`${apiBaseUrl}/api/content/program_wrestling_carousel_${num}?t=${Date.now()}`)
                );
                const internalPromise = axios.get(`${apiBaseUrl}/api/content/program_wrestling_internal_1?t=${Date.now()}`);

                const [r1, r2, r3, r4, r5, rInt1] = await Promise.allSettled([...carouselPromises, internalPromise]);

                const newCarousel = [];
                [r1, r2, r3, r4, r5].forEach((res, index) => {
                    if (res.status === 'fulfilled' && res.value.data && res.value.data.content_value) {
                        let src = res.value.data.content_value;
                        try { const c = JSON.parse(src); if (c.url) src = c; } catch (e) { }
                        newCarousel[index] = src;
                    }
                });

                let newImage1 = null;
                if (rInt1.status === 'fulfilled' && rInt1.value.data && rInt1.value.data.content_value) {
                    let src = rInt1.value.data.content_value;
                    try { const c = JSON.parse(src); if (c.url) src = c; } catch (e) { }
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
                title="Wrestling Program"
                sectionId="program_wrestling_hero"
                defaultImage="https://static.wixstatic.com/media/c5947c_3d6396d1949141f19c991873990833e2~mv2.jpg"
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
                                alt="Wrestling Program Details"
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

export default WrestlingProgram;
