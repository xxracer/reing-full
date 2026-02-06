import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ImageLibrary from './ImageLibrary';
import './ImageEditor.css';

const ImageEditor = ({ sectionId, title, onSaveOverride, aspectRatio: propsAspectRatio }) => {
  // 1. Aspect Ratio Logic
  const getFixedRatio = (id) => {
    if (propsAspectRatio) {
      return typeof propsAspectRatio === 'number' ? `${propsAspectRatio} / 1` : propsAspectRatio;
    }
    if (id.includes('instructor')) return '4 / 5';
    if (id.includes('logo')) return '1 / 1';
    return '16 / 9';
  };
  const ratioString = getFixedRatio(sectionId);
  const numericRatio = (() => {
    const [w, h] = ratioString.split('/').map(Number);
    return w / h;
  })();

  // 2. State
  const [currentImageUrl, setCurrentImageUrl] = useState(null);
  const [position, setPosition] = useState({ x: 50, y: 50 }); // Center default
  const [zoom, setZoom] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [postLink, setPostLink] = useState('');
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);

  const apiBaseUrl = '';
  const containerRef = useRef(null);
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const positionStart = useRef({ x: 50, y: 50 });

  // 3. Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${apiBaseUrl}/api/content/${sectionId}`, { withCredentials: true });
        if (response.data && response.data.content_value) {
          try {
            const content = JSON.parse(response.data.content_value);
            setCurrentImageUrl(content.url || response.data.content_value);
            if (content.postLink) setPostLink(content.postLink);
            if (content.zoom) setZoom(parseFloat(content.zoom));
            if (content.coords) setPosition(content.coords);
          } catch (e) {
            setCurrentImageUrl(response.data.content_value);
          }
        }
      } catch (e) { }
    };
    fetchData();
  }, [sectionId]);

  // 4. Save Logic
  const handleSave = async () => {
    if (isLoading || !currentImageUrl) return;
    setIsLoading(true);
    setStatusMessage('Saving...');

    try {
      const contentToSave = {
        url: currentImageUrl,
        coords: position,
        zoom: zoom,
        postLink: postLink,
        aspectRatio: ratioString,
        mode: 'simple-v3'
      };

      if (onSaveOverride) {
        await onSaveOverride(currentImageUrl, contentToSave);
      } else {
        await axios.put(`${apiBaseUrl}/api/content/${sectionId}`, {
          content_type: 'image_details',
          content_value: JSON.stringify(contentToSave)
        }, { withCredentials: true });
      }
      setStatusMessage('Saved!');
      setMessageType('success');
      setTimeout(() => setStatusMessage(''), 3000);
    } catch (error) {
      setStatusMessage('Error saving.');
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setStatusMessage('Uploading...');
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await axios.post(`${apiBaseUrl}/api/upload`, formData, { withCredentials: true });
      setCurrentImageUrl(res.data.url);
      // Reset position on new image
      setPosition({ x: 50, y: 50 });
      setZoom(1);
      setStatusMessage('Image uploaded. Drag to adjust.');
      setMessageType('info');
    } catch (err) {
      setStatusMessage('Upload failed.');
      setMessageType('error');
    }
  };

  // 5. Drag Interaction
  const handleMouseDown = (e) => {
    e.preventDefault();
    isDragging.current = true;
    dragStart.current = { x: e.clientX, y: e.clientY };
    positionStart.current = { ...position };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e) => {
    if (!isDragging.current) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;

    // SENSITIVITY:
    // Moving 1px on screen != 1% of object position.
    // It depends on how "zoomed" we are relative to the container.
    // Simplifying: 1 pixel drag = 0.2% change.
    // Inverted logic: Dragging Image Right means "viewing more of the Left".
    // Object Position 0% = Left, 100% = Right.
    // If I drag image RIGHT, I want to see the left side... wait.
    // Dragging Image RIGHT >> The image moves right inside the box.
    // This reveals the LEFT side content.
    // revealing LEFT means position % goes DOWN (towards 0).
    // So +dx (Right) = -d% (Decrease).

    // Sensitivity factor
    const sensitivity = 0.15; // Slower feels more precise

    let newX = positionStart.current.x - (dx * sensitivity);
    let newY = positionStart.current.y - (dy * sensitivity);

    // Clamp? Maybe allow slight overscroll to ensure edges can be reached
    newX = Math.max(0, Math.min(100, newX));
    newY = Math.max(0, Math.min(100, newY));

    setPosition({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
  };

  const handleSelectFromLibrary = (url) => {
    setCurrentImageUrl(url);
    // Reset defaults when picking new image
    setPosition({ x: 50, y: 50 });
    setZoom(1);
    setIsLibraryOpen(false);
    setStatusMessage('Image selected from Library. Drag to adjust.');
    setMessageType('info');
  };

  const handleRemove = async () => {
    if (!window.confirm("Are you sure you want to remove this image?")) return;

    setCurrentImageUrl(null);
    setPosition({ x: 50, y: 50 });
    setZoom(1);

    // Save the empty state immediately? Or wait for Save?
    // Better to wait for Save to be consistent, but user asked to "reset".
    // Let's just clear the state so they can see "No Image" and then they can Save or pick another.
    setStatusMessage('Image removed. Click Save to persist.');
    setMessageType('info');
  };

  return (
    <div className="simple-editor-container">
      {isLibraryOpen && (
        <ImageLibrary
          onSelect={handleSelectFromLibrary}
          onClose={() => setIsLibraryOpen(false)}
        />
      )}

      {/* HEADER */}
      <div className="editor-header">
        <h4>{title}</h4>
        <div className="editor-actions">
          <button className="btn-library" onClick={() => setIsLibraryOpen(true)}>
            Library
          </button>
          <label className="btn-upload">
            Upload
            <input type="file" onChange={handleFileUpload} accept="image/*" hidden />
          </label>
          {currentImageUrl && (
            <button className="btn-remove" onClick={handleRemove} title="Remove Image">
              Remove
            </button>
          )}
          <button className="btn-save" onClick={handleSave} disabled={isLoading}>
            {isLoading ? 'SAVING...' : 'SAVE'}
          </button>
        </div>
      </div>

      {/* FEEDBACK */}
      {statusMessage && <div className={`status-msg ${messageType}`}>{statusMessage}</div>}

      {/* VIEWPORT AREA */}
      <div className="editor-viewport-wrapper">
        <div
          className="editor-viewport"
          ref={containerRef}
          style={{
            aspectRatio: `${numericRatio}`,
            maxWidth: '1000px', // Allow full width
            width: '100%'
          }}
          onMouseDown={handleMouseDown}
        >
          {currentImageUrl ? (
            currentImageUrl.match(/\.(mp4|webm|mov)$/i) ? (
              <video
                src={currentImageUrl} autoPlay loop muted
                style={{
                  width: '100%', height: '100%',
                  objectFit: 'cover',
                  objectPosition: `${position.x}% ${position.y}%`,
                  transform: `scale(${zoom})`,
                  pointerEvents: 'none' // Still allow drag on parent
                }}
              />
            ) : (
              <img
                src={currentImageUrl}
                alt="Editable"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: `${position.x}% ${position.y}%`,
                  transform: `scale(${zoom})`,
                  pointerEvents: 'none',
                  userSelect: 'none'
                }}
              />
            )
          ) : (
            <div className="empty-placeholder">
              <div style={{ textAlign: 'center' }}>
                <p>No Image Selected</p>
                <button className="btn-library-small" onClick={() => setIsLibraryOpen(true)}>Select from Library</button>
              </div>
            </div>
          )}

          {/* INSTRUCTION OVERLAY (Fades out if image exists) */}
          {currentImageUrl && (
            <div className="drag-hint">DRAG TO MOVE</div>
          )}
        </div>
      </div>

      {/* CONTROLS BELOW */}
      {currentImageUrl && (
        <div className="editor-controls">
          <div className="control-group">
            <label>Zoom:</label>
            <input
              type="range"
              min="1"
              max="3"
              step="0.05"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
            />
          </div>
          {/* Optional Link Input */}
          {(sectionId.includes('program') || sectionId.includes('instagram')) && (
            <div className="control-group link-input">
              <input
                type="text"
                placeholder="Optional: Link URL (e.g. https://...)"
                value={postLink}
                onChange={(e) => setPostLink(e.target.value)}
              />
            </div>
          )}
        </div>
      )}

      {/* LIBRARY MODAL (Hidden by default, simple toggle if needed) */}
      {/* Keeps code clean: Can add "Library" button back if user explicitly asks for recycling images */}
    </div>
  );
};

export default ImageEditor;
