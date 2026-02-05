import React, { useState, useEffect } from 'react';
import './UpdateInstructors.css';
import ReactQuill from 'react-quill-new';
import Draggable from 'react-draggable';
import 'react-quill-new/dist/quill.snow.css'; // Import Quill stylest

// ... imports remain the same

const API_URL = '/api/instructors';

const UpdateInstructors = () => {
  const [instructors, setInstructors] = useState([]);
  const [formData, setFormData] = useState({ name: '', bio: '', image: '', zoom: 1 });
  const [coords, setCoords] = useState({ x: 0, y: 0 }); // New state for coords
  const [editingId, setEditingId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const nodeRef = React.useRef(null); // Ref for draggable

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const uploadFormData = new FormData();
    uploadFormData.append('image', file);

    fetch('/api/upload', {
      method: 'POST',
      body: uploadFormData,
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setFormData({ ...formData, image: data.url });
        } else {
          console.error('Upload failed:', data.message);
        }
        setUploading(false);
      })
      .catch(err => {
        console.error('Error uploading file:', err);
        setUploading(false);
      });
  };

  useEffect(() => {
    fetch(API_URL)
      .then(res => res.json())
      .then(data => {
        // Parse image JSON if necessary for initial load, though mainly used in handleEdit
        setInstructors(data);
      })
      .catch(err => console.error("Error fetching instructors:", err));
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleZoomChange = (e) => {
    setFormData({ ...formData, zoom: parseFloat(e.target.value) });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const method = editingId ? 'PUT' : 'POST';
    const url = editingId ? `${API_URL}/${editingId}` : API_URL;

    // Save coords along with zoom
    const imagePayload = JSON.stringify({
      url: formData.image,
      zoom: formData.zoom,
      coords: coords
    });

    const payload = {
      ...formData,
      image: imagePayload
    };

    fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then(res => res.json())
      .then(updatedOrNewInstructor => {
        if (editingId) {
          setInstructors(instructors.map(i => i.id === editingId ? updatedOrNewInstructor : i));
        } else {
          setInstructors([...instructors, updatedOrNewInstructor]);
        }
        resetForm();
      })
      .catch(err => console.error("Error saving instructor:", err));
  };

  const handleEdit = (instructor) => {
    setEditingId(instructor.id);
    let imageUrl = instructor.image;
    let zoomVal = 1;
    let coordsVal = { x: 0, y: 0 };

    try {
      const parsed = JSON.parse(instructor.image);
      if (parsed.url) imageUrl = parsed.url;
      if (parsed.zoom) zoomVal = parsed.zoom;
      if (parsed.coords) coordsVal = parsed.coords;
    } catch (e) {
      // Is raw string
    }

    setFormData({ name: instructor.name, bio: instructor.bio, image: imageUrl, zoom: zoomVal });
    setCoords(coordsVal);
  };

  // ... (handleDelete remains same) ...
  const handleDelete = (id) => {
    fetch(`${API_URL}/${id}`, { method: 'DELETE' })
      .then(() => {
        setInstructors(instructors.filter(i => i.id !== id));
      })
      .catch(err => console.error("Error deleting instructor:", err));
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({ name: '', bio: '', image: '', zoom: 1 });
    setCoords({ x: 0, y: 0 });
  };

  const parseImageForDisplay = (imgData) => {
    try {
      const parsed = JSON.parse(imgData);
      return parsed.url || imgData;
    } catch (e) {
      return imgData;
    }
  }

  return (
    <div className="admin-container">
      <h1>Manage Instructors</h1>
      <div className="admin-form-card">
        <h2>{editingId ? 'Edit Instructor' : 'Add New Instructor'}</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Instructor Name"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
          <ReactQuill
            theme="snow"
            value={formData.bio || ''}
            onChange={(content) => setFormData(prev => ({ ...prev, bio: content }))}
            modules={{
              toolbar: [
                [{ 'header': [1, 2, 3, false] }],
                ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                ['link'],
                ['clean']
              ],
            }}
          />
          <div className="image-upload-container">
            <label htmlFor="image-upload">Instructor Image:</label>
            <input
              id="image-upload"
              type="file"
              name="imageFile"
              onChange={handleFileChange}
              accept="image/jpeg, image/png"
            />
            {uploading && <p>Uploading...</p>}
            {formData.image && (
              <div style={{ marginTop: '10px' }}>
                <p>Preview (Drag to Pan):</p>
                <div className="image-mask-container" style={{ position: 'relative', overflow: 'hidden' }}>
                  {/* Background Blur */}
                  <img
                    src={formData.image}
                    alt=""
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      filter: 'blur(20px) brightness(0.7)',
                      transform: 'scale(1.1)',
                      zIndex: 0
                    }}
                  />
                  <Draggable
                    nodeRef={nodeRef}
                    position={coords}
                    onDrag={(e, data) => setCoords({ x: data.x, y: data.y })}
                  >
                    <div ref={nodeRef} style={{ width: '100%', cursor: 'grab', position: 'relative', zIndex: 1 }}>
                      <img
                        src={formData.image}
                        alt="Instructor Preview"
                        draggable="false"
                        style={{
                          width: '100%',
                          transform: `scale(${formData.zoom})`,
                          transformOrigin: 'center center',
                          transition: 'transform 0.1s'
                        }}
                      />
                    </div>
                  </Draggable>
                </div>
              </div>
            )}
            <div style={{ marginTop: '10px' }}>
              <label style={{ marginRight: '10px', fontSize: '0.9rem' }}>Zoom: {formData.zoom}x</label>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={formData.zoom}
                onChange={handleZoomChange}
                style={{ verticalAlign: 'middle', width: '200px' }}
              />
            </div>
          </div>
          <div className="form-buttons">
            <button type="submit">{editingId ? 'Update Instructor' : 'Add Instructor'}</button>
            {editingId && <button type="button" onClick={resetForm} className="cancel-btn">Cancel</button>}
          </div>
        </form>
      </div>

      <div className="instructors-list-container">
        <h2>Current Instructors</h2>
        <div className="instructors-list">
          {instructors.map(instructor => (
            <div key={instructor.id} className="instructor-list-item">
              <img src={parseImageForDisplay(instructor.image)} alt={instructor.name} className="instructor-list-image" />
              <span className="instructor-list-name">{instructor.name}</span>
              <div className="instructor-list-actions">
                <button onClick={() => handleEdit(instructor)}>Edit</button>
                <button onClick={() => handleDelete(instructor.id)} className="delete-btn">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UpdateInstructors;
