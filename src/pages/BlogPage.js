import React, { useEffect, useState } from 'react';
import axios from 'axios';
import FAQ from '../components/FAQ';
import './BlogPage.css';

const BlogPage = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await axios.get('/api/blogs');
        setBlogs(response.data);
      } catch (error) {
        console.error('Error fetching blogs:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  const pageFaqs = [
    {
      question: "What kind of topics does the Reign BJJ blog cover?",
      answer: "Our blog covers a wide range of topics, including expert technique breakdowns, self-defense strategies, fitness and weight loss tips, community news, and coverage of local tournaments."
    },
    {
      question: "Can I submit an article or suggest a topic for the blog?",
      answer: "We encourage community involvement! Please use our Contact Us page to submit content suggestions or inquire about guest contributions."
    }
  ];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": pageFaqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <div className="blog-page">
      <script type="application/ld+json">
        {JSON.stringify(faqSchema)}
      </script>
      <h1 style={{ marginBottom: '20px' }}>Our Blog</h1>
      <p style={{ marginBottom: '40px', fontSize: '18px', lineHeight: '1.7' }}>
        Our blog shares training tips, competition updates, and stories from our community. Articles cover topics such as beginner Jiu Jitsu near me, best martial arts for kids in Katy, and competition BJJ Houston. Follow our blog to stay inspired and informed.
      </p>

      {/* Featured Image (or latest blog image if available) */}
      <img
        src="https://placehold.co/900x400?text=Reign+BJJ+Blog"
        alt="Featured blog article"
        style={{ width: '100%', height: 'auto', borderRadius: '8px', marginBottom: '40px', objectFit: 'cover' }}
      />

      {loading ? (
        <p>Loading articles...</p>
      ) : (
        <div className="blog-grid">
          {blogs.length === 0 ? (
            <p>No articles found. Check back soon!</p>
          ) : (
            blogs.map(blog => (
              <div key={blog.id} className="blog-card">
                {blog.image_url && (
                  blog.image_url.match(/\.(mp4|webm|mov)(\?|$)/i) ? (
                    <video
                      src={blog.image_url}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="blog-image"
                      style={{ objectFit: 'cover' }}
                    />
                  ) : (
                    <img src={blog.image_url} alt={blog.title} className="blog-image" />
                  )
                )}
                <div className="blog-content">
                  <h3 className="blog-title">{blog.title}</h3>
                  <div className="blog-excerpt">
                    {blog.content.substring(0, 100)}...
                  </div>
                  <div className="blog-date">
                    {new Date(blog.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <div style={{ marginTop: '60px' }}>
        <FAQ faqData={pageFaqs} title="Blog FAQs" />
      </div>
    </div>
  );
};

export default BlogPage;