import React, { useEffect, useState, useRef } from 'react';
import './TrainingSchedule.css';
import axios from 'axios';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const daysOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const tagLabels = {
    kids: 'Kids',
    adults: 'Adults',
    private: 'Private Training',
    wrestling: 'Wrestling'
};

const TrainingSchedule = () => {
    const [scheduleData, setScheduleData] = useState([]);
    const [loading, setLoading] = useState(true);
    const scheduleRef = useRef(null);

    useEffect(() => {
        const fetchSchedule = async () => {
            try {
                const response = await axios.get('/api/schedule');
                if (response.data) {
                    // Transform flat list to grouped by day
                    const grouped = daysOrder.map(day => {
                        return {
                            day,
                            sessions: response.data
                                .filter(item => item.day === day)
                                .map(item => ({
                                    time: item.time_range,
                                    title: item.class_name,
                                    tags: [item.category],
                                    category: item.category // Pass raw category for class mapping
                                }))
                        };
                    });
                    setScheduleData(grouped);
                }
            } catch (error) {
                console.error('Failed to fetch schedule', error);
                // Fallback or show error? For now, we keep state empty.
            } finally {
                setLoading(false);
            }
        };

        fetchSchedule();
    }, []);

    const handleDownloadPDF = async () => {
        if (!scheduleRef.current) return;

        try {
            // Create a clone of the element to render it with desktop styles
            const element = scheduleRef.current;
            const clone = element.cloneNode(true);

            // Style the clone to force desktop rendering
            // We set a fixed width large enough to trigger the desktop grid layout (passed 1200px breakpoint)
            clone.style.width = '1400px';
            clone.style.height = 'auto';
            clone.style.position = 'absolute';
            clone.style.top = '-9999px';
            clone.style.left = '-9999px';
            clone.style.zIndex = '-1';
            clone.style.backgroundColor = '#000000'; // Ensure background is captured

            // Append to body to ensure it renders (needed for html2canvas)
            document.body.appendChild(clone);

            // Wait briefly for layout to settle? usually needed for fonts/images but clone is sync.
            // HTML2Canvas options
            const canvas = await html2canvas(clone, {
                scale: 2, // High res
                backgroundColor: '#000000',
                useCORS: true,
                logging: false,
                width: 1400, // Force canvas width
                windowWidth: 1400 // Mock window width for media queries
            });

            // Remove clone
            document.body.removeChild(clone);

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('l', 'mm', 'a4'); // Landscape

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();

            const imgWidth = canvas.width;
            const imgHeight = canvas.height;

            // Calculate ratio to fit width
            const ratio = pdfWidth / imgWidth;

            // Check if height overflows A4 landscape
            // If it does, we scale to fit height instead, or split. 
            // Fitting to height is safer for a single page summary.
            let finalRatio = ratio;
            if (imgHeight * ratio > pdfHeight) {
                finalRatio = pdfHeight / imgHeight;
            }

            const finalWidth = imgWidth * finalRatio;
            const finalHeight = imgHeight * finalRatio;

            // Center
            const imgX = (pdfWidth - finalWidth) / 2;
            const imgY = (pdfHeight - finalHeight) / 2;

            pdf.addImage(imgData, 'PNG', imgX, imgY, finalWidth, finalHeight);
            pdf.save('reign_schedule.pdf');
        } catch (err) {
            console.error("PDF generation failed", err);
            alert("Could not generate PDF. Please try again.");
        }
    };

    if (loading) return <div className="loading" style={{ color: 'white', textAlign: 'center', marginTop: '100px' }}>Loading schedule...</div>;

    return (
        <div className="schedule-page">
            <div className="schedule-content-to-capture" ref={scheduleRef} style={{ padding: '40px', backgroundColor: '#000000' }}>
                {/* Logo Section for PDF/View */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '30px' }}>
                    <img
                        src="https://static.wixstatic.com/media/285fa5_54737d2a46754cc5abc786ca8447555d~mv2.png/v1/fill/w_512,h_516,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/logo_R_only_final_logo_round.png"
                        alt="Reign Logo"
                        style={{ height: '80px', width: 'auto', marginBottom: '10px' }}
                        crossOrigin="anonymous"
                    />
                    <h1 style={{ marginBottom: '10px', marginTop: 0, color: '#FFFFFF' }}>TRAINING SCHEDULE</h1>
                    <p className="schedule-intro" style={{ marginBottom: '0', color: '#FFFFFF' }}>
                        Below is the latest weekly schedule for Reign Jiu Jitsu in Katy.
                    </p>
                </div>

                <div className="schedule-grid">
                    {scheduleData.map((day) => (
                        <div key={day.day} className="schedule-day">
                            <h2>{day.day}</h2>
                            <ul className="schedule-sessions">
                                {day.sessions.length === 0 ? (
                                    <li className="schedule-session">
                                        <span className="time">—</span>
                                        <p className="title">No sessions</p>
                                    </li>
                                ) : (
                                    day.sessions.map((session, index) => (
                                        <li key={`${day.day}-${index}`} className="schedule-session">
                                            <span className="time">{session.time}</span>
                                            <p className="title">{session.title}</p>
                                            <div className="session-tags">
                                                {session.tags.map((tag) => (
                                                    <span key={tag} className={`session-tag tag-${tag}`}>
                                                        {tagLabels[tag] || tag || 'Class'}
                                                    </span>
                                                ))}
                                            </div>
                                        </li>
                                    ))
                                )}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>

            <div className="schedule-download-btn-container">
                <button onClick={handleDownloadPDF} className="btn-red-effect" style={{ fontSize: '16px', padding: '12px 24px' }}>
                    Download Schedule PDF
                </button>
            </div>

            <div className="schedule-cta">
                <a href="/contact">Contact us</a> for more info.
            </div>

            {/* Spacer to prevent content from being hidden behind sticky button */}
            <div className="schedule-spacer"></div>
        </div>
    );
};

export default TrainingSchedule;

