import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ImageLibrary from './ImageLibrary';
import './ImageEditor.css';

const ImageEditor = ({ sectionId, title, showPositionControl = false, onSaveOverride, aspectRatio: propsAspectRatio }) => {
  // Determine if this section requires a fixed aspect ratio context
  const getFixedRatio = (id) => {
    if (propsAspectRatio) {
      // Handle number input (e.g. 1 becomes "1 / 1") or return string as is
      return typeof propsAspectRatio === 'number' ? `${propsAspectRatio} / 1` : propsAspectRatio;
    }
    if (id.includes('instructor')) return '4 / 5'; // Portrait for instructors
    if (id.includes('logo')) return '1 / 1';       // Square for logos
    // Default to 16:9 for everything else (Programs, Welcome, Homepage, etc.)
    return '16 / 9';
  };

  const fixedRatio = getFixedRatio(sectionId);

  const [currentImageUrl, setCurrentImageUrl] = useState(null);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);

  // Position is stored as Percentages (0-100) for object-position
  // NOW ALLOWING "Out of bounds" to simulate Canva free-move: e.g. -50 to 150.
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [zoom, setZoom] = useState(1);
  const [aspectRatio, setAspectRatio] = useState(fixedRatio || '16 / 9');
  const [objectFit, setObjectFit] = useState('cover'); // 'cover' or 'contain'
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [postLink, setPostLink] = useState('');

  const apiBaseUrl = ''; // Relative

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
          } catch (e) {
            setCurrentImageUrl(response.data.content_value);
            setPosition({ x: 50, y: 50 });
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

  // Clean up
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
        postLink: postLink,
        zoom: zoom,
        aspectRatio: aspectRatio,
        objectFit: objectFit,
        mode: 'fixed-frame-v2'
      };

      if (onSaveOverride) {
        await onSaveOverride(imageUrl, contentToSave);
      } else {
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
      setStatusMessage(`Error saving image. ${error.response?.data?.error || error.message || ''}`);
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
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

  const handleStepMove = (direction) => {
    const step = 5;
    setPosition(prev => {
      let newX = prev.x;
      let newY = prev.y;
      if (direction === 'up') newY = prev.y - step; // Logic: Up -> P% decreases? Wait. Up means Image Moves Up? 
      // If Image Moves Up, we see Bottom part. Bottom part is High %.
      // Actually step move is minor. Let's fix Drag first.

      // Canvas Logic: "Up" button moves Image Up.
      // Image Up means Y decreases (visually).
      // Visually Up means revealing Bottom? No.
      // Moving Image Up means Top Edge moves Up.
      // This reveals MORE of the Bottom.
      // Revealing Bottom means Percent INCREASES towards 100%.

      // Let's stick to simple +/-.
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
        <label className="btn" title="Upload New Image" style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', background: '#e0e0e0', color: '#333', border: '1px solid #ccc' }}>
          <input type="file" onChange={handleFileChange} accept="image/*,video/mp4,video/webm,video/quicktime" style={{ display: 'none' }} />
          <span>Upload Image</span>
        </label>
        <button className="btn" onClick={() => setIsLibraryOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#e0e0e0', color: '#333', border: '1px solid #ccc' }}>
          <span>Library</span>
        </button>
      </div>

      <div className="editor-tools-group">
        <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#7d2ae8', background: 'rgba(125, 42, 232, 0.1)', padding: '4px 8px', borderRadius: '4px', whiteSpace: 'nowrap' }}>
          FIXED FRAME: {fixedRatio}
        </span>
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
    const numericRatio = (() => {
      if (typeof aspectRatio === 'string') {
        const [w, h] = aspectRatio.split('/').map(Number);
        return w / h;
      }
      return 16 / 9;
    })();
    const w = 600;
    const h = w / numericRatio;

    return (
      <div className="preview-modal-overlay" style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
      }}>
        <div className="preview-modal-content" style={{ background: '#fff', padding: '20px', borderRadius: '8px' }}>
          <h3>Quick Preview</h3>
          <div style={{ width: `${w}px`, height: `${h}px`, overflow: 'hidden', border: '1px solid #ccc', margin: '0 auto' }}>
            <img src={currentImageUrl} alt="Preview" style={{
              width: '100%', height: '100%',
              objectFit: objectFit,
              objectPosition: `${position.x}% ${position.y}%`,
              transform: `scale(${zoom})`,
              transformOrigin: `${position.x}% ${position.y}%`
            }} />
          </div>
          <button onClick={() => setShowPreviewModal(false)} style={{ marginTop: '20px' }}>Close</button>
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
      <ContextualPreviewModal />
      {renderToolbar()}

      {(sectionId.includes('instagram') || sectionId.includes('program') || sectionId.includes('link')) && (
        <div style={{ padding: '0 15px 10px', backgroundColor: '#f8f9fa', borderBottom: '1px solid #e0e0e0' }}>
          <input type="text" placeholder="Paste destination link (optional)..." value={postLink} onChange={(e) => setPostLink(e.target.value)} style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #ced4da', fontSize: '13px' }} />
        </div>
      )}

      <div style={{ padding: '10px 15px', backgroundColor: '#f0f0f0', borderBottom: '1px solid #e0e0e0', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#555' }}>Image URL:</label>
        <input type="text" placeholder="Paste URL..." value={currentImageUrl || ''} onChange={(e) => setCurrentImageUrl(e.target.value)} style={{ flexGrow: 1, padding: '6px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '12px', fontFamily: 'monospace' }} />
      </div>

      <h3 style={{ padding: '10px 15px', borderBottom: '1px solid #eee' }}>{title}</h3>
      <div className="image-preview draggable-container editor-stage">
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center', backgroundColor: '#eee', padding: '60px', overflow: 'hidden' }}>

          <div style={{ position: 'relative', width: '600px', height: `${600 / (fixedRatio === '4 / 5' ? 0.8 : fixedRatio === '1 / 1' ? 1 : (16 / 9))}px` }}>

            {/* 1. LAYER: MASKED IMAGE */}
            <div
              style={{
                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                border: '1px solid #eee',
                backgroundColor: '#ccc',
                overflow: 'hidden',
                pointerEvents: 'none',
                zIndex: 1
              }}
            >
              {currentImageUrl ? (
                currentImageUrl.match(/\.(mp4|webm|mov)$/i) ? (
                  <video src={currentImageUrl} autoPlay loop muted playsInline style={{
                    width: '100%', height: '100%',
                    objectFit: objectFit,
                    objectPosition: `${position.x}% ${position.y}%`,
                    transform: `scale(${zoom})`,
                    transformOrigin: `${position.x}% ${position.y}%`,
                  }}
                  />
                ) : (
                  <img src={currentImageUrl} alt="Editable" style={{
                    width: '100%', height: '100%',
                    objectFit: objectFit,
                    objectPosition: `${position.x}% ${position.y}%`,
                    transform: `scale(${zoom})`,
                    transformOrigin: `${position.x}% ${position.y}%`,
                  }}
                  />
                )
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>No Image Selected</div>
              )}
            </div>

            {/* 2. LAYER: CONTROL OVERLAY (GHOST BOX) */}
            {currentImageUrl && (
              (() => {
                const frameW = 600;
                const frameH = 600 / (fixedRatio === '4 / 5' ? 0.8 : fixedRatio === '1 / 1' ? 1 : (16 / 9));

                const w = frameW * zoom;
                const h = frameH * zoom;

                // Calculate Offset based on Position Percent
                // We use standard Object Position formula:
                // Offset = (FrameSize - ImageSize) * (Percent / 100)
                const maxOffX = frameW - w;
                const maxOffY = frameH - h; // Typically negative if zoomed in

                const offsetX = maxOffX * (position.x / 100);
                const offsetY = maxOffY * (position.y / 100);

                return (
                  <div
                    className="control-overlay"
                    style={{
                      position: 'absolute',
                      left: offsetX,
                      top: offsetY,
                      width: w,
                      height: h,
                      border: '2px solid #7d2ae8',
                      zIndex: 10,
                      cursor: 'move',
                      boxShadow: '0 0 0 9999px rgba(0,0,0,0.5)' // Dim the outside
                    }}
                    onMouseDown={(e) => {
                      // DRAG (PAN) LOGIC
                      e.stopPropagation();
                      if (e.target.dataset.handle) return;

                      e.preventDefault();
                      const startX = e.clientX;
                      const startY = e.clientY;
                      const startP = { ...position };

                      // Capture initial scale of movement. 
                      // Sensitivity: If I move 10px, how much percent is that?
                      // It depends on maxOffX.

                      const onMove = (moveEvent) => {
                        const dx = moveEvent.clientX - startX;
                        const dy = moveEvent.clientY - startY;

                        // We want "Object Move" feel: Drag Right -> Image Moves Right.
                        // Image moves right means Offset INCREASES (e.g. -500 -> -490).
                        // Offset increase means... what for Percent?
                        // If MaxOffset is Negative (-1000).
                        // -500 / -1000 = 0.5 (50%).
                        // -490 / -1000 = 0.49 (49%).
                        // So Drag Right -> Percent Decreases. 
                        // This is correct because 0% is Left-Aligned (Image dragged fully Right).

                        // BUT what if MaxOffset is 0 (Zoom 1)?
                        // Then division by zero.

                        // Fallback for Zoom 1 or near 1:
                        // We still want to allow panning to create whitespace.
                        // So we simulate a virtual frame?
                        // No, if maxOffset is 0, mathematically position% is irrelevant for object-fit.
                        // But we want to allow it.
                        // Let's force a minimum "virtual" drag range of say 100px?
                        // Or better: Just apply the delta to the current computed offset, then re-calculate percent
                        // pretending the range is valid.

                        const effectiveMaxOffX = Math.abs(maxOffX) < 1 ? -100 : maxOffX; // Force a range if none exists
                        const effectiveMaxOffY = Math.abs(maxOffY) < 1 ? -100 : maxOffY;

                        const currentOffX = effectiveMaxOffX * (startP.x / 100);
                        const currentOffY = effectiveMaxOffY * (startP.y / 100);

                        const newOffX = currentOffX + dx;
                        const newOffY = currentOffY + dy;

                        let newPx = (newOffX / effectiveMaxOffX) * 100;
                        let newPy = (newOffY / effectiveMaxOffY) * 100;

                        // CLAMP RELAXED: Allow -50 to 150 for "Free Move" feel
                        newPx = Math.max(-100, Math.min(200, newPx));
                        newPy = Math.max(-100, Math.min(200, newPy));

                        setPosition({ x: newPx, y: newPy });
                      };
                      const onUp = () => {
                        window.removeEventListener('mousemove', onMove);
                        window.removeEventListener('mouseup', onUp);
                      };
                      window.addEventListener('mousemove', onMove);
                      window.addEventListener('mouseup', onUp);
                    }}
                  >
                    {/* RESIZE HANDLES */}
                    {['nw', 'ne', 'sw', 'se'].map(cursor => (
                      <div
                        key={cursor}
                        data-handle={cursor}
                        style={{
                          position: 'absolute',
                          width: '12px', height: '12px',
                          backgroundColor: '#fff',
                          border: '2px solid #7d2ae8',
                          borderRadius: '50%',
                          zIndex: 11,
                          cursor: `${cursor}-resize`,
                          top: cursor.includes('n') ? -6 : 'auto',
                          bottom: cursor.includes('s') ? -6 : 'auto',
                          left: cursor.includes('w') ? -6 : 'auto',
                          right: cursor.includes('e') ? -6 : 'auto',
                        }}
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          const startX = e.clientX;
                          const startW = w;
                          const isLeft = cursor.includes('w');

                          const onResize = (moveEvent) => {
                            const dx = moveEvent.clientX - startX;
                            // Dragging Right (+dx):
                            // If Right Handle: Width increases. (+10)
                            // If Left Handle: Width decreases? No.
                            // Dragging Left Handle Left (-dx): Width Increases.
                            const deltaW = isLeft ? -dx : dx;

                            const newW = Math.max(frameW * 0.5, startW + deltaW); // Min width 50% scale
                            const newZoom = newW / frameW;

                            if (newZoom > 5) return;
                            setZoom(newZoom);

                            // Note: Standard object-position center-zoom applies.
                          };
                          const onUp = () => {
                            window.removeEventListener('mousemove', onResize);
                            window.removeEventListener('mouseup', onUp);
                          };
                          window.addEventListener('mousemove', onResize);
                          window.addEventListener('mouseup', onUp);
                        }}
                      />
                    ))}
                    <div style={{ position: 'absolute', left: '50%', top: '50%', width: 4, height: 4, background: 'rgba(255,255,255,0.5)', borderRadius: '50%', transform: 'translate(-50%, -50%)' }} />
                  </div>
                );
              })()
            )}
          </div>
        </div>
      </div>
      {statusMessage && <p className={`status-message ${messageType}`}>{statusMessage}</p>}
    </div>
  );
};

export default ImageEditor;
