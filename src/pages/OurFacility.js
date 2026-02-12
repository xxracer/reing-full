import React from 'react';
import FAQ from '../components/FAQ';

const OurFacilityPage = () => {
  const [image1, setImage1] = React.useState({ url: 'https://static.wixstatic.com/media/c5947c_475cbf851e054bdc915bfcbb7fd2b704~mv2.png', coords: { x: 50, y: 50 }, zoom: 1 });
  const [image2, setImage2] = React.useState({ url: 'https://static.wixstatic.com/media/c5947c_b40f2d46adab45ae967e41fd1868925b~mv2.png', coords: { x: 50, y: 50 }, zoom: 1 });
  const apiBaseUrl = '';

  React.useEffect(() => {
    const fetchContent = async (id, setter) => {
      try {
        const response = await fetch(`${apiBaseUrl}/api/content/${id}`);
        const data = await response.json();
        if (data && data.content_value) {
          try {
            const content = JSON.parse(data.content_value);
            setter({
              url: content.url || data.content_value,
              coords: content.coords || { x: 50, y: 50 },
              zoom: content.zoom || 1
            });
          } catch (e) {
            setter(prev => ({ ...prev, url: data.content_value }));
          }
        }
      } catch (error) {
        console.error(`Error fetching ${id}`, error);
      }
    };

    fetchContent('facility_image_1', setImage1);
    fetchContent('facility_image_2', setImage2);
  }, []);

  const renderMedia = (mediaState, alt) => {
    const { url, coords, zoom } = mediaState;
    if (!url) return null;

    const isVideo = url.match(/\.(mp4|webm|mov)(\?|$)/i);

    const style = {
      width: '100%',
      maxWidth: '440px',
      height: '300px', // Fixed height container for consistency
      borderRadius: '8px',
      overflow: 'hidden',
      position: 'relative',
      backgroundColor: '#f0f0f0'
    };

    const mediaStyle = {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      objectPosition: `${coords?.x ?? 50}% ${coords?.y ?? 50}%`,
      transform: `scale(${zoom || 1})`,
      transformOrigin: `${coords?.x ?? 50}% ${coords?.y ?? 50}%`,
      pointerEvents: 'none'
    };

    return (
      <div style={style}>
        {isVideo ? (
          <video
            src={url}
            autoPlay
            loop
            muted
            playsInline
            style={mediaStyle}
          />
        ) : (
          <img
            src={url}
            alt={alt}
            style={mediaStyle}
          />
        )}
      </div>
    );
  };

  const pageFaqs = [
    {
      question: "How often are the training mats cleaned?",
      answer: "We maintain germ-free facilities, prioritizing hygiene by cleaning the mats daily and thoroughly, adhering to a high standard of safety and cleanliness."
    },
    {
      question: "Does the facility have locker rooms or showers?",
      answer: "Yes, we provide modern amenities, including dedicated changing areas and showers, for the convenience of our students."
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
    <div style={{ paddingTop: '120px', paddingBottom: '60px', textAlign: 'center', maxWidth: '900px', margin: '0 auto' }}>
      <script type="application/ld+json">
        {JSON.stringify(faqSchema)}
      </script>
      <h1 style={{ marginBottom: '20px' }}>Our Facility</h1>
      <p style={{ marginBottom: '40px', fontSize: '18px', lineHeight: '1.7' }}>
        Our academy is equipped with high-quality mats, clean locker rooms, and a welcoming environment. Parents and students alike love the safe and professional setting. More than just a gym, Reign is a community-driven martial arts academy in Katy, TX.
      </p>

      <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', marginBottom: '60px' }}>
        {renderMedia(image1, "Facility interior wide shot")}
        {renderMedia(image2, "Training equipment / mats close-up")}
      </div>

      <FAQ faqData={pageFaqs} title="Facility FAQs" />
    </div>
  );
};

export default OurFacilityPage;