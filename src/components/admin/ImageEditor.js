
import React, { useState, useEffect } from 'react';
import axios from 'axios';

import { ResizableBox } from 'react-resizable';
import ImageLibrary from './ImageLibrary';
import './ImageEditor.css';

const ImageEditor = ({ sectionId, title, showPositionControl = false, onSaveOverride }) => {
  // Determine if this section requires a fixed aspect ratio context
  const getFixedRatio = (id) => {
    if (id.includes('instructor')) return '4 / 5'; // Portrait for instructors
    if (id.includes('logo')) return '1 / 1';       // Square for logos
    // Default to 16:9 for everything else (Programs, Welcome, Homepage, etc.)
    // This provides the "Specific Size" behavior the user expects for headers/heroes.
    return '16 / 9';
  };

  const fixedRatio = getFixedRatio(sectionId);

  const [currentImageUrl, setCurrentImageUrl] = useState(null);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);

  // Position is stored as Pixels (for Fixed Frame mode). Default 0,0.
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [aspectRatio, setAspectRatio] = useState(fixedRatio || '16 / 9');
  const [objectFit, setObjectFit] = useState('cover'); // 'cover' or 'contain'
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Local box size state for resize handles
  const [boxSize, setBoxSize] = useState(() => {
    let w = 600;
    let h = 337.5;
    // Use fixedRatio if available, else standard 16/9
    const initialRatio = fixedRatio || '16 / 9';

    if (typeof initialRatio === 'string') {
      const [rw, rh] = initialRatio.split('/').map(Number);
      if (rw && rh) h = w / (rw / rh);
    } else if (typeof initialRatio === 'number') {
      h = w / initialRatio;
    }
    return { width: w, height: h };
  });


  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [postLink, setPostLink] = useState('');


  const apiBaseUrl = '';

  useEffect(() => {
    const fetchCurrentImage = async () => {
      try {
        const response = await axios.get(`${apiBaseUrl}/api/content/${sectionId}`, { withCredentials: true });
        if (response.data && response.data.content_value) {
          try {
            const content = JSON.parse(response.data.content_value);
            setCurrentImageUrl(content.url || response.data.content_value);
            if (content.postLink) setPostLink(content.postLink);

            const parsedZoom = parseFloat(content.zoom);
            setZoom(!isNaN(parsedZoom) && parsedZoom > 0 ? parsedZoom : 1);

            if (!fixedRatio && content.aspectRatio) {
              setAspectRatio(content.aspectRatio);
            }
            if (content.objectFit) {
              setObjectFit(content.objectFit);
            }

            // Extract Position Coords (Percentages 0-100)
            if (content.coords) {
              const { x, y } = content.coords;
              if (typeof x === 'number' && typeof y === 'number') {
                setPosition({ x, y });
              } else {
                setPosition({ x: 50, y: 50 });
              }
            } else {
              setPosition({ x: 50, y: 50 });
            }
            // SYNC RESIZABLE BOX FROM SAVED STATE
            // 1. Zoom -> Box Size
            if (content.zoom) {
              const z = parseFloat(content.zoom) || 1;
              setBoxSize(prev => ({
                width: 600 * z,
                height: (600 * z) / (16 / 9) // Simplification, ideally use aspect ratio
              }));
            }

            // 2. Coords -> Editor Pos (Pixels)
            // Formula: pos% is from 0 (left-aligned) to 100 (right-aligned).
            // When Left-Aligned (0%), pixel offset is 0? No, wait.
            // If dragging, Left=0 means Left edge is at Left Frame -> 0%.
            // Left = (Frame - Box) (Negative max) means Right edge is at Right Frame -> 100%.

            // Equation: PixelX = (PercentX / 100) * (FrameW - BoxW)
            // Note: (FrameW - BoxW) is usually negative if zoomed in.

            if (content.coords && content.zoom) {
              const safeX = content.coords.x ?? 50;
              const safeY = content.coords.y ?? 50;

              const z = parseFloat(content.zoom) || 1;
              const currentBoxW = 600 * z;
              const currentBoxH = (600 * z) / (16 / 9);

              const frameW = 600;
              const frameH = 600 / (16 / 9); // Or fixed ratio height

              // Only apply offset if box > frame
              const maxOffsetX = frameW - currentBoxW;
              const maxOffsetY = frameH - currentBoxH;

              let initX = 0;
              let initY = 0;

              if (maxOffsetX < 0) initX = (safeX / 100) * maxOffsetX;
              if (maxOffsetY < 0) initY = (safeY / 100) * maxOffsetY;

              setEditorPos({ x: initX, y: initY });
            } else {
              setEditorPos({ x: 0, y: 0 });
            }
          } catch (e) {
            setCurrentImageUrl(response.data.content_value);
            setEditorPos({ x: 0, y: 0 }); // Default
          }
        }
      } catch (error) {
        if (error.response && error.response.status !== 404) {
          console.error(`Error fetching content for ${sectionId}:`, error);
        }
      }
    };
    fetchCurrentImage();
  }, [sectionId, apiBaseUrl, fixedRatio]);

  const isDragging = React.useRef(false);

  // RE-INSERTED HANDLERS (With ResizableBox Logic)
  // We don't need manual mouse listeners if we use ResizableBox's draggable features or a wrapper.
  // BUT, to keep the "Pan" logic smooth with the handles, we might want a Draggable wrapper.
  // Let's use a simple distinct translation state for the Editor Visuals.

  // Editor-specific state (Pixels)
  const [editorPos, setEditorPos] = useState({ x: 0, y: 0 });

  // Sync incoming percentage coords to editor pixels on load
  useEffect(() => {
    // 50% 50% -> 0px 0px (Center)
    // 0% (Left) -> Positive X? No, if we see Left side, image moved Right.
    // Let's assume a simplified mapped model for the editor ease-of-use
    // We'll trust the "Zoom + Pan" model for now.
    // Actually, to support the user's "Free Move", we just let them drag the box.
    // We won't try to perfect-sync the legacy pixels perfectly, we'll start flavored at 0,0
    setEditorPos({ x: 0, y: 0 });
  }, [sectionId]);

  const onResize = (event, { size }) => {
    setBoxSize({ width: size.width, height: size.height });
    // Update zoom based on width change (Base 600)
    const newZoom = size.width / 600;
    setZoom(newZoom);
  };

  // Removed unused onDragStop


  // Clean up unused listeners from previous step
  useEffect(() => {
    return () => { };
  }, []);

  const handleSave = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setStatusMessage('Saving...');
    setMessageType('');

    let imageUrl = currentImageUrl;

    try {
      if (selectedFile) {
        setStatusMessage('Uploading image...');
        const formData = new FormData();
        formData.append('image', selectedFile);
        const uploadResponse = await axios.post(`${apiBaseUrl}/api/upload`, formData, { withCredentials: true });
        imageUrl = uploadResponse.data.url;
      }

      if (!imageUrl && !postLink) {
        setStatusMessage('Please select an image.');
        setIsLoading(false);
        return;
      }

      const contentToSave = {
        url: imageUrl,
        coords: position,
        imageSize: boxSize, // { width, height } of the image
        postLink: postLink,
        zoom: zoom,
        aspectRatio: aspectRatio,
        objectFit: objectFit,
        mode: 'fixed-frame-v2' // Flag to tell frontend to use new rendering logic
      };

      // Support custom save logic (e.g. for Syncing multiple keys)
      if (onSaveOverride) {
        await onSaveOverride(imageUrl, contentToSave);
      } else {
        // Default Save
        await axios.put(`${apiBaseUrl}/api/content/${sectionId}`, {
          content_type: 'image_details',
          content_value: JSON.stringify(contentToSave),
        }, { withCredentials: true });
      }

      setCurrentImageUrl(imageUrl);
      setStatusMessage('Image updated successfully!');
      setMessageType('success');
      setSelectedFile(null);
    } catch (error) {
      console.error("FULL SAVE ERROR:", error);
      if (error.response) {
        console.error("Response Data:", error.response.data);
        console.error("Response Status:", error.response.status);
        console.error("Response Headers:", error.response.headers);
      } else if (error.request) {
        console.error("No Response Received:", error.request);
      } else {
        console.error("Error Message:", error.message);
      }

      setStatusMessage(`Error saving image. ${error.response?.data?.error || error.message || ''}`);
      setMessageType('error');

      if (error.response && error.response.status === 401) {
        alert("Your session has expired or you are not logged in. Please log in again.");
        window.location.href = '/login';
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      // Create local preview URL
      const previewUrl = URL.createObjectURL(file);
      setCurrentImageUrl(previewUrl);
      setStatusMessage('Click "Save" to upload and apply changes.');
      setMessageType('info');
    }
  };
  const handleZoomChange = (e) => setZoom(parseFloat(e.target.value));

  const handleSelectFromLibrary = (url) => {
    setCurrentImageUrl(url);
    setIsLibraryOpen(false);
  };

  // Manual Step Controls
  const handleStepMove = (direction) => {
    const step = 10;
    setPosition(prev => {
      let newX = prev.x;
      let newY = prev.y;

      if (direction === 'up') newY = prev.y - step;
      if (direction === 'down') newY = prev.y + step;
      if (direction === 'left') newX = prev.x - step;
      if (direction === 'right') newX = prev.x + step;

      return { x: newX, y: newY };
    });
  };



  const renderToolbar = () => (
    <div className="editor-toolbar">
      <div className="editor-tools-group">
        <div className="editor-tools-group">
          <label className="btn" title="Upload New Image" style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', background: '#e0e0e0', color: '#333', border: '1px solid #ccc' }}>
            <input type="file" onChange={handleFileChange} accept="image/*,video/mp4,video/webm,video/quicktime" style={{ display: 'none' }} />
            <svg viewBox="0 0 24 24" style={{ width: 18, height: 18, fill: 'currentColor' }}><path d="M9 3L5 7h3v7h2V7h3L9 3zm3 18c4.42 0 8-3.58 8-8 0-1.85-.63-3.65-1.69-5.11l1.42-1.42c1.46 2.05 2.27 4.54 2.27 7.53 0 6.63-5.37 12-12 12-3.03 0-5.78-.99-8.03-2.67l1.79-1.79C6.44 20.26 8.59 21 11 21zm-9-9c0-1.92.59-3.71 1.59-5.22L2.17 5.37C.77 7.73 0 10.28 0 13c0 6.63 5.37 12 12 12 .98 0 1.94-.12 2.87-.34l-1.93-1.93C11.39 22.9 10.2 23 9 23v-2z" /></svg>
            <span>Upload Image</span>
          </label>
          <button className="btn" onClick={() => setIsLibraryOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#e0e0e0', color: '#333', border: '1px solid #ccc' }}>
            <svg viewBox="0 0 24 24" style={{ width: 18, height: 18, fill: 'currentColor' }}><path d="M22 16V4c0-1.1-.9-2-2-2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2zm-11-4l2.03 2.71L16 11l4 5H8l3-4zM2 6v14c0 1.1.9 2 2 2h14v-2H4V6H2z" /></svg>
            <span>Library</span>
          </button>
        </div>
      </div>

      <div className="editor-tools-group">
        <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#7d2ae8', background: 'rgba(125, 42, 232, 0.1)', padding: '4px 8px', borderRadius: '4px', whiteSpace: 'nowrap' }}>
          FIXED FRAME: {fixedRatio}
        </span>
      </div>

      <div className="editor-tools-group">
        <button
          className={`icon-btn ${objectFit === 'contain' ? 'active' : ''}`}
          onClick={() => setObjectFit(prev => prev === 'cover' ? 'contain' : 'cover')}
          title={objectFit === 'cover' ? "Fit Info (No Crop)" : "Cover (Crop to Fill)"}
          style={{ fontSize: '12px', width: 'auto', padding: '0 8px' }}
        >
          {objectFit === 'cover' ? 'Crop' : 'Fit'}
        </button>
      </div>

      <div className="editor-tools-group">
        <div className="zoom-control">
          <span style={{ fontSize: '10px', color: '#666', marginRight: 4 }}>Zoom</span>
          <input type="range" min="0.5" max="3.0" step="0.05" value={zoom} onChange={handleZoomChange} className="zoom-slider" />
        </div>
      </div>

      <div className="editor-tools-group">
        <button className="icon-btn" onClick={() => setPosition({ x: 50, y: 50 })} title="Recenter Image" style={{ display: 'flex', alignItems: 'center', gap: '5px', width: 'auto', padding: '0 10px' }}>
          <span style={{ fontSize: '12px' }}>Reset Focus</span>
        </button>
      </div>

      <div className="editor-tools-group" style={{ flexGrow: 1, justifyContent: 'flex-end', borderRight: 'none', gap: '10px' }}>
        <div style={{ display: 'flex', gap: '2px', marginRight: '10px' }}>
          <button onClick={() => handleStepMove('left')} className="btn-mini">←</button>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <button onClick={() => handleStepMove('up')} className="btn-mini">↑</button>
            <button onClick={() => handleStepMove('down')} className="btn-mini">↓</button>
          </div>
          <button onClick={() => handleStepMove('right')} className="btn-mini">→</button>
        </div>

        <button
          className="btn"
          onClick={() => setShowPreviewModal(true)}
          disabled={!currentImageUrl}
          style={{ background: '#95a5a6', marginRight: '10px' }}
        >
          Preview Context
        </button>
        <button className="btn" onClick={handleSave} disabled={isLoading} style={{ padding: '6px 12px', fontSize: '14px' }}>
          {isLoading ? 'Saving...' : 'Save'}
        </button>
      </div>
    </div >
  );

  const ContextualPreviewModal = () => {
    if (!showPreviewModal) return null;

    // Mock Content for Previews
    const mockContent = {
      title: title || "Sample Title",
      subtitle: "Experience world-class training in a supportive environment.",
      description: "This is how your image will look in the actual context of the page. The layout, aspect ratio, and positioning mimic the live site.",
    };

    let PreviewContent = null;

    // 1. Welcome Section Preview
    if (sectionId.includes('welcome') || sectionId.includes('homepage')) {
      const numericRatio = (() => {
        if (typeof aspectRatio === 'string') {
          const [w, h] = aspectRatio.split('/').map(Number);
          return w / h;
        }
        return 16 / 9;
      })();
      const maxHeightVh = 70;
      const maxWidthVh = maxHeightVh * numericRatio;

      PreviewContent = (
        <div className="welcome-section" style={{ position: 'relative', background: '#fff', padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
          <div className="welcome-container" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="welcome-text-content" style={{ padding: '20px', background: '#f9f9f9' }}>
              <h3>{mockContent.title}</h3>
              <p>{mockContent.subtitle}</p>
              <p>{mockContent.description}</p>
            </div>
            <div className="welcome-image-wrapper" style={{
              overflow: 'hidden',
              aspectRatio: aspectRatio,
              width: '100%',
              maxWidth: `min(100%, ${maxWidthVh}vh)`,
              margin: '0 auto',
              position: 'relative',
              border: '2px dashed #007bff' // Visual aid for preview boundary
            }}>
              <img
                src={currentImageUrl}
                alt="Preview"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: objectFit,
                  objectPosition: `${position.x}% ${position.y}%`,
                  transform: `scale(${zoom})`,
                  transformOrigin: `${position.x}% ${position.y}%`,
                  position: 'relative',
                  zIndex: 1
                }}
              />
              <img
                src={currentImageUrl}
                alt=""
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(20px) brightness(0.7)', transform: 'scale(1.1)', zIndex: 0 }}
              />
            </div>
          </div>
        </div>
      );
    }
    // 2. Program Hero Preview (Kids, Adult, etc.)
    else if (sectionId.includes('program') || sectionId.includes('hero')) {
      PreviewContent = (
        <section className="program-hero" style={{ aspectRatio: aspectRatio || '16/9', minHeight: '300px', position: 'relative', overflow: 'hidden' }}>
          <div className="program-hero-bg-wrapper" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}>
            <img
              src={currentImageUrl}
              alt="Hero Preview"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: `${position.x}% ${position.y}%`,
                transform: `scale(${zoom})`,
                transformOrigin: `${position.x}% ${position.y}%`,
              }}
            />
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', pointerEvents: 'none' }}></div>
          </div>
          <h1 className="program-hero-title" style={{ position: 'relative', zIndex: 1, color: 'white', textAlign: 'center', marginTop: '10%' }}>{title}</h1>
        </section>
      );
    }
    else {
      // Generic Fallback
      PreviewContent = (
        <div style={{ textAlign: 'center' }}>
          <h3>Generic Preview</h3>
          <div style={{ maxWidth: '600px', margin: '0 auto', overflow: 'hidden', aspectRatio: aspectRatio || '16/9', border: '1px solid #ccc' }}>
            <img
              src={currentImageUrl}
              alt="Generic Preview"
              style={{
                width: '100%',
                height: '100%',
                objectFit: objectFit,
                objectPosition: `${position.x}% ${position.y}%`,
                transform: `scale(${zoom})`,
                transformOrigin: `${position.x}% ${position.y}%`,
              }}
            />
          </div>
        </div>
      );
    }


    return (
      <div className="preview-modal-overlay" style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px'
      }}>
        <div className="preview-modal-content" style={{
          background: '#fff', width: '90%', maxWidth: '1100px', maxHeight: '90vh',
          overflowY: 'auto', borderRadius: '8px', position: 'relative',
          display: 'flex', flexDirection: 'column'
        }}>
          <div className="preview-modal-header" style={{
            padding: '15px 20px', borderBottom: '1px solid #eee',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            background: '#f8f9fa'
          }}>
            <h3 style={{ margin: 0 }}>Context Preview: {title}</h3>
            <button
              onClick={() => setShowPreviewModal(false)}
              style={{ background: 'transparent', border: 'none', fontSize: '24px', cursor: 'pointer', lineHeight: 1 }}
            >
              &times;
            </button>
          </div>

          <div className="preview-modal-body" style={{ padding: '20px', flexGrow: 1, background: '#e9ecef' }}>
            {PreviewContent}
          </div>

          <div className="preview-modal-footer" style={{
            padding: '15px 20px', borderTop: '1px solid #eee',
            background: '#fff', textAlign: 'right'
          }}>
            <small style={{ color: '#666', marginRight: '10px' }}>This is a simulation. Actual rendering depends on screen size.</small>
            <button className="btn" onClick={() => setShowPreviewModal(false)}>Close Preview</button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="image-editor">
      {isLibraryOpen && (
        <ImageLibrary
          onSelect={handleSelectFromLibrary}
          onClose={() => setIsLibraryOpen(false)}
        />
      )}

      {/* Contextual Preview Modal */}
      <ContextualPreviewModal />

      {renderToolbar()}

      {(sectionId.includes('instagram') || sectionId.includes('program') || sectionId.includes('link')) && (
        <div style={{ padding: '0 15px 10px', backgroundColor: '#f8f9fa', borderBottom: '1px solid #e0e0e0' }}>
          <input
            type="text"
            placeholder="Paste destination link (optional)..."
            value={postLink}
            onChange={(e) => setPostLink(e.target.value)}
            style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #ced4da', fontSize: '13px' }}
          />
        </div>
      )}

      {/* Manual Image URL Input (Fallback/Debug) */}
      <div style={{ padding: '10px 15px', backgroundColor: '#f0f0f0', borderBottom: '1px solid #e0e0e0', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#555' }}>Image URL:</label>
        <input
          type="text"
          placeholder="Paste direct image URL here (Gif/Jpg/Png)..."
          value={currentImageUrl || ''}
          onChange={(e) => setCurrentImageUrl(e.target.value)}
          style={{ flexGrow: 1, padding: '6px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '12px', fontFamily: 'monospace' }}
        />
      </div>

      <h3 style={{ padding: '10px 15px', borderBottom: '1px solid #eee' }}>{title}</h3>
      <div className="image-preview draggable-container editor-stage">
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center', backgroundColor: '#eee', padding: '40px' }}>
          {/* 1. THE FIXED FRAME (Crop Window) - Always 16:9 or fixedRatio */}
          {/* 1. THE FIXED FRAME (Crop Window) - Always 16:9 or fixedRatio */}
          <div
            style={{
              position: 'relative',
              width: '600px',
              height: `${600 / (fixedRatio === '4 / 5' ? 0.8 : fixedRatio === '1 / 1' ? 1 : (16 / 9))}px`,
              border: '2px dashed #7d2ae8', /* The "Blue Arrows" boundary */
              backgroundColor: '#ccc',
              overflow: 'hidden', // Masking content outside the frame
            }}
          >
            {/* 2. THE RESIZABLE IMAGE BUTTONS/HANDLES RESTORED */}
            {currentImageUrl ? (
              // Wrapper Div for Dragging? We use React-Draggable implicit in some libs or just custom?
              // Since we want "Canva", ResizableBox is best.
              // We need a Draggable wrapper around ResizableBox to allow moving the whole thing?
              // The user wants to "Move" (Translate) and "Resize" (Scale).
              // Let's simulate this: ResizableBox handles SIZE. 
              // A parent div handles DRAG.

              <div
                className="draggable-wrapper"
                style={{
                  display: 'inline-block',
                  transform: `translate(${editorPos.x}px, ${editorPos.y}px)`, // Visual Move
                  cursor: 'move',
                  position: 'relative'
                }}
                onMouseDown={(e) => {
                  // Simple custom drag implementation for the wrapper
                  if (e.target.classList.contains('canva-handle')) return; // Don't drag if clicking resize handle

                  const startX = e.clientX;
                  const startY = e.clientY;
                  const startPosX = editorPos.x;
                  const startPosY = editorPos.y;

                  const onMove = (moveEvent) => {
                    const dx = moveEvent.clientX - startX;
                    const dy = moveEvent.clientY - startY;
                    let newX = startPosX + dx;
                    let newY = startPosY + dy;

                    // Constrain Drag? - No, user wants "Free Move", but math relies on it acting like object-position
                    // object-position clamps 0-100%.
                    // So we should clamp Pixel Drag to (Frame - Box) ... 0.

                    const frameW = 600;
                    const frameH = boxSize.height * (frameW / boxSize.width); // approx relative frame? No. 
                    // The Frame is fixed size in DOM.
                    // Frame Width is 600px.
                    // Frame Height depends on FixedRatio.
                    const realFrameH = 600 / (fixedRatio === '4 / 5' ? 0.8 : fixedRatio === '1 / 1' ? 1 : (16 / 9));

                    const maxOffsetX = frameW - boxSize.width;
                    const maxOffsetY = realFrameH - boxSize.height;

                    // If Box is smaller than Frame, we can't really "pan" it in object-position logic usually...
                    // But if Box is larger (Zoom > 1), offsets are negative.
                    // 0 is Max Left (Showing Left Side), maxOffsetX is Max Right (Showing Right Side).
                    // Actually 0 is Left edge at 0.
                    // Frame - Box is Right edge at Frame Right.

                    // Clamp
                    if (maxOffsetX < 0) newX = Math.min(0, Math.max(maxOffsetX, newX));
                    else newX = 0; // Center or align left if smaller? Let's just pin 0 for safety if no zoom.

                    if (maxOffsetY < 0) newY = Math.min(0, Math.max(maxOffsetY, newY));
                    else newY = 0;

                    setEditorPos({ x: newX, y: newY });

                    // Live Update Percentages
                    // Percent = (Pos / maxOffset) * 100
                    let pX = 50;
                    let pY = 50;

                    if (maxOffsetX < 0) pX = (newX / maxOffsetX) * 100;
                    if (maxOffsetY < 0) pY = (newY / maxOffsetY) * 100;

                    setPosition({
                      x: Math.max(0, Math.min(100, pX)),
                      y: Math.max(0, Math.min(100, pY))
                    });
                  };

                  const onUp = () => {
                    window.removeEventListener('mousemove', onMove);
                    window.removeEventListener('mouseup', onUp);
                  };
                  window.addEventListener('mousemove', onMove);
                  window.addEventListener('mouseup', onUp);
                }}
              >
                <ResizableBox
                  width={boxSize.width}
                  height={boxSize.height}
                  lockAspectRatio={false} // User requested "Free" resize (wider/longer)
                  onResize={onResize}
                  handle={(h, ref) => <span className={`canva-handle canva-handle-${h}`} ref={ref} />}
                  draggableOpts={{ grid: [1, 1] }}
                  minConstraints={[50, 50]}
                  maxConstraints={[2000, 2000]}
                  axis="both"
                  style={{ position: 'relative' }}
                >
                  {/* DETECT VIDEO VS IMAGE */}
                  {(currentImageUrl.match(/\.(mp4|webm|mov)$/i) || (selectedFile && selectedFile.type && selectedFile.type.startsWith('video/'))) ? (
                    <video
                      src={currentImageUrl}
                      autoPlay
                      loop
                      muted
                      playsInline
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover', // WYSIWYG: Use cover to match frontend
                        pointerEvents: 'none',
                        display: 'block'
                      }}
                    />
                  ) : (
                    <img
                      src={currentImageUrl}
                      alt="Editable"
                      crossOrigin="anonymous"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover', // WYSIWYG
                        pointerEvents: 'none', // Prevent img drag ghost
                        display: 'block'
                      }}
                    />
                  )}
                </ResizableBox>
              </div>
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
                No Image Select
              </div>
            )}
          </div>
        </div>
      </div>

      {statusMessage && <p className={`status-message ${messageType}`} style={{ padding: '0 15px 10px' }}>{statusMessage}</p>}
    </div >
  );
};

export default ImageEditor;
