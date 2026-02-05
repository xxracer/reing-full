
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ImageLibrary.css';

const ImageLibrary = ({ onSelect, onClose }) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await axios.get('/api/images');
        setImages(response.data);
      } catch (err) {
        setError('Failed to load images.');
        console.error('Error fetching images:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchImages();
  }, []);

  const handleImageSelect = (imageUrl) => {
    onSelect(imageUrl);
  };

  const handleDeleteImage = async (url) => {
    if (!window.confirm('Are you sure you want to delete this image? This cannot be undone.')) return;

    try {
      await axios.delete('/api/images', { data: { url } });
      setImages(images.filter(img => img.image_url !== url));
    } catch (err) {
      console.error('Failed to delete image:', err);
      alert('Failed to delete image.');
    }
  };

  return (
    <div className="image-library-modal-backdrop">
      <div className="image-library-modal-content">
        <div className="image-library-header">
          <h2>Image Library</h2>
          <button onClick={onClose} className="close-button">&times;</button>
        </div>
        <div className="image-grid">
          {loading && <p>Loading images...</p>}
          {error && <p className="error-message">{error}</p>}
          {images.map(image => (
            <div key={image.id} className="image-thumbnail-wrapper" style={{ position: 'relative' }}>
              <div className="image-thumbnail" onClick={() => handleImageSelect(image.image_url)}>
                <img src={image.image_url} alt={`Library item ${image.id}`} />
              </div>
              <button
                className="delete-image-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteImage(image.image_url);
                }}
                title="Delete Image"
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ImageLibrary;
