import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ImageEditor from '../../components/admin/ImageEditor';
import VideoEditor from '../../components/admin/VideoEditor';

const ManageFacility = () => {
    const [mediaType, setMediaType] = useState('images'); // 'images' or 'video'
    const [loading, setLoading] = useState(true);
    const [saveStatus, setSaveStatus] = useState('');
    const apiBaseUrl = '';

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await axios.get(`${apiBaseUrl}/api/content/facility_media_type`);
                if (response.data && response.data.content_value) {
                    setMediaType(response.data.content_value);
                }
            } catch (error) {
                console.error("Error fetching media type", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleMediaTypeChange = async (type) => {
        setMediaType(type);
        setSaveStatus('Saving...');
        try {
            await axios.post(`${apiBaseUrl}/api/content`, {
                content_key: 'facility_media_type',
                content_value: type,
                content_type: 'text'
            });
            setSaveStatus('Saved!');
            setTimeout(() => setSaveStatus(''), 2000);
        } catch (error) {
            console.error("Error saving media type", error);
            setSaveStatus('Error saving');
        }
    };

    return (
        <div>
            <h1>Manage Facility Page</h1>
            <p>Edit the images displayed on the "Our Facility" page. You can upload photos or videos (MP4/WebM).</p>

            <div style={{
                padding: '20px',
                backgroundColor: '#fff',
                borderRadius: '8px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                marginBottom: '30px',
                border: '1px solid #eee'
            }}>
                <h3>Display Mode</h3>
                <p style={{ marginBottom: '15px' }}>Choose what to display on the public website:</p>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <input
                            type="radio"
                            name="mediaType"
                            value="images"
                            checked={mediaType === 'images'}
                            onChange={() => handleMediaTypeChange('images')}
                        />
                        <strong>Two Images (Grid)</strong>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <input
                            type="radio"
                            name="mediaType"
                            value="video"
                            checked={mediaType === 'video'}
                            onChange={() => handleMediaTypeChange('video')}
                        />
                        <strong>One Video (Vertical/YouTube)</strong>
                    </label>
                    {saveStatus && <span style={{ color: 'green', fontWeight: 'bold', marginLeft: '15px' }}>{saveStatus}</span>}
                </div>
            </div>

            {mediaType === 'images' && (
                <>
                    <div style={{ marginBottom: '40px' }}>
                        <h3>Left Image (Facility Wide Shot)</h3>
                        <ImageEditor
                            sectionId="facility_image_1"
                            title="Facility Image 1"
                            showPositionControl={true}
                        />
                    </div>

                    <div style={{ marginBottom: '40px' }}>
                        <h3>Right Image (Equipment/Detail)</h3>
                        <ImageEditor
                            sectionId="facility_image_2"
                            title="Facility Image 2"
                            showPositionControl={true}
                        />
                    </div>
                </>
            )}

            {mediaType === 'video' && (
                <div style={{ marginBottom: '40px' }}>
                    <h3>Facility Video</h3>
                    <VideoEditor
                        sectionId="facility_video"
                        title="Facility YouTube Video"
                    />
                </div>
            )}
        </div>
    );
};

export default ManageFacility;
