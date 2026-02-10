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

    const isVideo = (url) => {
        if (typeof url !== 'string') return false;
        return url && url.match(/\.(mp4|webm|mov|quicktime)(\?|$)/i);
    };

    return (
        <div className="images-grid-container">
            {displayImages.map((item, index) => {
                let src = item;
                let positionStyle = {};
                let zoomStyle = {};

                if (typeof item === 'object' && item !== null) {
                    src = item.url || '';
                    if (item.coords) {
                        positionStyle = { objectPosition: `${item.coords.x}% ${item.coords.y}%` };
                    }
                    if (item.zoom && item.zoom !== 1) {
                        zoomStyle = { transform: `scale(${item.zoom})` };
                    }
                }

                if (!src) {
                    return <div className="grid-image-item" key={index} style={{ backgroundColor: '#f0f0f0' }}></div>;
                }

                return (
                    <div className="grid-image-item" key={index} style={{ overflow: 'hidden' }}>
                        {isVideo(src) ? (
                            <video
                                src={src}
                                muted
                                loop
                                autoPlay
                                playsInline
                                style={{ width: '100%', height: '100%', objectFit: 'cover', ...positionStyle, ...zoomStyle }}
                            />
                        ) : (
                            <img
                                src={src}
                                alt={`Gallery ${index + 1}`}
                                style={{ ...positionStyle, ...zoomStyle }}
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default ImageCarousel;
