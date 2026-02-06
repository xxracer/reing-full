import React from 'react';
import './ImageCarousel.css';

const ImageCarousel = ({ images }) => {
    if (!images || images.length === 0) {
        return null;
    }

    // Ensure we display up to 5 images. 
    // If fewer, it's just a smaller grid. 
    // If more, we slice to 5 (or show all? User said "las 5 imagenes"). 
    // Let's safe slice to 5 to match description "chocolate bar of 5".
    const displayImages = images.slice(0, 5);

    return (
        <div className="images-grid-container">
            {displayImages.map((img, index) => (
                <div className="grid-image-item" key={index}>
                    <img src={img} alt={`Gallery ${index + 1}`} />
                </div>
            ))}
        </div>
    );
};

export default ImageCarousel;
