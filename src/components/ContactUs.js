import React, { useState } from 'react';
import './ContactUs.css';

const ContactUs = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState(''); // '' | 'submitting' | 'success' | 'error'

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('submitting');

    let locationData = {};
    try {
      // Attempt to fetch IP location data
      const ipRes = await fetch('https://ipapi.co/json/');
      locationData = await ipRes.json();
    } catch (error) {
      console.error('Could not fetch location data:', error);
    }

    const payload = {
      ...formData,
      ip: locationData.ip,
      city: locationData.city,
      region: locationData.region,
      country: locationData.country_name,
      postal: locationData.postal,
      full_location_data: locationData // Send full object just in case
    };

    fetch('/api/send-message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setStatus('success');
          setFormData({ name: '', email: '', message: '' }); // Clear form
        } else {
          setStatus('error');
        }
      })
      .catch(() => {
        setStatus('error');
      });
  };

  return (
    <section id="contact" className="contact-us-section">
      <div className="contact-us-container">
        <div className="contact-map-container">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d13853.902979300916!2d-95.7506772!3d29.7638822!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8641279da5c05bd1%3A0x3fa330f3485a23b4!2sReign%20Jiu%20Jitsu!5e0!3m2!1ses!2sve!4v1759257523007!5m2!1ses!2sve"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Reign Jiu Jitsu Location"
          ></iframe>
        </div>
        <div className="contact-form-container">
          <h2 className="section-title">Contact Us</h2>
          <p className="contact-phone">
            Call or text us at <a href="tel:17134466008">(713) 446-6008</a>
          </p>
          {status === 'success' ? (
            <div className="success-message-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '300px', textAlign: 'center' }}>
              <div style={{ fontSize: '4rem', marginBottom: '10px' }}>✅</div>
              <h3 style={{ fontSize: '2rem', marginBottom: '10px', color: 'var(--text-primary)' }}>Thank You!</h3>
              <p style={{ fontSize: '1.2rem', marginBottom: '30px', color: 'var(--text-secondary)' }}>
                We have received your message.
              </p>

              <div style={{
                backgroundColor: 'white',
                padding: '20px',
                borderRadius: '12px',
                boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                width: '100%',
                maxWidth: '350px'
              }}>
                <p style={{
                  color: '#d32f2f',
                  fontWeight: 'bold',
                  fontSize: '1.2rem',
                  marginBottom: '15px',
                  textTransform: 'uppercase'
                }}>
                  For quicker response click here to text us now
                </p>
                <a
                  href="sms:+17134466008"
                  style={{
                    display: 'inline-block',
                    backgroundColor: '#d32f2f',
                    color: 'white',
                    padding: '12px 24px',
                    borderRadius: '30px',
                    textDecoration: 'none',
                    fontWeight: 'bold',
                    fontSize: '1.1rem',
                    boxShadow: '0 4px 6px rgba(211, 47, 47, 0.3)',
                    transition: 'transform 0.2s'
                  }}
                >
                  Text Us Now 💬
                </a>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                name="name"
                placeholder="Name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
              <textarea
                name="message"
                rows="5"
                placeholder="Message"
                value={formData.message}
                onChange={handleInputChange}
                required
              ></textarea>
              <button type="submit" className="submit-button" disabled={status === 'submitting'}>
                {status === 'submitting' ? 'Sending...' : 'Submit'}
              </button>
              {status === 'error' && <p className="status-message error">Something went wrong. Please try again.</p>}
            </form>
          )}
        </div>
      </div>
    </section>
  );
};

export default ContactUs;
