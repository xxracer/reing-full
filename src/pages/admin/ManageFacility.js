import React from 'react';
import ImageEditor from '../../components/admin/ImageEditor';

const ManageFacility = () => {
    return (
        <div>
            <h1>Manage Facility Page</h1>
            <p>Edit the images displayed on the "Our Facility" page. You can upload photos or videos (MP4/WebM).</p>

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
        </div>
    );
};

export default ManageFacility;
