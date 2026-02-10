import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ManageBlog = () => {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        title: '',
        image_url: '',
        content: ''
    });
    const [editingId, setEditingId] = useState(null);

    const apiBaseUrl = '';

    const fetchBlogs = async () => {
        try {
            const res = await axios.get(`${apiBaseUrl}/api/blogs`);
            setBlogs(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBlogs();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await axios.put(`${apiBaseUrl}/api/blogs/${editingId}`, formData, { withCredentials: true });
            } else {
                await axios.post(`${apiBaseUrl}/api/blogs`, formData, { withCredentials: true });
            }
            fetchBlogs();
            resetForm();
        } catch (err) {
            alert('Error saving blog post');
            console.error(err);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure?')) return;
        try {
            await axios.delete(`${apiBaseUrl}/api/blogs/${id}`, { withCredentials: true });
            fetchBlogs();
        } catch (err) {
            alert('Error deleting blog');
        }
    };

    const handleEdit = (blog) => {
        setFormData({
            title: blog.title,
            image_url: blog.image_url || '',
            content: blog.content
        });
        setEditingId(blog.id);
    };

    const resetForm = () => {
        setFormData({
            title: '',
            image_url: '',
            content: ''
        });
        setEditingId(null);
    };

    return (
        <div style={{ padding: '20px' }}>
            <h1>Manage Blogs</h1>

            <form onSubmit={handleSubmit} style={{ marginBottom: '40px', background: '#222', padding: '20px', borderRadius: '8px' }}>
                <h3>{editingId ? 'Edit Post' : 'Create New Post'}</h3>
                <div style={{ display: 'grid', gap: '10px' }}>
                    <input name="title" placeholder="Blog Title" value={formData.title} onChange={handleChange} required style={{ padding: '8px', width: '100%' }} />
                    <input name="image_url" placeholder="Image URL (e.g. from Image Library or External)" value={formData.image_url} onChange={handleChange} style={{ padding: '8px', width: '100%' }} />
                    <textarea name="content" placeholder="Blog Content (HTML supported or plain text)" value={formData.content} onChange={handleChange} required style={{ padding: '8px', width: '100%', minHeight: '150px' }} />
                </div>
                <div style={{ marginTop: '10px' }}>
                    <button type="submit" className="btn-red-effect" style={{ marginRight: '10px' }}>{editingId ? 'Update' : 'Publish'}</button>
                    {editingId && <button type="button" onClick={resetForm} style={{ padding: '10px' }}>Cancel</button>}
                </div>
            </form>

            {loading ? <p>Loading...</p> : (
                <div style={{ display: 'grid', gap: '20px' }}>
                    {blogs.map(blog => (
                        <div key={blog.id} style={{ border: '1px solid #444', padding: '15px', borderRadius: '8px' }}>
                            <h4 style={{ margin: '0 0 10px' }}>{blog.title}</h4>
                            <p style={{ fontSize: '0.9em', color: '#aaa' }}>{new Date(blog.created_at).toLocaleDateString()}</p>
                            <div style={{ marginTop: '10px' }}>
                                <button onClick={() => handleEdit(blog)} style={{ marginRight: '10px', cursor: 'pointer' }}>Edit</button>
                                <button onClick={() => handleDelete(blog.id)} style={{ color: 'red', cursor: 'pointer' }}>Delete</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ManageBlog;
