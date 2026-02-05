import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ManageSchedule = () => {
    const [scheduleItems, setScheduleItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        day: 'Monday',
        time_range: '',
        class_name: '',
        description: '',
        category: 'adults'
    });
    const [editingId, setEditingId] = useState(null);

    const apiBaseUrl = ''; // Relative path for Vercel/Prod

    const fetchSchedule = async () => {
        try {
            const res = await axios.get(`${apiBaseUrl}/api/schedule`);
            console.log("Fetched schedule items:", res.data);
            setScheduleItems(res.data);
        } catch (err) {
            console.error("Error fetching schedule:", err);
            if (err.response) console.error("Response:", err.response.status, err.response.data);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSchedule();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleTimeChange = (e) => {
        let value = e.target.value;
        // Auto-format 3 or 4 digits to Time (e.g. 900 -> 9:00, 1000 -> 10:00)
        // Uses word boundaries to avoid affecting parts of other words
        value = value.replace(/\b(\d{1,2})(\d{2})\b/g, '$1:$2');
        setFormData({ ...formData, [e.target.name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await axios.put(`${apiBaseUrl}/api/schedule/${editingId}`, formData, { withCredentials: true });
            } else {
                await axios.post(`${apiBaseUrl}/api/schedule`, formData, { withCredentials: true });
            }
            fetchSchedule();
            resetForm();
        } catch (err) {
            console.error("Error saving schedule item:", err);
            if (err.response) {
                console.error("Save Error Response:", err.response.status, err.response.data);
                alert(`Error saving: ${err.response.data.message || err.response.statusText}`);
            } else {
                alert('Error saving schedule item. Check console.');
            }
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure?')) return;
        try {
            await axios.delete(`${apiBaseUrl}/api/schedule/${id}`, { withCredentials: true });
            fetchSchedule();
        } catch (err) {
            alert('Error deleting item');
        }
    };

    const handleEdit = (item) => {
        setFormData({
            day: item.day,
            time_range: item.time_range,
            class_name: item.class_name,
            description: item.description || '',
            category: item.category || 'adults'
        });
        setEditingId(item.id);
    };

    const resetForm = () => {
        setFormData({
            day: 'Monday',
            time_range: '',
            class_name: '',
            description: '',
            category: 'adults'
        });
        setEditingId(null);
    };

    return (
        <div style={{ padding: '20px' }}>
            <h1>Manage Schedule</h1>

            <form onSubmit={handleSubmit} style={{ marginBottom: '40px', background: '#222', padding: '20px', borderRadius: '8px' }}>
                <h3>{editingId ? 'Edit Item' : 'Add New Class'}</h3>
                <div style={{ display: 'grid', gap: '10px', gridTemplateColumns: '1fr 1fr' }}>
                    <select name="day" value={formData.day} onChange={handleChange} style={{ padding: '8px' }}>
                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => (
                            <option key={d} value={d}>{d}</option>
                        ))}
                    </select>
                    <input name="time_range" placeholder="Time Range (e.g. 10:00 AM - 11:00 AM)" value={formData.time_range} onChange={handleTimeChange} required style={{ padding: '8px' }} />
                    <input name="class_name" placeholder="Class Name" value={formData.class_name} onChange={handleChange} required style={{ padding: '8px' }} />
                    <select name="category" value={formData.category} onChange={handleChange} style={{ padding: '8px' }}>
                        <option value="adults">Adults</option>
                        <option value="kids">Kids</option>
                        <option value="wrestling">Wrestling</option>
                        <option value="private">Private</option>
                    </select>
                </div>
                <textarea name="description" placeholder="Description (Optional)" value={formData.description} onChange={handleChange} style={{ width: '100%', marginTop: '10px', padding: '8px', minHeight: '60px' }} />
                <div style={{ marginTop: '10px' }}>
                    <button type="submit" className="btn-red-effect" style={{ marginRight: '10px' }}>{editingId ? 'Update' : 'Add'}</button>
                    {editingId && <button type="button" onClick={resetForm} style={{ padding: '10px' }}>Cancel</button>}
                </div>
            </form>

            {loading ? <p>Loading...</p> : (
                <div style={{ overflowX: 'auto', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.3)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', color: '#e0e0e0', background: '#1a1a1a' }}>
                        <thead>
                            <tr style={{ background: '#333', borderBottom: '2px solid #555' }}>
                                <th style={{ padding: '12px 15px', textAlign: 'left', fontWeight: 'bold', color: '#fff' }}>Day</th>
                                <th style={{ padding: '12px 15px', textAlign: 'left', fontWeight: 'bold', color: '#fff' }}>Time</th>
                                <th style={{ padding: '12px 15px', textAlign: 'left', fontWeight: 'bold', color: '#fff' }}>Class</th>
                                <th style={{ padding: '12px 15px', textAlign: 'left', fontWeight: 'bold', color: '#fff' }}>Category</th>
                                <th style={{ padding: '12px 15px', textAlign: 'right', fontWeight: 'bold', color: '#fff' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {scheduleItems.map(item => (
                                <tr key={item.id} style={{ borderBottom: '1px solid #333', background: '#1a1a1a' }}>
                                    <td style={{ padding: '12px 15px' }}>{item.day}</td>
                                    <td style={{ padding: '12px 15px', color: '#c5a35c' }}>{item.time_range}</td>
                                    <td style={{ padding: '12px 15px', fontWeight: '500' }}>{item.class_name}</td>
                                    <td style={{ padding: '12px 15px' }}>
                                        <span style={{
                                            padding: '4px 8px', borderRadius: '4px', fontSize: '12px', textTransform: 'uppercase', fontWeight: 'bold',
                                            background: item.category === 'kids' ? 'rgba(33, 150, 243, 0.2)' :
                                                item.category === 'adults' ? 'rgba(76, 175, 80, 0.2)' :
                                                    item.category === 'private' ? 'rgba(156, 39, 176, 0.2)' : '#444',
                                            color: item.category === 'kids' ? '#64b5f6' :
                                                item.category === 'adults' ? '#81c784' :
                                                    item.category === 'private' ? '#ba68c8' : '#ccc'
                                        }}>
                                            {item.category}
                                        </span>
                                    </td>
                                    <td style={{ padding: '12px 15px', textAlign: 'right' }}>
                                        <button onClick={() => handleEdit(item)} style={{ marginRight: '10px', cursor: 'pointer', background: 'transparent', border: '1px solid #666', color: '#fff', padding: '5px 10px', borderRadius: '4px' }}>Edit</button>
                                        <button onClick={() => handleDelete(item.id)} style={{ color: '#ff4444', cursor: 'pointer', background: 'transparent', border: '1px solid #ff4444', padding: '5px 10px', borderRadius: '4px' }}>Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default ManageSchedule;
