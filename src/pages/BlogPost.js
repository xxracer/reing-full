import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import './BlogPage.css'; // Reusing styles

const BlogPost = () => {
    const { slug } = useParams();
    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBlog = async () => {
            try {
                const response = await axios.get(`/api/blogs/${slug}`);
                setBlog(response.data);
            } catch (error) {
                console.error('Error fetching blog:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchBlog();
    }, [slug]);

    if (loading) return <div className="blog-page"><p>Loading...</p></div>;
    if (!blog) return <div className="blog-page"><p>Blog post not found.</p><Link to="/blog">Back to Blog</Link></div>;

    return (
        <div className="blog-page">
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <Link to="/blog" style={{ color: '#aaa', textDecoration: 'none', marginBottom: '20px', display: 'inline-block' }}>&larr; Back to Blog</Link>
                <h1 style={{ marginBottom: '10px' }}>{blog.title}</h1>
                <p style={{ color: '#aaa', marginBottom: '20px' }}>{new Date(blog.created_at).toLocaleDateString()}</p>

                {blog.image_url && (
                    blog.image_url.match(/\.(mp4|webm|mov)(\?|$)/i) ? (
                        <video
                            src={blog.image_url}
                            controls
                            style={{ width: '100%', borderRadius: '8px', marginBottom: '30px' }}
                        />
                    ) : (
                        <img
                            src={blog.image_url}
                            alt={blog.title}
                            style={{ width: '100%', borderRadius: '8px', marginBottom: '30px', objectFit: 'cover' }}
                        />
                    )
                )}

                <div className="blog-content-body" dangerouslySetInnerHTML={{ __html: blog.content }} />
            </div>
        </div>
    );
};

export default BlogPost;
