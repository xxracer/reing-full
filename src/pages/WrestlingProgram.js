import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ProgramPage.css';
import FAQ from '../components/FAQ';
import ProgramHero from '../components/ProgramHero';

const WrestlingProgram = () => {
    const [content, setContent] = useState({
        introText: "Wrestling is a complete sport that builds real-world athleticism: strength, balance, speed, coordination, and grit. Sessions focus on stance and motion, hand-fighting, level changes, shots, and safe finishes, taught with clear progressions and controlled intensity.",
        detailsTitle: "Why It Matters",
        detailsText: "Wrestling builds a strong foundation for all grappling sports.",
        detailsList: [
            "- Develops full-body strength and conditioning",
            "- Sharpens footwork, reaction time, and body control",
            "- Builds confidence, resilience, and work ethic",
            "- Takedown skills and top pressure directly support Jiu Jitsu and No-Gi"
        ],
        image1: "https://placehold.co/600x400?text=Wrestling+Training+1", // Improved default if available
        image2: "https://placehold.co/900x500?text=Wrestling+Training+2",
        faqs: [
            {
                question: 'Do I need prior wrestling experience to join?',
                answer: 'No. We tailor instruction for newcomers and experienced grapplers alike, ensuring everyone learns proper stance, motion, and mat awareness from day one.'
            },
            {
                question: 'Can wrestling training help my Jiu Jitsu?',
                answer: 'Absolutely. Takedown entries, level changes, and top control developed in wrestling directly boost your Gi and No-Gi performance.'
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

        const fetchImages = async () => {
            try {
                // Wrestling previously used wrestling_detail_1, let's migrate or fall back to program_wrestling_internal_1
                // For consistency with the MAIN editor, we use program_wrestling_internal_1
                const [img1Res, img2Res] = await Promise.all([
                    axios.get(`${apiBaseUrl}/api/content/program_wrestling_internal_1`),
                    axios.get(`${apiBaseUrl}/api/content/program_wrestling_internal_2`)
                ]);

                if (img1Res.data && img1Res.data.content_value) {
                    let src = img1Res.data.content_value;
                    try { const c = JSON.parse(src); if (c.url) src = c.url; } catch (e) { }
                    setContent(prev => ({ ...prev, image1: src }));
                }

                if (img2Res.data && img2Res.data.content_value) {
                    let src = img2Res.data.content_value;
                    try { const c = JSON.parse(src); if (c.url) src = c.url; } catch (e) { }
                    setContent(prev => ({ ...prev, image2: src }));
                }
            } catch (e) { }
        };

        fetchContent();
        fetchImages();
    }, []);

    const faqSchema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: content.faqs.map((faq) => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
                '@type': 'Answer',
                text: faq.answer
            }
        }))
    };

    return (
        <div className="program-page">
            <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>

            <ProgramHero
                title="Wrestling Program"
                sectionId="program_wrestling_image"
                defaultImage="https://images.unsplash.com/photo-1521412644187-c49fa049e84d?auto=format&fit=crop&w=1600&q=80"
            />

            <section className="program-intro">
                <h2>Strong. Fast. Disciplined.</h2>
                <p>{content.introText}</p>
            </section>

            <section className="program-details-section">
                <div className="program-details-text">
                    <h2>{content.detailsTitle}</h2>
                    <p>{content.detailsText}</p>
                    <ul>
                        {content.detailsList.map((item, index) => (
                            <li key={index}>{item}</li>
                        ))}
                    </ul>
                </div>
                <div className="program-details-image">
                    {content.image1 && <img src={content.image1} alt="Wrestling Detail 1" />}
                </div>
            </section>

            {/* Wrestling had an extra section, we keep it static or use a new slot? 
                For now keep static as it was hardcoded structure differences. 
                Or we can append it to introText if we want it editable.
                The 'Who It's For' and 'What to Bring' were distinct.
                For now, let's render them static or basic content to avoid breaking the generic editor model too much.
            */}
            <section className="program-intro" style={{ maxWidth: '1000px' }}>
                <div className="program-details-text" style={{ margin: '0 auto' }}>
                    <h2>Who It&apos;s For</h2>
                    <p>Beginners, teens, and competitors looking to upgrade overall athletic performance.</p>
                    <h2 style={{ marginTop: '40px' }}>What to Bring</h2>
                    <p>Rashguard and shorts; wrestling shoes optional (clean soles). Mouthguard recommended.</p>
                    <h2 style={{ marginTop: '40px' }}>Ready to train?</h2>
                    <p>Join our Wrestling Program and build a stronger, faster version of you.</p>
                </div>
            </section>

            <div style={{ textAlign: 'center', margin: '0 auto 60px auto', maxWidth: '900px', padding: '0 20px' }}>
                {content.image2 && (
                    <img
                        src={content.image2}
                        alt="Wrestling Detail 2"
                        style={{ width: '100%', height: 'auto', borderRadius: '8px' }}
                    />
                )}
            </div>

            <FAQ faqData={content.faqs} title="Wrestling Program FAQs" />
        </div>
    );
};

export default WrestlingProgram;
