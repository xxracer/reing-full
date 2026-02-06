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
                                    tags: [item.category] // Assuming category maps to tag
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
            // Wait a moment for any last minute renders / logo load (though manual click implies it's ready)
            // Explicitly force logo load check if needed, but crossOrigin on img helps.

            const canvas = await html2canvas(scheduleRef.current, {
                scale: 2,
                backgroundColor: '#000000',
                useCORS: true,
                logging: false, // Turn off logging
                height: scheduleRef.current.scrollHeight,
                windowHeight: scheduleRef.current.scrollHeight
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('l', 'mm', 'a4');

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();

            const imgWidth = canvas.width;
            const imgHeight = canvas.height;

            // Calculate ratio to fit width
            const ratio = pdfWidth / imgWidth;

            // Check if height overflows A4 landscape
            const totalPDFHeight = imgHeight * ratio;

            // If it fits on one page, good. If not, we might scale down or multipage.
            // For this schedule, it should fit if we let it scale to fit height if needed.

            let finalRatio = ratio;
            if (totalPDFHeight > pdfHeight) {
                finalRatio = pdfHeight / imgHeight;
            }

            const finalWidth = imgWidth * finalRatio;
            const finalHeight = imgHeight * finalRatio;

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
                                                    <span key={tag} className={`session-tag ${tag}`}>
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

            <div className="schedule-download-btn-container" style={{ marginTop: '30px' }}>
                <button onClick={handleDownloadPDF} className="btn-red-effect" style={{ fontSize: '16px', padding: '12px 24px' }}>
                    Download Schedule PDF
                </button>
            </div>

            <div className="schedule-cta">
                <a href="/contact">Contact us</a> for more info.
            </div>
        </div>
    );
};

export default TrainingSchedule;

