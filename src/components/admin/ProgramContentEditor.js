import React, { useState } from 'react';
import axios from 'axios';
import ImageEditor from './ImageEditor';

// Default images from original design
// Default images from original design - unused


const ProgramContentEditor = ({ programId, title }) => {
    const [isSynced, setIsSynced] = useState(true); // Default to synced
    const apiBaseUrl = '';

    // Custom Save Handler passed to ImageEditor
    const handleHeroSave = async (imageUrl, data) => {
        // 1. Always save to the Hero key
        await axios.put(`${apiBaseUrl}/api/content/program_${programId}_hero`, {
            content_type: 'image_details',
            content_value: JSON.stringify(data)
        });

        // 2. If Synced, ALSO save to the Homepage key
        if (isSynced) {
            await axios.put(`${apiBaseUrl}/api/content/program_${programId}_image`, {
                content_type: 'image_details',
                content_value: JSON.stringify(data)
            });
        }
    };

    return (
        <div className="program-content-editor" style={{ padding: '20px', maxWidth: '800px' }}>
            <h2>Edit Images: {title}</h2>
            <p style={{ color: '#666', marginBottom: '30px' }}>
                Manage the images for this program page.
            </p>

            <div style={{ marginBottom: '40px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <h3>Hero Image (Top Banner)</h3>

                    {/* iOS Style Toggle Switch */}
                    <div
                        onClick={() => setIsSynced(!isSynced)}
                        style={{
                            display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '10px'
                        }}
                    >
                        <span style={{ fontWeight: 'bold', fontSize: '14px', color: isSynced ? '#4CAF50' : '#888' }}>
                            {isSynced ? 'SYNC ON' : 'SYNC OFF'}
                        </span>
                        <div style={{
                            position: 'relative',
                            width: '50px',
                            height: '28px',
                            backgroundColor: isSynced ? '#2196F3' : '#ccc',
                            borderRadius: '30px',
                            transition: 'background-color 0.3s',
                            boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.2)'
                        }}>
                            <div style={{
                                position: 'absolute',
                                top: '3px',
                                left: isSynced ? '25px' : '3px',
                                width: '22px',
                                height: '22px',
                                backgroundColor: 'white',
                                borderRadius: '50%',
                                transition: 'left 0.3s ease',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                            }}></div>
                        </div>
                    </div>
                </div>

                {isSynced ? (
                    <div style={{ backgroundColor: '#e3f2fd', color: '#0d47a1', padding: '15px', borderRadius: '5px', marginBottom: '20px', borderLeft: '4px solid #2196f3' }}>
                        <strong>Synced with Homepage</strong>
                        <br />
                        The image below is loaded from the Homepage "Our Programs" card. Saving changes here will update <strong>both</strong> the Program Page Hero and the Homepage.
                    </div>
                ) : (
                    <div style={{ backgroundColor: '#f5f5f5', color: '#666', padding: '15px', borderRadius: '5px', marginBottom: '20px', borderLeft: '4px solid #999' }}>
                        <strong>Independent Mode</strong>
                        <br />
                        Changes here will <strong>only</strong> affect this Program Page. The Homepage will remain unchanged.
                    </div>
                )}

                <ImageEditor
                    key={isSynced ? 'synced' : 'independent'} // Force re-mount when mode changes
                    sectionId={`program_${programId}_${isSynced ? 'image' : 'hero'}`} // 'image' is the shared Homepage key, 'hero' is independent
                    title={isSynced ? "Shared Image Editor" : "Hero Image Editor (Independent)"}
                    showPositionControl={true}
                    onSaveOverride={handleHeroSave}
                />
            </div>

            <div style={{ marginBottom: '40px', borderTop: '1px solid #eee', paddingTop: '30px' }}>
                <h3>Internal Page Images</h3>
                <p style={{ fontSize: '0.9em', color: '#666', marginBottom: '20px' }}>
                    These images appear inside the page content.
                </p>

                <div style={{ marginBottom: '30px' }}>
                    <ImageEditor
                        sectionId={`program_${programId}_internal_1`}
                        title="Detail Image 1 (Side)"
                        showPositionControl={true}
                    />
                </div>

                {/* Legacy/Optional second internal image */}
                {/* <div style={{ marginBottom: '30px' }}>
                    <ImageEditor
                        sectionId={`program_${programId}_internal_2`}
                        title="Detail Image 2 (Bottom)"
                        showPositionControl={true}
                    />
                </div> */}
            </div>

            <div style={{ marginBottom: '40px', borderTop: '1px solid #eee', paddingTop: '30px' }}>
                <h3>Carousel / Grid Images (5 Items)</h3>
                <p style={{ fontSize: '0.9em', color: '#666', marginBottom: '20px' }}>
                    These 5 images appear in the grid at the bottom of the page.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
                    {[1, 2, 3, 4, 5].map(num => (
                        <div key={num}>
                            <ImageEditor
                                sectionId={`program_${programId}_carousel_${num}`}
                                title={`Grid Image ${num}`}
                                showPositionControl={true}
                                aspectRatio="1 / 1" // Force Square (1:1) for grid items
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div >
    );
};

export default ProgramContentEditor;
