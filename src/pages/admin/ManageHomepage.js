import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ImageEditor from '../../components/admin/ImageEditor';
import VideoEditor from '../../components/admin/VideoEditor';

const ManageHomepage = () => {
  const [mediaType, setMediaType] = useState('images'); // 'images' or 'video'
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
      <h1>Manage Homepage</h1>
      <p>Here you can edit the content of the homepage.</p>

      <ImageEditor
        sectionId="homepage_main_image"
        title="Homepage Main Image (Fallback)"
        showPositionControl={true}
      />
      <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '-10px' }}>GIFs are supported. Use the dropdown to adjust the image position.</p>
      <VideoEditor
        sectionId="homepage_hero_video"
        title="Homepage Hero Video"
      />
      <ImageEditor
        sectionId="welcome_section_image"
        title="Welcome Section Image"
        showPositionControl={true}
      />
      <h2>Programs Section</h2>
      <ImageEditor
        sectionId="program_kids_image"
        title="Kids Program Image"
        showPositionControl={true}
      />
      <ImageEditor
        sectionId="program_homeschool_image"
        title="Homeschool Program Image"
        showPositionControl={true}
      />
      <ImageEditor
        sectionId="program_adult_image"
        title="Adult Program Image"
        showPositionControl={true}
      />
      <ImageEditor
        sectionId="program_fundamentals_image"
        title="Fundamentals Program Image"
        showPositionControl={true}
      />
      <ImageEditor
        sectionId="program_competition_image"
        title="Competition Training Image"
        showPositionControl={true}
      />
      <ImageEditor
        sectionId="program_private_lessons_image"
        title="Private Lessons Image"
        showPositionControl={true}
      />
      <ImageEditor
        sectionId="program_private_lessons_image"
        title="Private Lessons Image"
        showPositionControl={true}
      />
      <ImageEditor
        sectionId="program_wrestling_image"
        title="Wrestling Program Thumbnail"
        showPositionControl={true}
      />
      <h2>Wrestling Page Images</h2>
      <ImageEditor
        sectionId="wrestling_hero_image"
        title="Wrestling Page Hero"
        showPositionControl={true}
      />
      <ImageEditor
        sectionId="wrestling_detail_1"
        title="Wrestling Detail Image 1"
        showPositionControl={true}
      />
      <ImageEditor
        sectionId="wrestling_detail_2"
        title="Wrestling Detail Image 2"
        showPositionControl={true}
      />
      <h2>Facility Section</h2>

      <div style={{
        padding: '15px',
        backgroundColor: '#f9f9f9',
        borderRadius: '8px',
        marginBottom: '20px',
        border: '1px solid #eee'
      }}>
        <h4 style={{ marginTop: 0 }}>Display Mode</h4>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
              type="radio"
              name="mediaType"
              value="images"
              checked={mediaType === 'images'}
              onChange={() => handleMediaTypeChange('images')}
            />
            <strong>Two Images</strong>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
              type="radio"
              name="mediaType"
              value="youtube"
              checked={mediaType === 'youtube'}
              onChange={() => handleMediaTypeChange('youtube')}
            />
            <strong>YouTube (16:9)</strong>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
              type="radio"
              name="mediaType"
              value="vertical"
              checked={mediaType === 'vertical'}
              onChange={() => handleMediaTypeChange('vertical')}
            />
            <strong>Vertical Video (IG Style)</strong>
          </label>
          {saveStatus && <span style={{ color: 'green', fontSize: '0.9rem', marginLeft: '10px' }}>{saveStatus}</span>}
        </div>
      </div>

      {mediaType === 'images' ? (
        <>
          <ImageEditor
            sectionId="facility_image_1"
            title="Facility Image 1"
            showPositionControl={true}
          />
          <ImageEditor
            sectionId="facility_image_2"
            title="Facility Image 2"
            showPositionControl={true}
          />
        </>
      ) : (
        <VideoEditor
          sectionId="facility_video"
          title={mediaType === 'youtube' ? "Facility YouTube Video (16:9)" : "Facility Vertical Video (9:16)"}
        />
      )}

      <h2>Instagram Section</h2>
      <p style={{ fontSize: '0.8rem', color: '#666' }}>Upload static images or GIFs for the Instagram feed.</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <ImageEditor sectionId="instagram_image_1" title="Insta Post 1" />
        <ImageEditor sectionId="instagram_image_2" title="Insta Post 2" />
        <ImageEditor sectionId="instagram_image_3" title="Insta Post 3" />
        <ImageEditor sectionId="instagram_image_4" title="Insta Post 4" />
        <ImageEditor sectionId="instagram_image_5" title="Insta Post 5" />
        <ImageEditor sectionId="instagram_image_6" title="Insta Post 6" />
      </div>
    </div>
  );
};

export default ManageHomepage;
